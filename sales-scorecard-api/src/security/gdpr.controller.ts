import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GDPRService } from './gdpr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnhancedRolesGuard } from './guards/enhanced-roles.guard';
import { Permissions } from './decorators/permissions.decorator';
import { Permission } from './rbac.service';
import { AuditLog } from './decorators/audit-log.decorator';
import { AuditAction } from './audit-log.service';

@ApiTags('GDPR Compliance')
@Controller('gdpr')
@UseGuards(JwtAuthGuard, EnhancedRolesGuard)
@ApiBearerAuth()
export class GDPRController {
  constructor(private readonly gdprService: GDPRService) {}

  @Get('data-access')
  @Permissions(Permission.AUDIT_READ)
  @AuditLog({ action: AuditAction.DATA_ACCESS, resource: 'gdpr_access_request' })
  @ApiOperation({ summary: 'Request access to personal data (GDPR Article 15)' })
  @ApiResponse({ status: 200, description: 'Personal data access request processed' })
  async requestDataAccess(@Body('userId') userId: string) {
    return this.gdprService.processAccessRequest(userId);
  }

  @Post('data-portability')
  @Permissions(Permission.DATA_EXPORT)
  @AuditLog({ action: AuditAction.DATA_EXPORT, resource: 'gdpr_portability_request' })
  @ApiOperation({ summary: 'Request data portability (GDPR Article 20)' })
  @ApiResponse({ status: 200, description: 'Data portability request processed' })
  @ApiBody({ schema: { type: 'object', properties: { userId: { type: 'string' } } } })
  async requestDataPortability(@Body('userId') userId: string) {
    return this.gdprService.processPortabilityRequest(userId);
  }

  @Post('data-erasure')
  @Permissions(Permission.USER_DELETE)
  @AuditLog({ action: AuditAction.USER_DELETE, resource: 'gdpr_erasure_request' })
  @ApiOperation({ summary: 'Request data erasure (GDPR Article 17)' })
  @ApiResponse({ status: 200, description: 'Data erasure request processed' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        userId: { type: 'string' },
        reason: { type: 'string', required: false }
      } 
    } 
  })
  async requestDataErasure(
    @Body('userId') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.gdprService.processErasureRequest(userId, reason);
  }

  @Post('data-rectification')
  @Permissions(Permission.USER_UPDATE)
  @AuditLog({ action: AuditAction.USER_UPDATE, resource: 'gdpr_rectification_request' })
  @ApiOperation({ summary: 'Request data rectification (GDPR Article 16)' })
  @ApiResponse({ status: 200, description: 'Data rectification request processed' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        userId: { type: 'string' },
        corrections: { type: 'object' }
      } 
    } 
  })
  async requestDataRectification(
    @Body('userId') userId: string,
    @Body('corrections') corrections: Record<string, any>,
  ) {
    return this.gdprService.processRectificationRequest(userId, corrections);
  }

  @Post('data-restriction')
  @Permissions(Permission.USER_UPDATE)
  @AuditLog({ action: AuditAction.USER_UPDATE, resource: 'gdpr_restriction_request' })
  @ApiOperation({ summary: 'Request processing restriction (GDPR Article 18)' })
  @ApiResponse({ status: 200, description: 'Data processing restriction request processed' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        userId: { type: 'string' },
        restrictionType: { type: 'string', enum: ['PROCESSING', 'STORAGE', 'DISCLOSURE'] }
      } 
    } 
  })
  async requestDataRestriction(
    @Body('userId') userId: string,
    @Body('restrictionType') restrictionType: 'PROCESSING' | 'STORAGE' | 'DISCLOSURE',
  ) {
    return this.gdprService.processRestrictionRequest(userId, restrictionType);
  }

  @Get('data-processing-register')
  @Permissions(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'Get data processing register (GDPR Article 30)' })
  @ApiResponse({ status: 200, description: 'Data processing register retrieved' })
  async getDataProcessingRegister() {
    return this.gdprService.getDataProcessingRegister();
  }

  @Get('privacy-impact-assessment')
  @Permissions(Permission.AUDIT_READ)
  @ApiOperation({ summary: 'Get privacy impact assessment (GDPR Article 35)' })
  @ApiResponse({ status: 200, description: 'Privacy impact assessment retrieved' })
  async getPrivacyImpactAssessment() {
    return this.gdprService.generatePrivacyImpactAssessment();
  }

  @Post('data-subject-request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new data subject request' })
  @ApiResponse({ status: 201, description: 'Data subject request created' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        userId: { type: 'string' },
        type: { type: 'string', enum: ['ACCESS', 'PORTABILITY', 'ERASURE', 'RECTIFICATION', 'RESTRICTION'] },
        requestData: { type: 'object', required: false }
      } 
    } 
  })
  async createDataSubjectRequest(
    @Body('userId') userId: string,
    @Body('type') type: 'ACCESS' | 'PORTABILITY' | 'ERASURE' | 'RECTIFICATION' | 'RESTRICTION',
    @Body('requestData') requestData?: Record<string, any>,
  ) {
    return this.gdprService.createDataSubjectRequest(userId, type, requestData);
  }
}

