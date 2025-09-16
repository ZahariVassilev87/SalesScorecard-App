import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UserRole } from '../auth/roles.enum';
import * as bcrypt from 'bcryptjs';

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
    password: string;
    isActive?: boolean;
  }) {
    // Validate role
    if (!Object.values(UserRole).includes(userData.role as UserRole)) {
      throw new BadRequestException(`Invalid role. Valid roles are: ${Object.values(UserRole).join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: userData.email,
        displayName: userData.displayName,
        password: hashedPassword,
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
    password?: string;
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

    // Hash password if provided
    if (updateData.password) {
      updatePayload.password = await bcrypt.hash(updateData.password, 12);
    }

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

  // Password reset removed - using invite-only system
  async resetUserPassword(id: string, newPassword: string) {
    throw new BadRequestException('Password reset not available - using invite-only system');
  }

  // User hierarchy management
  async assignUserToManager(userId: string, managerId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if manager exists
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    // Validate hierarchy (manager must have higher role level)
    const roleHierarchy = {
      'ADMIN': 5,
      'SALES_DIRECTOR': 4,
      'REGIONAL_SALES_MANAGER': 3,
      'SALES_LEAD': 2,
      'SALESPERSON': 1
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const managerLevel = roleHierarchy[manager.role] || 0;

    if (managerLevel <= userLevel) {
      throw new BadRequestException('Manager must have a higher role level than the user');
    }

    // Check for circular references
    if (userId === managerId) {
      throw new BadRequestException('User cannot be their own manager');
    }

    // Update user's manager
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { managerId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        }
      }
    });

    return updatedUser;
  }

  async removeUserFromManager(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { managerId: null },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        managerId: true
      }
    });

    return updatedUser;
  }

  async getUserHierarchy(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true
          }
        },
        subordinates: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
            subordinates: {
              select: {
                id: true,
                email: true,
                displayName: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getAvailableManagers(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roleHierarchy = {
      'ADMIN': 5,
      'SALES_DIRECTOR': 4,
      'REGIONAL_SALES_MANAGER': 3,
      'SALES_LEAD': 2,
      'SALESPERSON': 1
    };

    const userLevel = roleHierarchy[user.role] || 0;

    // Get users with higher role levels
    const availableManagers = await this.prisma.user.findMany({
      where: {
        role: {
          in: Object.keys(roleHierarchy).filter(role => roleHierarchy[role] > userLevel)
        },
        isActive: true,
        id: { not: userId } // Exclude the user themselves
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true
      },
      orderBy: { displayName: 'asc' }
    });

    return availableManagers;
  }

  // Scorecard Management Methods
  async getAllScorecards() {
    return this.prisma.scorecard.findMany({
      include: {
        categories: {
          include: {
            items: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createScorecard(scorecardData: {
    name: string;
    description: string;
    type: string;
    categories: Array<{
      name: string;
      weight: number;
      items: string[];
    }>;
  }) {
    // Check if scorecard with same name already exists
    const existingScorecard = await this.prisma.scorecard.findFirst({
      where: { name: scorecardData.name }
    });

    if (existingScorecard) {
      throw new ConflictException('Scorecard with this name already exists');
    }

    // Create scorecard with categories and items
    const scorecard = await this.prisma.scorecard.create({
      data: {
        name: scorecardData.name,
        description: scorecardData.description,
        type: scorecardData.type,
        categories: {
          create: scorecardData.categories.map((category, categoryIndex) => ({
            name: category.name,
            weight: category.weight,
            order: categoryIndex + 1,
            items: {
              create: category.items.map((item, itemIndex) => ({
                name: item,
                order: itemIndex + 1,
                isActive: true
              }))
            }
          }))
        }
      },
      include: {
        categories: {
          include: {
            items: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return scorecard;
  }

  async getScorecardById(id: string) {
    const scorecard = await this.prisma.scorecard.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            items: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!scorecard) {
      throw new NotFoundException('Scorecard not found');
    }

    return scorecard;
  }

  async deleteScorecard(id: string) {
    const scorecard = await this.prisma.scorecard.findUnique({
      where: { id }
    });

    if (!scorecard) {
      throw new NotFoundException('Scorecard not found');
    }

    // Delete scorecard (cascade will handle categories and items)
    await this.prisma.scorecard.delete({
      where: { id }
    });

    return { message: 'Scorecard deleted successfully' };
  }
}
