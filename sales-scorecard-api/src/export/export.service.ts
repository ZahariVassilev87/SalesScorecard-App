import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { Response } from 'express';

@Injectable()
export class ExportService {
  constructor(private prisma: PrismaService) {}

  async exportEvaluationsCSV(res: Response, filters?: {
    startDate?: string;
    endDate?: string;
    teamId?: string;
    regionId?: string;
    salespersonId?: string;
  }) {
    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        ...(filters?.startDate && {
          createdAt: {
            gte: new Date(filters.startDate),
            ...(filters?.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
        ...(filters?.salespersonId && { salespersonId: filters.salespersonId }),
        ...(filters?.teamId && {
          salesperson: {
            teamId: filters.teamId,
          },
        }),
        ...(filters?.regionId && {
          salesperson: {
            team: {
              regionId: filters.regionId,
            },
          },
        }),
      },
      include: {
        salesperson: {
          include: {
            team: {
              include: {
                region: true,
              },
            },
          },
        },
        manager: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    const csvData = this.formatEvaluationsForCSV(evaluations);
    this.sendCSVResponse(res, csvData, 'evaluations.csv');
  }

  async exportTeamPerformanceCSV(res: Response, filters?: {
    regionId?: string;
    teamId?: string;
  }) {
    const teams = await this.prisma.team.findMany({
      where: {
        ...(filters?.regionId && { regionId: filters.regionId }),
        ...(filters?.teamId && { id: filters.teamId }),
      },
      include: {
        region: true,
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
    });

    const csvData = this.formatTeamPerformanceForCSV(teams);
    this.sendCSVResponse(res, csvData, 'team-performance.csv');
  }

  async exportAnalyticsCSV(res: Response, type: 'dashboard' | 'trends' | 'categories' = 'dashboard') {
    let csvData: string;
    let filename: string;

    switch (type) {
      case 'dashboard':
        csvData = await this.generateDashboardAnalyticsCSV();
        filename = 'dashboard-analytics.csv';
        break;
      case 'trends':
        csvData = await this.generateTrendsAnalyticsCSV();
        filename = 'trends-analytics.csv';
        break;
      case 'categories':
        csvData = await this.generateCategoryAnalyticsCSV();
        filename = 'category-analytics.csv';
        break;
      default:
        csvData = await this.generateDashboardAnalyticsCSV();
        filename = 'analytics.csv';
    }

    this.sendCSVResponse(res, csvData, filename);
  }

  async exportSalespersonPerformanceCSV(res: Response, filters?: {
    teamId?: string;
    regionId?: string;
    limit?: number;
  }) {
    const salespeople = await this.prisma.salesperson.findMany({
      where: {
        ...(filters?.teamId && { teamId: filters.teamId }),
        ...(filters?.regionId && {
          team: {
            regionId: filters.regionId,
          },
        }),
      },
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

    const processedSalespeople = salespeople
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
      .slice(0, filters?.limit || 50);

    const csvData = this.formatSalespersonPerformanceForCSV(processedSalespeople);
    this.sendCSVResponse(res, csvData, 'salesperson-performance.csv');
  }

  async generateEvaluationPDF(evaluationId: string): Promise<Buffer> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        salesperson: {
          include: {
            team: {
              include: {
                region: true,
              },
            },
          },
        },
        manager: true,
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
    });

    if (!evaluation) {
      throw new Error('Evaluation not found');
    }

    // For now, we'll return a simple text-based PDF
    // In production, you'd use a library like puppeteer or pdfkit
    const pdfContent = this.generateEvaluationPDFContent(evaluation);
    return Buffer.from(pdfContent, 'utf-8');
  }

  private formatEvaluationsForCSV(evaluations: any[]): string {
    const headers = [
      'Evaluation ID',
      'Date',
      'Salesperson',
      'Team',
      'Region',
      'Manager',
      'Customer Name',
      'Location',
      'Overall Score',
      'Overall Comment',
      'Categories',
      'Individual Scores',
      'Created At'
    ];

    const rows = evaluations.map(evaluation => {
      const categoryScores = evaluation.items.reduce((acc: any, item: any) => {
        const categoryName = item.behaviorItem.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item.rating || 0);
        return acc;
      }, {});

      const categoryAverages = Object.entries(categoryScores).map(([category, scores]: [string, any]) => {
        const avg = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
        return `${category}: ${avg.toFixed(1)}`;
      }).join('; ');

      const individualScores = evaluation.items.map((item: any) => 
        `${item.behaviorItem.name}: ${item.rating || 'N/A'}`
      ).join('; ');

      return [
        evaluation.id,
        evaluation.visitDate ? new Date(evaluation.visitDate).toLocaleDateString() : '',
        `${evaluation.salesperson.firstName} ${evaluation.salesperson.lastName}`,
        evaluation.salesperson.team.name,
        evaluation.salesperson.team.region.name,
        evaluation.manager.displayName,
        evaluation.customerName || '',
        evaluation.location || '',
        evaluation.overallScore || '',
        evaluation.overallComment || '',
        categoryAverages,
        individualScores,
        new Date(evaluation.createdAt).toLocaleDateString()
      ];
    });

    return this.createCSVContent(headers, rows);
  }

  private formatTeamPerformanceForCSV(teams: any[]): string {
    const headers = [
      'Team ID',
      'Team Name',
      'Region',
      'Salesperson Count',
      'Total Evaluations',
      'Average Score',
      'Top Performer',
      'Top Performer Score',
      'Lowest Performer',
      'Lowest Performer Score'
    ];

    const rows = teams.map(team => {
      const allScores = team.salespeople.flatMap((sp: any) => 
        sp.evaluations.map((evaluation: any) => evaluation.overallScore || 0)
      );
      
      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length 
        : 0;

      const salespersonStats = team.salespeople.map((sp: any) => {
        const scores = sp.evaluations.map((evaluation: any) => evaluation.overallScore || 0);
        const avg = scores.length > 0 ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length : 0;
        return {
          name: `${sp.firstName} ${sp.lastName}`,
          score: avg,
          evaluationCount: scores.length
        };
      }).filter((stat: any) => stat.evaluationCount > 0);

      const topPerformer = salespersonStats.length > 0 
        ? salespersonStats.reduce((max: any, current: any) => current.score > max.score ? current : max)
        : null;

      const lowestPerformer = salespersonStats.length > 0 
        ? salespersonStats.reduce((min: any, current: any) => current.score < min.score ? current : min)
        : null;

      return [
        team.id,
        team.name,
        team.region.name,
        team.salespeople.length,
        allScores.length,
        Math.round(averageScore * 100) / 100,
        topPerformer?.name || 'N/A',
        topPerformer ? Math.round(topPerformer.score * 100) / 100 : 'N/A',
        lowestPerformer?.name || 'N/A',
        lowestPerformer ? Math.round(lowestPerformer.score * 100) / 100 : 'N/A'
      ];
    });

    return this.createCSVContent(headers, rows);
  }

  private formatSalespersonPerformanceForCSV(salespeople: any[]): string {
    const headers = [
      'Salesperson ID',
      'Name',
      'Email',
      'Team',
      'Region',
      'Total Evaluations',
      'Average Score',
      'Latest Score',
      'Latest Evaluation Date',
      'Performance Trend'
    ];

    const rows = salespeople.map(sp => {
      // Calculate trend (simplified - compare latest 3 vs previous 3)
      const recentScores = sp.evaluations.slice(0, 3).map((evaluation: any) => evaluation.overallScore || 0);
      const olderScores = sp.evaluations.slice(3, 6).map((evaluation: any) => evaluation.overallScore || 0);
      
      let trend = 'Stable';
      if (recentScores.length >= 2 && olderScores.length >= 2) {
        const recentAvg = recentScores.reduce((sum: number, score: number) => sum + score, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((sum: number, score: number) => sum + score, 0) / olderScores.length;
        
        if (recentAvg > olderAvg + 0.2) trend = 'Improving';
        else if (recentAvg < olderAvg - 0.2) trend = 'Declining';
      }

      return [
        sp.id,
        sp.name,
        sp.email || '',
        sp.teamName,
        sp.regionName,
        sp.totalEvaluations,
        sp.averageScore,
        sp.latestScore || 'N/A',
        sp.latestEvaluationDate ? new Date(sp.latestEvaluationDate).toLocaleDateString() : 'N/A',
        trend
      ];
    });

    return this.createCSVContent(headers, rows);
  }

  async generateDashboardAnalyticsCSV(): Promise<string> {
    const [
      totalEvaluations,
      totalSalespeople,
      totalTeams,
      totalRegions,
      averageScore,
      thisMonthEvaluations
    ] = await Promise.all([
      this.prisma.evaluation.count(),
      this.prisma.salesperson.count(),
      this.prisma.team.count(),
      this.prisma.region.count(),
      this.prisma.evaluation.aggregate({
        _avg: { overallScore: true },
      }),
      this.prisma.evaluation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    const headers = ['Metric', 'Value', 'Export Date'];
    const rows = [
      ['Total Evaluations', totalEvaluations.toString(), new Date().toLocaleDateString()],
      ['Total Salespeople', totalSalespeople.toString(), new Date().toLocaleDateString()],
      ['Total Teams', totalTeams.toString(), new Date().toLocaleDateString()],
      ['Total Regions', totalRegions.toString(), new Date().toLocaleDateString()],
      ['Average Score', (averageScore._avg.overallScore || 0).toFixed(2), new Date().toLocaleDateString()],
      ['This Month Evaluations', thisMonthEvaluations.toString(), new Date().toLocaleDateString()],
    ];

    return this.createCSVContent(headers, rows);
  }

  private async generateTrendsAnalyticsCSV(): Promise<string> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

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

    const trendData = this.groupEvaluationsByDate(evaluations, 30);
    
    const headers = ['Date', 'Average Score', 'Evaluation Count'];
    const rows = trendData.map(data => [
      data.date,
      data.score.toString(),
      data.count.toString()
    ]);

    return this.createCSVContent(headers, rows);
  }

  private async generateCategoryAnalyticsCSV(): Promise<string> {
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

    const headers = ['Category', 'Total Ratings', 'Average Score', 'Export Date'];
    const rows = Array.from(categoryStats.values()).map(category => [
      category.name,
      category.totalRatings.toString(),
      category.averageScore.toFixed(2),
      new Date().toLocaleDateString()
    ]);

    return this.createCSVContent(headers, rows);
  }

  private generateEvaluationPDFContent(evaluation: any): string {
    const content = `
SALES EVALUATION REPORT
=======================

Evaluation ID: ${evaluation.id}
Date: ${new Date(evaluation.visitDate).toLocaleDateString()}
Salesperson: ${evaluation.salesperson.firstName} ${evaluation.salesperson.lastName}
Team: ${evaluation.salesperson.team.name}
Region: ${evaluation.salesperson.team.region.name}
Manager: ${evaluation.manager.displayName}

${evaluation.customerName ? `Customer: ${evaluation.customerName}` : ''}
${evaluation.location ? `Location: ${evaluation.location}` : ''}

OVERALL SCORE: ${evaluation.overallScore || 'N/A'}

CATEGORY BREAKDOWN:
${this.formatCategoryBreakdown(evaluation.items)}

OVERALL COMMENT:
${evaluation.overallComment || 'No comment provided'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    return content;
  }

  private formatCategoryBreakdown(items: any[]): string {
    const categories = items.reduce((acc: any, item: any) => {
      const categoryName = item.behaviorItem.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push({
        item: item.behaviorItem.name,
        rating: item.rating,
        comment: item.comment
      });
      return acc;
    }, {});

    let breakdown = '';
    Object.entries(categories).forEach(([categoryName, items]: [string, any]) => {
      const avgScore = items.reduce((sum: number, item: any) => sum + (item.rating || 0), 0) / items.length;
      breakdown += `\n${categoryName}: ${avgScore.toFixed(1)}\n`;
      items.forEach((item: any) => {
        breakdown += `  • ${item.item}: ${item.rating || 'N/A'}\n`;
        if (item.comment) {
          breakdown += `    Comment: ${item.comment}\n`;
        }
      });
    });

    return breakdown;
  }

  private groupEvaluationsByDate(evaluations: any[], days: number) {
    const grouped = new Map();
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      grouped.set(dateKey, { date: dateKey, score: 0, count: 0 });
    }
    
    evaluations.forEach(evaluation => {
      const dateKey = evaluation.createdAt.toISOString().split('T')[0];
      if (grouped.has(dateKey)) {
        const data = grouped.get(dateKey);
        data.score += evaluation.overallScore || 0;
        data.count += 1;
      }
    });
    
    return Array.from(grouped.values()).map(data => ({
      date: data.date,
      score: data.count > 0 ? Math.round((data.score / data.count) * 100) / 100 : 0,
      count: data.count
    }));
  }

  private createCSVContent(headers: string[], rows: string[][]): string {
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ];
    return csvRows.join('\n');
  }

  private sendCSVResponse(res: Response, csvData: string, filename: string): void {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(csvData);
  }

  // Helper methods for email integration
  async generateEvaluationsCSVData(filters?: any): Promise<string> {
    const evaluations = await this.prisma.evaluation.findMany({
      where: {
        ...(filters?.startDate && {
          createdAt: {
            gte: new Date(filters.startDate),
            ...(filters?.endDate && { lte: new Date(filters.endDate) }),
          },
        }),
        ...(filters?.salespersonId && { salespersonId: filters.salespersonId }),
        ...(filters?.teamId && {
          salesperson: {
            teamId: filters.teamId,
          },
        }),
        ...(filters?.regionId && {
          salesperson: {
            team: {
              regionId: filters.regionId,
            },
          },
        }),
      },
      include: {
        salesperson: {
          include: {
            team: {
              include: {
                region: true,
              },
            },
          },
        },
        manager: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.formatEvaluationsForCSV(evaluations);
  }

  async generateTeamPerformanceCSVData(filters?: any): Promise<string> {
    const teams = await this.prisma.team.findMany({
      where: {
        ...(filters?.regionId && { regionId: filters.regionId }),
        ...(filters?.teamId && { id: filters.teamId }),
      },
      include: {
        region: true,
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
    });

    return this.formatTeamPerformanceForCSV(teams);
  }
}
