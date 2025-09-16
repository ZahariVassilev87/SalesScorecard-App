import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../audit-log.service';

export interface AuditLogOptions {
  action: AuditAction;
  resource?: string;
  resourceId?: string | ((args: any[]) => string);
  details?: (args: any[], result?: any) => Record<string, any>;
}

export const AUDIT_LOG_KEY = 'auditLog';

export const AuditLog = (options: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options);

