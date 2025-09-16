import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async getRegions() {
    return this.prisma.region.findMany({
      include: {
        teams: true,
      },
    });
  }

  async getTeams() {
    return this.prisma.team.findMany({
      include: {
        region: true,
        salespeople: true,
      },
    });
  }

  async getSalespeople() {
    const users = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['SALESPERSON', 'SALES_LEAD', 'REGIONAL_SALES_MANAGER', 'SALES_DIRECTOR']
        },
        isActive: true
      },
      include: {
        userTeams: {
          include: {
            team: {
              include: {
                region: true,
              },
            },
          },
        },
        userRegions: {
          include: {
            region: true,
          },
        },
      },
    });

    // Map User data to Salesperson format for iOS compatibility
    return users.map(user => {
      // Extract first and last name from displayName
      const nameParts = user.displayName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Get the first team ID if user has teams
      const teamId = user.userTeams.length > 0 ? user.userTeams[0].teamId : '';

      return {
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        teamId,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        // Include additional User data for compatibility
        displayName: user.displayName,
        role: user.role,
        userTeams: user.userTeams,
        userRegions: user.userRegions,
      };
    });
  }
}
