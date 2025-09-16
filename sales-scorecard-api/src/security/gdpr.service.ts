import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuditLogService, AuditAction } from './audit-log.service';

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'ACCESS' | 'PORTABILITY' | 'ERASURE' | 'RECTIFICATION' | 'RESTRICTION';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  requestData?: Record<string, any>;
  responseData?: Record<string, any>;
  requestedAt: Date;
  completedAt?: Date;
  notes?: string;
}

@Injectable()
export class GDPRService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async createDataSubjectRequest(
    userId: string,
    type: DataSubjectRequest['type'],
    requestData?: Record<string, any>,
  ): Promise<DataSubjectRequest> {
    const request = {
      id: `dsr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      status: 'PENDING' as const,
      requestData,
      requestedAt: new Date(),
    };

    // Log the request creation
    await this.auditLogService.log({
      userId,
      action: AuditAction.DATA_ACCESS,
      resource: 'gdpr_request',
      resourceId: request.id,
      details: { type, requestData },
      success: true,
    });

    return request;
  }

  async processAccessRequest(userId: string): Promise<{
    personalData: any;
    processingActivities: any[];
    dataRetention: any;
  }> {
    // Get all personal data for the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluations: {
          include: {
            items: {
              include: {
                behaviorItem: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
        organization: true,
        team: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get audit logs for the user
    const auditLogs = await this.auditLogService.getAuditLogs({
      userId,
      limit: 1000,
    });

    // Get processing activities (evaluations, analytics, etc.)
    const processingActivities = [
      {
        purpose: 'Performance Evaluation',
        legalBasis: 'Legitimate Interest',
        dataCategories: ['Performance Scores', 'Behavioral Assessments', 'Manager Feedback'],
        retentionPeriod: '7 years',
        data: user.evaluations,
      },
      {
        purpose: 'System Administration',
        legalBasis: 'Legitimate Interest',
        dataCategories: ['Login Logs', 'System Activity', 'Security Events'],
        retentionPeriod: '2 years',
        data: auditLogs.logs,
      },
    ];

    const personalData = {
      identity: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      organizational: {
        role: user.role,
        organization: user.organization,
        team: user.team,
        isActive: user.isActive,
      },
      temporal: {
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      },
    };

    const dataRetention = {
      userData: '7 years from last activity',
      auditLogs: '2 years',
      evaluations: '7 years from completion',
      systemLogs: '1 year',
    };

    // Log the access request processing
    await this.auditLogService.log({
      userId,
      action: AuditAction.DATA_ACCESS,
      resource: 'gdpr_access_request',
      details: { requestType: 'ACCESS', dataProvided: true },
      success: true,
    });

    return {
      personalData,
      processingActivities,
      dataRetention,
    };
  }

  async processPortabilityRequest(userId: string): Promise<{
    exportData: any;
    format: 'JSON' | 'CSV';
  }> {
    const accessData = await this.processAccessRequest(userId);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      user: accessData.personalData,
      data: {
        evaluations: accessData.processingActivities.find(a => a.purpose === 'Performance Evaluation')?.data,
        systemActivity: accessData.processingActivities.find(a => a.purpose === 'System Administration')?.data,
      },
      metadata: {
        totalEvaluations: accessData.processingActivities.find(a => a.purpose === 'Performance Evaluation')?.data?.length || 0,
        totalAuditEntries: accessData.processingActivities.find(a => a.purpose === 'System Administration')?.data?.length || 0,
      },
    };

    // Log the portability request processing
    await this.auditLogService.log({
      userId,
      action: AuditAction.DATA_EXPORT,
      resource: 'gdpr_portability_request',
      details: { requestType: 'PORTABILITY', format: 'JSON' },
      success: true,
    });

    return {
      exportData,
      format: 'JSON',
    };
  }

  async processErasureRequest(userId: string, reason?: string): Promise<{
    erased: boolean;
    retainedData: any;
    reason?: string;
  }> {
    // Check if user has any legal obligations that prevent erasure
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        evaluations: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check for legal retention requirements
    const hasActiveEvaluations = user.evaluations.some(e => 
      new Date(e.createdAt) > new Date(Date.now() - 7 * 365 * 24 * 60 * 60 * 1000) // 7 years
    );

    if (hasActiveEvaluations) {
      // Cannot fully erase due to legal retention requirements
      const retainedData = {
        evaluations: user.evaluations,
        reason: 'Legal retention requirement for performance evaluations (7 years)',
      };

      await this.auditLogService.log({
        userId,
        action: AuditAction.DATA_ACCESS,
        resource: 'gdpr_erasure_request',
        details: { requestType: 'ERASURE', status: 'PARTIAL_RETENTION', reason },
        success: true,
      });

      return {
        erased: false,
        retainedData,
        reason: 'Data retained due to legal obligations',
      };
    }

    // Perform data erasure (anonymization in this case for audit trail)
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${userId}@anonymized.local`,
        displayName: 'Deleted User',
        firstName: null,
        lastName: null,
        isActive: false,
        // Keep audit trail but anonymize
      },
    });

    // Log the erasure request processing
    await this.auditLogService.log({
      userId,
      action: AuditAction.USER_DEACTIVATE,
      resource: 'gdpr_erasure_request',
      details: { requestType: 'ERASURE', status: 'COMPLETED', reason },
      success: true,
    });

    return {
      erased: true,
      retainedData: null,
      reason: 'Data successfully anonymized',
    };
  }

  async processRectificationRequest(
    userId: string,
    corrections: Record<string, any>,
  ): Promise<{
    updated: boolean;
    changes: Record<string, any>;
  }> {
    const allowedFields = ['firstName', 'lastName', 'displayName'];
    const changes: Record<string, any> = {};

    // Validate and filter allowed corrections
    for (const [field, value] of Object.entries(corrections)) {
      if (allowedFields.includes(field)) {
        changes[field] = value;
      }
    }

    if (Object.keys(changes).length === 0) {
      throw new Error('No valid fields provided for rectification');
    }

    // Update user data
    await this.prisma.user.update({
      where: { id: userId },
      data: changes,
    });

    // Log the rectification request processing
    await this.auditLogService.log({
      userId,
      action: AuditAction.USER_UPDATE,
      resource: 'gdpr_rectification_request',
      details: { requestType: 'RECTIFICATION', changes },
      success: true,
    });

    return {
      updated: true,
      changes,
    };
  }

  async processRestrictionRequest(
    userId: string,
    restrictionType: 'PROCESSING' | 'STORAGE' | 'DISCLOSURE',
  ): Promise<{
    restricted: boolean;
    restrictionType: string;
    effectiveUntil?: Date;
  }> {
    // Implement data processing restrictions
    const restriction = {
      restricted: true,
      restrictionType,
      effectiveUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    // Log the restriction request processing
    await this.auditLogService.log({
      userId,
      action: AuditAction.USER_UPDATE,
      resource: 'gdpr_restriction_request',
      details: { requestType: 'RESTRICTION', restrictionType },
      success: true,
    });

    return restriction;
  }

  async getDataProcessingRegister(): Promise<{
    processingActivities: any[];
    dataCategories: string[];
    legalBases: string[];
    retentionPeriods: Record<string, string>;
  }> {
    return {
      processingActivities: [
        {
          name: 'Performance Evaluation System',
          purpose: 'Employee performance assessment and development',
          legalBasis: 'Legitimate Interest',
          dataCategories: ['Performance Data', 'Behavioral Assessments', 'Manager Feedback'],
          recipients: ['HR Department', 'Direct Managers', 'Employees'],
          transfers: ['Internal systems only'],
          retentionPeriod: '7 years',
        },
        {
          name: 'User Authentication',
          purpose: 'System access control and security',
          legalBasis: 'Legitimate Interest',
          dataCategories: ['Login Credentials', 'Access Logs', 'Security Events'],
          recipients: ['System Administrators'],
          transfers: ['None'],
          retentionPeriod: '2 years',
        },
        {
          name: 'Analytics and Reporting',
          purpose: 'Business intelligence and performance insights',
          legalBasis: 'Legitimate Interest',
          dataCategories: ['Aggregated Performance Data', 'Trend Analysis'],
          recipients: ['Management', 'HR Department'],
          transfers: ['Internal reporting systems'],
          retentionPeriod: '5 years',
        },
      ],
      dataCategories: [
        'Personal Identifiers',
        'Performance Data',
        'Behavioral Assessments',
        'Manager Feedback',
        'System Activity Logs',
        'Security Events',
      ],
      legalBases: [
        'Legitimate Interest',
        'Contract Performance',
        'Legal Obligation',
      ],
      retentionPeriods: {
        'Personal Data': '7 years from last activity',
        'Performance Evaluations': '7 years from completion',
        'System Logs': '2 years',
        'Security Events': '1 year',
      },
    };
  }

  async generatePrivacyImpactAssessment(): Promise<{
    risks: any[];
    mitigations: any[];
    recommendations: string[];
  }> {
    return {
      risks: [
        {
          risk: 'Unauthorized access to personal data',
          likelihood: 'Medium',
          impact: 'High',
          description: 'Potential for unauthorized access to employee performance data',
        },
        {
          risk: 'Data breach through system vulnerability',
          likelihood: 'Low',
          impact: 'High',
          description: 'Potential for data breach through system security vulnerabilities',
        },
        {
          risk: 'Inappropriate data sharing',
          likelihood: 'Low',
          impact: 'Medium',
          description: 'Risk of sharing sensitive performance data inappropriately',
        },
      ],
      mitigations: [
        {
          mitigation: 'Role-based access control',
          effectiveness: 'High',
          implementation: 'Implemented',
        },
        {
          mitigation: 'Data encryption',
          effectiveness: 'High',
          implementation: 'Implemented',
        },
        {
          mitigation: 'Audit logging',
          effectiveness: 'High',
          implementation: 'Implemented',
        },
        {
          mitigation: 'Regular security assessments',
          effectiveness: 'Medium',
          implementation: 'Recommended',
        },
      ],
      recommendations: [
        'Implement regular security training for all users',
        'Conduct quarterly privacy impact assessments',
        'Establish data breach response procedures',
        'Review and update data retention policies annually',
        'Implement data minimization practices',
      ],
    };
  }
}

