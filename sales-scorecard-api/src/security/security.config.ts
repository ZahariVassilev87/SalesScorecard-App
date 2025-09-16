import { ConfigService } from '@nestjs/config';

export interface SecurityConfig {
  encryption: {
    key: string;
    algorithm: string;
    ivLength: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    blockDurationMs: number;
  };
  audit: {
    retentionDays: number;
    enableRealTime: boolean;
  };
  gdpr: {
    enableCompliance: boolean;
    dataRetentionYears: number;
    autoAnonymize: boolean;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  cors: {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
}

export const createSecurityConfig = (configService: ConfigService): SecurityConfig => ({
  encryption: {
    key: configService.get<string>('ENCRYPTION_KEY') || 'default-encryption-key-change-in-production',
    algorithm: 'aes-256-gcm',
    ivLength: 16,
  },
  rateLimit: {
    windowMs: parseInt(configService.get<string>('RATE_LIMIT_WINDOW_MS') || '900000'), // 15 minutes
    maxRequests: parseInt(configService.get<string>('RATE_LIMIT_MAX_REQUESTS') || '100'),
    blockDurationMs: parseInt(configService.get<string>('RATE_LIMIT_BLOCK_DURATION_MS') || '3600000'), // 1 hour
  },
  audit: {
    retentionDays: parseInt(configService.get<string>('AUDIT_RETENTION_DAYS') || '2555'), // 7 years
    enableRealTime: configService.get<string>('AUDIT_REALTIME') === 'true',
  },
  gdpr: {
    enableCompliance: configService.get<string>('GDPR_ENABLED') === 'true',
    dataRetentionYears: parseInt(configService.get<string>('GDPR_RETENTION_YEARS') || '7'),
    autoAnonymize: configService.get<string>('GDPR_AUTO_ANONYMIZE') === 'true',
  },
  session: {
    maxAge: parseInt(configService.get<string>('SESSION_MAX_AGE') || '86400000'), // 24 hours
    secure: configService.get<string>('NODE_ENV') === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },
  cors: {
    origin: configService.get<string>('CORS_ORIGINS')?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
  },
});

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
};

export const SECURITY_MIDDLEWARE_CONFIG = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
  cors: {
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
  },
};

