import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalEvaluations = await this.prisma.evaluation.count();
    const totalSalespeople = await this.prisma.salesperson.count();
    const totalTeams = await this.prisma.team.count();
    const totalRegions = await this.prisma.region.count();

    const averageScore = await this.prisma.evaluation.aggregate({
      _avg: {
        overallScore: true,
      },
    });

    return {
      totalEvaluations,
      totalSalespeople,
      totalTeams,
      totalRegions,
      averageScore: averageScore._avg.overallScore || 0,
    };
  }

  async getTrends() {
    // This would return trend data for charts
    return {
      message: 'Trends endpoint - to be implemented',
    };
  }
}
