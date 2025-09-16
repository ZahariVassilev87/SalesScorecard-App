import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalEvaluations = await this.prisma.evaluation.count();
    const totalSalespeople = await this.prisma.user.count({
      where: {
        role: {
          in: ['SALESPERSON', 'SALES_LEAD', 'REGIONAL_SALES_MANAGER', 'SALES_DIRECTOR']
        }
      }
    });
    const totalTeams = await this.prisma.team.count();
    const totalRegions = await this.prisma.region.count();

    const averageScore = await this.prisma.evaluation.aggregate({
      _avg: {
        overallScore: true,
      },
    });

    // Get this month's evaluations
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthEvaluations = await this.prisma.evaluation.count({
      where: {
        createdAt: {
          gte: thisMonth,
        },
      },
    });

    return {
      totalEvaluations,
      totalSalespeople,
      totalTeams,
      totalRegions,
      averageScore: averageScore._avg.overallScore || 0,
      thisMonthEvaluations,
    };
  }

  async getTrends(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Get evaluations grouped by date
    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        overallScore: {
          not: null,
        },
      },
      select: {
        createdAt: true,
        overallScore: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by date and calculate average scores
    const trendData = this.groupEvaluationsByDate(evaluations, days);
    
    return {
      period: `${days} days`,
      data: trendData,
    };
  }

  async getCategoryPerformance() {
    // Get all evaluation items with their categories
    const evaluationItems = await this.prisma.evaluationItem.findMany({
      where: {
        rating: {
          not: null,
        },
      },
      include: {
        behaviorItem: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category and calculate averages
    const categoryStats = new Map();
    
    evaluationItems.forEach(item => {
      const categoryName = item.behaviorItem.category.name;
      if (!categoryStats.has(categoryName)) {
        categoryStats.set(categoryName, {
          name: categoryName,
          totalRatings: 0,
          sumRatings: 0,
          averageScore: 0,
        });
      }
      
      const stats = categoryStats.get(categoryName);
      stats.totalRatings += 1;
      stats.sumRatings += item.rating || 0;
      stats.averageScore = stats.sumRatings / stats.totalRatings;
    });

    return Array.from(categoryStats.values()).sort((a, b) => b.averageScore - a.averageScore);
  }

  async getTeamPerformance() {
    const teams = await this.prisma.team.findMany({
      include: {
        salespeople: {
          include: {
            evaluations: {
              where: {
                overallScore: {
                  not: null,
                },
              },
              select: {
                overallScore: true,
                createdAt: true,
              },
            },
          },
        },
        region: true,
      },
    });

    return teams.map(team => {
      const allScores = team.salespeople.flatMap(sp => 
        sp.evaluations.map(evaluation => evaluation.overallScore || 0)
      );
      
      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      return {
        id: team.id,
        name: team.name,
        regionName: team.region.name,
        salespersonCount: team.salespeople.length,
        totalEvaluations: allScores.length,
        averageScore: Math.round(averageScore * 100) / 100,
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }

  async getRegionPerformance() {
    const regions = await this.prisma.region.findMany({
      include: {
        teams: {
          include: {
            salespeople: {
              include: {
                evaluations: {
                  where: {
                    overallScore: {
                      not: null,
                    },
                  },
                  select: {
                    overallScore: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return regions.map(region => {
      const allScores = region.teams.flatMap(team =>
        team.salespeople.flatMap(sp => 
          sp.evaluations.map(evaluation => evaluation.overallScore || 0)
        )
      );
      
      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      const totalSalespeople = region.teams.reduce((sum, team) => sum + team.salespeople.length, 0);

      return {
        id: region.id,
        name: region.name,
        teamCount: region.teams.length,
        salespersonCount: totalSalespeople,
        totalEvaluations: allScores.length,
        averageScore: Math.round(averageScore * 100) / 100,
      };
    }).sort((a, b) => b.averageScore - a.averageScore);
  }

  async getSalespersonPerformance(limit: number = 10) {
    const salespeople = await this.prisma.salesperson.findMany({
      include: {
        evaluations: {
          where: {
            overallScore: {
              not: null,
            },
          },
          select: {
            overallScore: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        team: {
          include: {
            region: true,
          },
        },
      },
    });

    return salespeople
      .map(sp => {
        const scores = sp.evaluations.map(evaluation => evaluation.overallScore || 0);
        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
          : 0;

        return {
          id: sp.id,
          name: `${sp.firstName} ${sp.lastName}`,
          email: sp.email,
          teamName: sp.team.name,
          regionName: sp.team.region.name,
          totalEvaluations: scores.length,
          averageScore: Math.round(averageScore * 100) / 100,
          latestScore: scores.length > 0 ? scores[0] : null,
          latestEvaluationDate: sp.evaluations.length > 0 ? sp.evaluations[0].createdAt : null,
        };
      })
      .filter(sp => sp.totalEvaluations > 0)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);
  }

  async getPerformanceInsights() {
    const [totalEvaluations, averageScore, categoryPerformance, teamPerformance] = await Promise.all([
      this.prisma.evaluation.count(),
      this.prisma.evaluation.aggregate({
        _avg: { overallScore: true },
      }),
      this.getCategoryPerformance(),
      this.getTeamPerformance(),
    ]);

    const insights = [];

    // Top performing category
    if (categoryPerformance.length > 0) {
      const topCategory = categoryPerformance[0];
      insights.push({
        type: 'top_category',
        title: 'Strongest Category',
        description: `${topCategory.name} is your highest performing category with an average score of ${topCategory.averageScore.toFixed(1)}`,
        value: topCategory.averageScore,
      });
    }

    // Lowest performing category
    if (categoryPerformance.length > 1) {
      const lowestCategory = categoryPerformance[categoryPerformance.length - 1];
      insights.push({
        type: 'improvement_area',
        title: 'Improvement Opportunity',
        description: `${lowestCategory.name} has the lowest average score of ${lowestCategory.averageScore.toFixed(1)} and could benefit from focused training`,
        value: lowestCategory.averageScore,
      });
    }

    // Top performing team
    if (teamPerformance.length > 0) {
      const topTeam = teamPerformance[0];
      insights.push({
        type: 'top_team',
        title: 'Top Performing Team',
        description: `${topTeam.name} in ${topTeam.regionName} leads with an average score of ${topTeam.averageScore}`,
        value: topTeam.averageScore,
      });
    }

    // Overall performance status
    const overallAvg = averageScore._avg.overallScore || 0;
    if (overallAvg >= 4.0) {
      insights.push({
        type: 'overall_performance',
        title: 'Excellent Performance',
        description: `Overall average score of ${overallAvg.toFixed(1)} indicates strong sales performance across the organization`,
        value: overallAvg,
      });
    } else if (overallAvg >= 3.0) {
      insights.push({
        type: 'overall_performance',
        title: 'Good Performance',
        description: `Overall average score of ${overallAvg.toFixed(1)} shows solid performance with room for improvement`,
        value: overallAvg,
      });
    } else {
      insights.push({
        type: 'overall_performance',
        title: 'Needs Improvement',
        description: `Overall average score of ${overallAvg.toFixed(1)} indicates areas for focused development and training`,
        value: overallAvg,
      });
    }

    return insights;
  }

  private groupEvaluationsByDate(evaluations: any[], days: number) {
    const grouped = new Map();
    
    // Initialize all dates in the range with empty data
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      grouped.set(dateKey, { date: dateKey, score: 0, count: 0 });
    }
    
    // Group evaluations by date
    evaluations.forEach(evaluation => {
      const dateKey = evaluation.createdAt.toISOString().split('T')[0];
      if (grouped.has(dateKey)) {
        const data = grouped.get(dateKey);
        data.score += evaluation.overallScore || 0;
        data.count += 1;
      }
    });
    
    // Calculate averages and format for charts
    return Array.from(grouped.values()).map(data => ({
      date: data.date,
      score: data.count > 0 ? Math.round((data.score / data.count) * 100) / 100 : 0,
    }));
  }
}
