import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { GDPRService } from './gdpr.service';
import { GDPRController } from './gdpr.controller';
import { RBACService } from './rbac.service';
import { EncryptionService } from './encryption.service';
import { RateLimitService } from './rate-limit.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { RateLimitInterceptor } from './interceptors/rate-limit.interceptor';
import { EnhancedRolesGuard } from './guards/enhanced-roles.guard';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
  ],
  providers: [
    AuditLogService,
    GDPRService,
    RBACService,
    EncryptionService,
    RateLimitService,
    AuditLogInterceptor,
    RateLimitInterceptor,
    EnhancedRolesGuard,
  ],
  controllers: [AuditLogController, GDPRController],
  exports: [
    AuditLogService,
    GDPRService,
    RBACService,
    EncryptionService,
    RateLimitService,
    AuditLogInterceptor,
    RateLimitInterceptor,
    EnhancedRolesGuard,
  ],
})
export class SecurityModule {}
