import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
// import * as bcrypt from 'bcryptjs'; // Temporarily disabled for Railway

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

  // User Management Methods
  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(userData: {
    email: string;
    displayName: string;
    role: string;
    // password: string; // Temporarily disabled for Railway
    isActive?: boolean;
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user (password temporarily disabled for Railway)
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        isActive: userData.isActive ?? true,
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

    return user;
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
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

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateUser(id: string, updateData: {
    email?: string;
    displayName?: string;
    role?: string;
    // password?: string; // Temporarily disabled for Railway
    isActive?: boolean;
  }) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ConflictException('Email already taken by another user');
      }
    }

    // Prepare update data
    const updatePayload: any = { ...updateData };

    // Password update temporarily disabled for Railway

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: updatePayload,
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

    return user;
  }

  async deleteUser(id: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Delete user
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async resetUserPassword(id: string, newPassword: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Password update temporarily disabled for Railway

    return { message: 'Password reset successfully' };
  }
}
