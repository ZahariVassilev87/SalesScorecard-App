import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalCategories,
      totalItems,
      totalUsers,
      totalEvaluations,
      totalSalespeople,
    ] = await Promise.all([
      this.prisma.behaviorCategory.count(),
      this.prisma.behaviorItem.count(),
      this.prisma.user.count(),
      this.prisma.evaluation.count(),
      this.prisma.salesperson.count(),
    ]);

    return {
      totalCategories,
      totalItems,
      totalUsers,
      totalEvaluations,
      totalSalespeople,
    };
  }

  async getSystemInfo() {
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'SQLite',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  async getRecentActivity() {
    const recentEvaluations = await this.prisma.evaluation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        salesperson: {
          select: { firstName: true, lastName: true },
        },
        manager: {
          select: { displayName: true },
        },
      },
    });

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      recentEvaluations,
      recentUsers,
    };
  }
}
