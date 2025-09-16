import { Controller, Get, Post, UseGuards, Query, Res, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from '../email/email.service';
import { Response } from 'express';

@ApiTags('Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('export')
export class ExportController {
  constructor(
    private exportService: ExportService,
    private emailService: EmailService
  ) {}

  @Get('evaluations/csv')
  @ApiOperation({ summary: 'Export evaluations as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file with evaluations data' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date filter (YYYY-MM-DD)' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team ID' })
  @ApiQuery({ name: 'regionId', required: false, description: 'Filter by region ID' })
  @ApiQuery({ name: 'salespersonId', required: false, description: 'Filter by salesperson ID' })
  async exportEvaluationsCSV(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('teamId') teamId?: string,
    @Query('regionId') regionId?: string,
    @Query('salespersonId') salespersonId?: string,
  ) {
    return this.exportService.exportEvaluationsCSV(res, {
      startDate,
      endDate,
      teamId,
      regionId,
      salespersonId,
    });
  }

  @Get('teams/performance/csv')
  @ApiOperation({ summary: 'Export team performance as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file with team performance data' })
  @ApiQuery({ name: 'regionId', required: false, description: 'Filter by region ID' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team ID' })
  async exportTeamPerformanceCSV(
    @Res() res: Response,
    @Query('regionId') regionId?: string,
    @Query('teamId') teamId?: string,
  ) {
    return this.exportService.exportTeamPerformanceCSV(res, {
      regionId,
      teamId,
    });
  }

  @Get('salespeople/performance/csv')
  @ApiOperation({ summary: 'Export salesperson performance as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file with salesperson performance data' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filter by team ID' })
  @ApiQuery({ name: 'regionId', required: false, description: 'Filter by region ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results (default: 50)' })
  async exportSalespersonPerformanceCSV(
    @Res() res: Response,
    @Query('teamId') teamId?: string,
    @Query('regionId') regionId?: string,
    @Query('limit') limit?: number,
  ) {
    return this.exportService.exportSalespersonPerformanceCSV(res, {
      teamId,
      regionId,
      limit: limit ? parseInt(limit.toString()) : undefined,
    });
  }

  @Get('analytics/csv')
  @ApiOperation({ summary: 'Export analytics data as CSV' })
  @ApiResponse({ status: 200, description: 'CSV file with analytics data' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    enum: ['dashboard', 'trends', 'categories'],
    description: 'Type of analytics to export (default: dashboard)' 
  })
  async exportAnalyticsCSV(
    @Res() res: Response,
    @Query('type') type?: 'dashboard' | 'trends' | 'categories',
  ) {
    return this.exportService.exportAnalyticsCSV(res, type || 'dashboard');
  }

  @Get('evaluation/:id/pdf')
  @ApiOperation({ summary: 'Export evaluation as PDF' })
  @ApiResponse({ status: 200, description: 'PDF file with evaluation report' })
  async exportEvaluationPDF(
    @Res() res: Response,
    @Param('id') evaluationId: string,
  ) {
    try {
      const pdfBuffer = await this.exportService.generateEvaluationPDF(evaluationId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="evaluation-${evaluationId}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(404).json({ message: 'Evaluation not found' });
    }
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get available export options' })
  @ApiResponse({ status: 200, description: 'List of available export formats and filters' })
  async getExportSummary() {
    return {
      availableExports: {
        csv: {
          evaluations: {
            endpoint: '/export/evaluations/csv',
            description: 'Export all evaluations with detailed scoring',
            filters: ['startDate', 'endDate', 'teamId', 'regionId', 'salespersonId']
          },
          teamPerformance: {
            endpoint: '/export/teams/performance/csv',
            description: 'Export team performance metrics and rankings',
            filters: ['regionId', 'teamId']
          },
          salespersonPerformance: {
            endpoint: '/export/salespeople/performance/csv',
            description: 'Export individual salesperson performance data',
            filters: ['teamId', 'regionId', 'limit']
          },
          analytics: {
            endpoint: '/export/analytics/csv',
            description: 'Export analytics data (dashboard, trends, categories)',
            types: ['dashboard', 'trends', 'categories']
          }
        },
        pdf: {
          evaluationReport: {
            endpoint: '/export/evaluation/{id}/pdf',
            description: 'Generate detailed evaluation report as PDF',
            parameters: ['evaluationId']
          }
        }
      },
      exportDate: new Date().toISOString(),
      supportedFormats: ['CSV', 'PDF'],
      maxResults: {
        csv: 10000,
        pdf: 'No limit'
      }
    };
  }

  @Post('email/report')
  @ApiOperation({ summary: 'Send export report via email' })
  @ApiResponse({ status: 200, description: 'Report sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async sendExportReport(
    @Body() body: {
      email: string;
      reportType: string;
      format: 'csv' | 'pdf';
      filters?: any;
    }
  ) {
    try {
      // Validate required parameters
      if (!body.email || !body.reportType || !body.format) {
        return {
          success: false,
          message: 'Missing required parameters: email, reportType, and format are required'
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return {
          success: false,
          message: 'Invalid email format'
        };
      }

      // Validate report type
      const validReportTypes = ['evaluations', 'team-performance', 'analytics'];
      if (!validReportTypes.includes(body.reportType)) {
        return {
          success: false,
          message: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}`
        };
      }

      // Validate format
      const validFormats = ['csv', 'pdf'];
      if (!validFormats.includes(body.format)) {
        return {
          success: false,
          message: `Invalid format. Must be one of: ${validFormats.join(', ')}`
        };
      }

      let data: Buffer;
      let filename: string;

      // Generate the appropriate report based on type
      switch (body.reportType) {
        case 'evaluations':
          const csvData = await this.exportService.generateEvaluationsCSVData(body.filters);
          data = Buffer.from(csvData, 'utf-8');
          filename = 'evaluations.csv';
          break;
        case 'team-performance':
          const teamData = await this.exportService.generateTeamPerformanceCSVData(body.filters);
          data = Buffer.from(teamData, 'utf-8');
          filename = 'team-performance.csv';
          break;
        case 'analytics':
          const analyticsData = await this.exportService.generateDashboardAnalyticsCSV();
          data = Buffer.from(analyticsData, 'utf-8');
          filename = 'analytics.csv';
          break;
        default:
          return {
            success: false,
            message: 'Invalid report type'
          };
      }

      const success = await this.emailService.sendExportReport(
        body.email,
        body.reportType,
        data,
        filename,
        body.format
      );

      return {
        success,
        message: success ? 'Report sent successfully' : 'Failed to send report - check email configuration'
      };
    } catch (error) {
      console.error('Export email error:', error);
      return {
        success: false,
        message: 'Error generating or sending report'
      };
    }
  }
}
