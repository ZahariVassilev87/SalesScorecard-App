import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { RateLimitService } from '../rate-limit.service';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private readonly rateLimitService: RateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const rateLimitOptions = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!rateLimitOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const identifier = this.getIdentifier(request, rateLimitOptions);
    const endpoint = this.getEndpoint(request);

    try {
      const rateLimitResult = await this.rateLimitService.checkRateLimit(
        identifier,
        endpoint,
        true, // Will be updated based on actual result
      );

      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', rateLimitResult.remaining + rateLimitResult.remaining);
      response.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      response.setHeader('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());

      if (!rateLimitResult.allowed) {
        if (rateLimitResult.retryAfter) {
          response.setHeader('Retry-After', rateLimitResult.retryAfter);
        }

        throw new HttpException(
          {
            message: 'Rate limit exceeded',
            retryAfter: rateLimitResult.retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return next.handle().pipe(
        tap(() => {
          // Request was successful, but we already counted it
        }),
        catchError((error) => {
          // Request failed, update rate limit accordingly
          this.rateLimitService.checkRateLimit(identifier, endpoint, false);
          return throwError(error);
        }),
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Log rate limiting errors but don't block the request
      console.error('Rate limiting error:', error);
      return next.handle();
    }
  }

  private getIdentifier(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }

    // Default identifier: IP address + user ID if authenticated
    const user = (request as any).user;
    const ip = this.getClientIp(request);
    
    if (user?.id) {
      return `${ip}:user:${user.id}`;
    }

    return `${ip}:anonymous`;
  }

  private getEndpoint(request: Request): string {
    return request.path;
  }

  private getClientIp(request: Request): string {
    return (
      request.headers['x-forwarded-for'] as string ||
      request.headers['x-real-ip'] as string ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}

