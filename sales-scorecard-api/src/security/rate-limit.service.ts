import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  blockDurationMs?: number; // How long to block after exceeding limit
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

@Injectable()
export class RateLimitService {
  private readonly rateLimitStore = new Map<string, RateLimitEntry>();
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    blockDurationMs: 60 * 60 * 1000, // 1 hour
  };

  private readonly endpointConfigs: Map<string, RateLimitConfig> = new Map([
    // Authentication endpoints - stricter limits
    ['/auth/login', { windowMs: 15 * 60 * 1000, maxRequests: 5, blockDurationMs: 60 * 60 * 1000 }],
    ['/auth/register', { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 24 * 60 * 60 * 1000 }],
    ['/auth/forgot-password', { windowMs: 60 * 60 * 1000, maxRequests: 3, blockDurationMs: 60 * 60 * 1000 }],
    
    // Export endpoints - moderate limits
    ['/export', { windowMs: 60 * 60 * 1000, maxRequests: 10, blockDurationMs: 60 * 60 * 1000 }],
    
    // General API endpoints
    ['/api', { windowMs: 15 * 60 * 1000, maxRequests: 1000, blockDurationMs: 60 * 60 * 1000 }],
  ]);

  constructor(private configService: ConfigService) {
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanupExpiredEntries(), 5 * 60 * 1000);
  }

  async checkRateLimit(
    identifier: string,
    endpoint?: string,
    success: boolean = true,
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const config = this.getConfigForEndpoint(endpoint);
    const key = this.generateKey(identifier, endpoint);
    const now = Date.now();

    let entry = this.rateLimitStore.get(key);

    // Initialize entry if it doesn't exist
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        blocked: false,
      };
      this.rateLimitStore.set(key, entry);
    }

    // Check if currently blocked
    if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      };
    }

    // Reset window if expired
    if (now >= entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + config.windowMs;
      entry.blocked = false;
      delete entry.blockUntil;
    }

    // Check if we should skip this request
    if ((config.skipSuccessfulRequests && success) || 
        (config.skipFailedRequests && !success)) {
      return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - entry.count),
        resetTime: entry.resetTime,
      };
    }

    // Increment counter
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      entry.blocked = true;
      if (config.blockDurationMs) {
        entry.blockUntil = now + config.blockDurationMs;
      }

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: config.blockDurationMs ? Math.ceil(config.blockDurationMs / 1000) : undefined,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
    };
  }

  async incrementRateLimit(identifier: string, endpoint?: string): Promise<void> {
    const key = this.generateKey(identifier, endpoint);
    const entry = this.rateLimitStore.get(key);
    
    if (entry) {
      entry.count++;
    }
  }

  async resetRateLimit(identifier: string, endpoint?: string): Promise<void> {
    const key = this.generateKey(identifier, endpoint);
    this.rateLimitStore.delete(key);
  }

  async getRateLimitStatus(identifier: string, endpoint?: string): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
    blocked: boolean;
    blockUntil?: number;
  }> {
    const config = this.getConfigForEndpoint(endpoint);
    const key = this.generateKey(identifier, endpoint);
    const entry = this.rateLimitStore.get(key);

    if (!entry) {
      return {
        count: 0,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowMs,
        blocked: false,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: entry.blocked,
      blockUntil: entry.blockUntil,
    };
  }

  private getConfigForEndpoint(endpoint?: string): RateLimitConfig {
    if (!endpoint) {
      return this.defaultConfig;
    }

    // Find the most specific matching configuration
    for (const [pattern, config] of this.endpointConfigs) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }

    return this.defaultConfig;
  }

  private generateKey(identifier: string, endpoint?: string): string {
    return `${identifier}:${endpoint || 'default'}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.rateLimitStore.entries()) {
      // Remove entries that are expired and not blocked
      if (now >= entry.resetTime && !entry.blocked) {
        this.rateLimitStore.delete(key);
      }
      // Remove blocked entries that have passed their block time
      else if (entry.blocked && entry.blockUntil && now >= entry.blockUntil) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  // Get rate limit statistics
  getStats(): {
    totalEntries: number;
    activeBlocks: number;
    configs: Array<{ endpoint: string; config: RateLimitConfig }>;
  } {
    const now = Date.now();
    let activeBlocks = 0;

    for (const entry of this.rateLimitStore.values()) {
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        activeBlocks++;
      }
    }

    return {
      totalEntries: this.rateLimitStore.size,
      activeBlocks,
      configs: Array.from(this.endpointConfigs.entries()).map(([endpoint, config]) => ({
        endpoint,
        config,
      })),
    };
  }
}

