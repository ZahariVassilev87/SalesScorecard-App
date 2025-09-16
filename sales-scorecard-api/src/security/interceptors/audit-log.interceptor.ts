import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { AuditLogService, AuditLogEntry, AuditAction } from '../audit-log.service';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user;

    return next.handle().pipe(
      tap({
        next: (result) => {
          this.logAuditEvent(auditOptions, request, user, true, result);
        },
        error: (error) => {
          this.logAuditEvent(auditOptions, request, user, false, null, error.message);
        },
      }),
    );
  }

  private async logAuditEvent(
    options: AuditLogOptions,
    request: Request,
    user: any,
    success: boolean,
    result?: any,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const args = this.getArgumentsFromRequest(request);
      
      const entry: AuditLogEntry = {
        userId: user?.id,
        organizationId: user?.organizationId,
        action: options.action,
        resource: options.resource,
        resourceId: typeof options.resourceId === 'function' 
          ? options.resourceId(args) 
          : options.resourceId,
        details: options.details ? options.details(args, result) : undefined,
        ipAddress: this.getClientIp(request),
        userAgent: request.headers['user-agent'],
        success,
        errorMessage,
      };

      await this.auditLogService.log(entry);
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  private getArgumentsFromRequest(request: Request): any[] {
    return [
      request.body,
      request.params,
      request.query,
      request.headers,
    ];
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

