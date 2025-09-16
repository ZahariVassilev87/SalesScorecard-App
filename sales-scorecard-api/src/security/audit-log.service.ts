import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export enum AuditAction {
  // Authentication & Authorization
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // User Management
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',
  
  // Organization Management
  ORG_CREATE = 'ORG_CREATE',
  ORG_UPDATE = 'ORG_UPDATE',
  ORG_DELETE = 'ORG_DELETE',
  
  // Team Management
  TEAM_CREATE = 'TEAM_CREATE',
  TEAM_UPDATE = 'TEAM_UPDATE',
  TEAM_DELETE = 'TEAM_DELETE',
  
  // Region Management
  REGION_CREATE = 'REGION_CREATE',
  REGION_UPDATE = 'REGION_UPDATE',
  REGION_DELETE = 'REGION_DELETE',
  
  // Salesperson Management
  SALESPERSON_CREATE = 'SALESPERSON_CREATE',
  SALESPERSON_UPDATE = 'SALESPERSON_UPDATE',
  SALESPERSON_DELETE = 'SALESPERSON_DELETE',
  
  // Evaluation Management
  EVALUATION_CREATE = 'EVALUATION_CREATE',
  EVALUATION_UPDATE = 'EVALUATION_UPDATE',
  EVALUATION_DELETE = 'EVALUATION_DELETE',
  EVALUATION_SUBMIT = 'EVALUATION_SUBMIT',
  EVALUATION_APPROVE = 'EVALUATION_APPROVE',
  EVALUATION_REJECT = 'EVALUATION_REJECT',
  
  // Data Access
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_VIEW = 'DATA_VIEW',
  DATA_DOWNLOAD = 'DATA_DOWNLOAD',
  
  // Security Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // System Events
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
  BACKUP_CREATED = 'BACKUP_CREATED',
  DATA_MIGRATION = 'DATA_MIGRATION',
}

export interface AuditLogEntry {
  id?: string;
  userId?: string;
  organizationId?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  success: boolean;
  errorMessage?: string;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          organizationId: entry.organizationId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details ? JSON.stringify(entry.details) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          timestamp: entry.timestamp || new Date(),
          success: entry.success,
          errorMessage: entry.errorMessage,
        },
      });
    } catch (error) {
      // Log audit failures to console but don't throw to avoid breaking the main flow
      console.error('Failed to write audit log:', error);
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    organizationId?: string;
    action?: AuditAction;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.userId) where.userId = filters.userId;
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: filters.limit || 100,
        skip: filters.offset || 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null,
      })),
      total,
      hasMore: (filters.offset || 0) + (filters.limit || 100) < total,
    };
  }

  async getSecurityEvents(filters: {
    organizationId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    const securityActions = [
      AuditAction.UNAUTHORIZED_ACCESS,
      AuditAction.PERMISSION_DENIED,
      AuditAction.SUSPICIOUS_ACTIVITY,
      AuditAction.RATE_LIMIT_EXCEEDED,
      AuditAction.LOGIN_FAILED,
    ];

    return this.getAuditLogs({
      ...filters,
      action: filters.action as AuditAction,
    });
  }

  async getDataAccessLogs(filters: {
    userId?: string;
    organizationId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const dataAccessActions = [
      AuditAction.DATA_EXPORT,
      AuditAction.DATA_VIEW,
      AuditAction.DATA_DOWNLOAD,
    ];

    return this.getAuditLogs({
      ...filters,
      action: filters.action as AuditAction,
    });
  }

  async getComplianceReport(organizationId: string, startDate: Date, endDate: Date) {
    const [
      totalLogs,
      securityEvents,
      dataAccessLogs,
      userActivity,
      systemEvents,
    ] = await Promise.all([
      this.prisma.auditLog.count({
        where: {
          organizationId,
          timestamp: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          organizationId,
          action: {
            in: [
              AuditAction.UNAUTHORIZED_ACCESS,
              AuditAction.PERMISSION_DENIED,
              AuditAction.SUSPICIOUS_ACTIVITY,
              AuditAction.RATE_LIMIT_EXCEEDED,
              AuditAction.LOGIN_FAILED,
            ],
          },
          timestamp: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.auditLog.count({
        where: {
          organizationId,
          action: {
            in: [
              AuditAction.DATA_EXPORT,
              AuditAction.DATA_VIEW,
              AuditAction.DATA_DOWNLOAD,
            ],
          },
          timestamp: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          timestamp: { gte: startDate, lte: endDate },
        },
        _count: { userId: true },
      }),
      this.prisma.auditLog.count({
        where: {
          organizationId,
          action: {
            in: [
              AuditAction.SYSTEM_ERROR,
              AuditAction.CONFIGURATION_CHANGE,
              AuditAction.BACKUP_CREATED,
            ],
          },
          timestamp: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      summary: {
        totalLogs,
        securityEvents,
        dataAccessLogs,
        systemEvents,
        uniqueUsers: userActivity.length,
      },
      securityScore: this.calculateSecurityScore(securityEvents, totalLogs),
      complianceMetrics: {
        auditTrailComplete: totalLogs > 0,
        securityEventsMonitored: securityEvents >= 0,
        dataAccessTracked: dataAccessLogs >= 0,
        systemEventsLogged: systemEvents >= 0,
      },
    };
  }

  private calculateSecurityScore(securityEvents: number, totalLogs: number): number {
    if (totalLogs === 0) return 100;
    const securityEventRate = (securityEvents / totalLogs) * 100;
    return Math.max(0, 100 - securityEventRate);
  }

  // Cleanup old audit logs (for data retention compliance)
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: { lt: cutoffDate },
      },
    });

    return result.count;
  }
}

