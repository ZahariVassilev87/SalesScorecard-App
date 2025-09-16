import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trend data for charts' })
  @ApiResponse({ status: 200, description: 'Trend data retrieved successfully' })
  @ApiQuery({ name: 'days', required: false, type: Number, description: 'Number of days to include in trend (default: 30)' })
  async getTrends(@Query('days') days?: number) {
    return this.analyticsService.getTrends(days || 30);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get category performance analytics' })
  @ApiResponse({ status: 200, description: 'Category performance data retrieved successfully' })
  async getCategoryPerformance() {
    return this.analyticsService.getCategoryPerformance();
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get team performance analytics' })
  @ApiResponse({ status: 200, description: 'Team performance data retrieved successfully' })
  async getTeamPerformance() {
    return this.analyticsService.getTeamPerformance();
  }

  @Get('regions')
  @ApiOperation({ summary: 'Get region performance analytics' })
  @ApiResponse({ status: 200, description: 'Region performance data retrieved successfully' })
  async getRegionPerformance() {
    return this.analyticsService.getRegionPerformance();
  }

  @Get('salespeople')
  @ApiOperation({ summary: 'Get top performing salespeople' })
  @ApiResponse({ status: 200, description: 'Salesperson performance data retrieved successfully' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of top performers to return (default: 10)' })
  async getSalespersonPerformance(@Query('limit') limit?: number) {
    return this.analyticsService.getSalespersonPerformance(limit || 10);
  }

  @Get('insights')
  @ApiOperation({ summary: 'Get performance insights and recommendations' })
  @ApiResponse({ status: 200, description: 'Performance insights retrieved successfully' })
  async getPerformanceInsights() {
    return this.analyticsService.getPerformanceInsights();
  }
}
