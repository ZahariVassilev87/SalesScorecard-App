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

  async getAllUsers() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(userData: { email: string; displayName: string; role: string; password: string }) {
    // Hash the password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        // Note: We're not storing passwords in the User model currently
        // This would need to be added to the schema if password storage is required
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async resetUserPassword(id: string, newPassword: string) {
    // Hash the new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Note: This would need to be implemented if password storage is added to the schema
    // For now, we'll just return a success message
    return { message: 'Password reset functionality not yet implemented' };
  }
}
