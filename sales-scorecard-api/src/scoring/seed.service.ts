import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(private prisma: PrismaService) {}

  async seedDefaultScoringStructure() {
    // Check if categories already exist
    const existingCategories = await this.prisma.behaviorCategory.count();
    if (existingCategories > 0) {
      return { message: 'Scoring structure already exists' };
    }

    // Create default categories and items
    const categories = [
      {
        name: 'Discovery',
        weight: 0.25,
        order: 1,
        items: [
          'Asks open-ended questions',
          'Uncovers customer pain points',
          'Identifies decision makers',
          'Understands customer needs',
          'Confirms success criteria',
        ],
      },
      {
        name: 'Solution Positioning',
        weight: 0.25,
        order: 2,
        items: [
          'Tailors solution to customer context',
          'Articulates clear value proposition',
          'Demonstrates product knowledge',
          'Handles objections effectively',
          'Shows ROI and business impact',
        ],
      },
      {
        name: 'Closing & Next Steps',
        weight: 0.25,
        order: 3,
        items: [
          'Makes clear asks',
          'Identifies next steps',
          'Sets mutual commitments',
          'Follows up appropriately',
          'Manages timeline expectations',
        ],
      },
      {
        name: 'Professionalism',
        weight: 0.25,
        order: 4,
        items: [
          'Arrives prepared',
          'Manages time effectively',
          'Maintains professional demeanor',
          'Listens actively',
          'Communicates clearly',
        ],
      },
    ];

    const createdCategories = [];

    for (const categoryData of categories) {
      const category = await this.prisma.behaviorCategory.create({
        data: {
          name: categoryData.name,
          weight: categoryData.weight,
          order: categoryData.order,
        },
      });

      // Create items for this category
      for (let i = 0; i < categoryData.items.length; i++) {
        await this.prisma.behaviorItem.create({
          data: {
            name: categoryData.items[i],
            categoryId: category.id,
            order: i + 1,
          },
        });
      }

      createdCategories.push(category);
    }

    return {
      message: 'Default scoring structure created successfully',
      categories: createdCategories.length,
      items: categories.reduce((total, cat) => total + cat.items.length, 0),
    };
  }

  async createSampleData() {
    // Create sample regions, teams, and salespeople
    const region = await this.prisma.region.create({
      data: { name: 'North America' },
    });

    const team = await this.prisma.team.create({
      data: {
        name: 'Enterprise Sales',
        regionId: region.id,
      },
    });

    const salespeople = [
      { firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com' },
      { firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@company.com' },
      { firstName: 'Mike', lastName: 'Davis', email: 'mike.davis@company.com' },
    ];

    for (const sp of salespeople) {
      await this.prisma.salesperson.create({
        data: {
          firstName: sp.firstName,
          lastName: sp.lastName,
          email: sp.email,
          teamId: team.id,
        },
      });
    }

    return {
      message: 'Sample data created successfully',
      region: region.name,
      team: team.name,
      salespeople: salespeople.length,
    };
  }

  async createOrganizationStructure(data: {
    regionName: string;
    regionalManager: string;
    salesLeads: string[];
    teamAssignments: {
      teamName: string;
      salesLead: string;
      salespeople: string[];
    }[];
  }) {
    try {
      // Create region
      const region = await this.prisma.region.create({
        data: { name: data.regionName },
      });

      // Create regional manager user
      const [managerName, managerEmail] = this.parseNameAndEmail(data.regionalManager);
      const tempPassword = 'TempPass123!';
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      const regionalManager = await this.prisma.user.create({
        data: {
          email: managerEmail || `${managerName.toLowerCase().replace(' ', '.')}@company.com`,
          displayName: managerName,
          password: hashedPassword,
          role: 'REGIONAL_SALES_MANAGER',
        },
      });

      // Link regional manager to region
      await this.prisma.userRegion.create({
        data: {
          userId: regionalManager.id,
          regionId: region.id,
        },
      });

      // Create teams with specific sales leads and salespeople
      const createdTeams = [];
      const createdSalesLeads = [];
      const createdSalespeople = [];

      for (const teamAssignment of data.teamAssignments) {
        // Create sales lead for this team
        const [leadName, leadEmail] = this.parseNameAndEmail(teamAssignment.salesLead);
        const leadPassword = 'TempPass123!';
        const hashedLeadPassword = await bcrypt.hash(leadPassword, 12);
        
        const salesLead = await this.prisma.user.create({
          data: {
            email: leadEmail || `${leadName.toLowerCase().replace(' ', '.')}@company.com`,
            displayName: leadName,
            password: hashedLeadPassword,
            role: 'SALES_LEAD',
          },
        });
        createdSalesLeads.push(salesLead);

        // Create team with the sales lead as manager
        const team = await this.prisma.team.create({
          data: {
            name: teamAssignment.teamName,
            regionId: region.id,
            managerId: salesLead.id,
          },
        });
        createdTeams.push(team);

        // Create salespeople for this specific team
        for (const salespersonData of teamAssignment.salespeople) {
          const [personName, personEmail] = this.parseNameAndEmail(salespersonData);
          const [firstName, lastName] = personName.split(' ');
          
          const salesperson = await this.prisma.salesperson.create({
            data: {
              firstName: firstName || personName,
              lastName: lastName || '',
              email: personEmail || `${personName.toLowerCase().replace(' ', '.')}@company.com`,
              teamId: team.id,
            },
          });
          createdSalespeople.push(salesperson);
        }
      }

      return {
        message: 'Organization structure created successfully',
        region: region.name,
        regionalManager: regionalManager.displayName,
        salesLeads: createdSalesLeads.length,
        teams: createdTeams.length,
        salespeople: createdSalespeople.length,
      };
    } catch (error) {
      throw new Error(`Failed to create organization structure: ${error.message}`);
    }
  }

  private parseNameAndEmail(input: string): [string, string?] {
    const match = input.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (match) {
      return [match[1].trim(), match[2].trim()];
    }
    return [input.trim()];
  }

  async getTeams() {
    return this.prisma.team.findMany({
      include: {
        region: true,
        manager: true,
        salespeople: true,
      },
    });
  }

  async getTeamDetails(teamId: string) {
    return this.prisma.team.findUnique({
      where: { id: teamId },
      include: {
        region: true,
        manager: true,
        salespeople: true,
        userTeams: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async addTeamMember(teamId: string, memberData: { name: string; email: string; role: string }) {
    const [firstName, lastName] = memberData.name.split(' ');
    
    // Check if this is a salesperson or a user role
    if (memberData.role === 'SALESPERSON') {
      // Create as salesperson
      const salesperson = await this.prisma.salesperson.create({
        data: {
          firstName: firstName || memberData.name,
          lastName: lastName || '',
          email: memberData.email,
          teamId: teamId,
        },
      });

      return {
        message: 'Team member added successfully',
        salesperson,
      };
    } else {
      // Create as user with specific role
      const userPassword = 'TempPass123!';
      const hashedUserPassword = await bcrypt.hash(userPassword, 12);
      
      const user = await this.prisma.user.create({
        data: {
          email: memberData.email,
          displayName: memberData.name,
          password: hashedUserPassword,
          role: memberData.role,
        },
      });

      // Link user to team
      await this.prisma.userTeam.create({
        data: {
          userId: user.id,
          teamId: teamId,
        },
      });

      return {
        message: 'Team member added successfully',
        user,
      };
    }
  }

  async removeTeamMember(teamId: string, memberId: string, type: string) {
    if (type === 'salesperson') {
      await this.prisma.salesperson.delete({
        where: { id: memberId },
      });
    } else if (type === 'user') {
      // Remove user from team
      await this.prisma.userTeam.deleteMany({
        where: {
          userId: memberId,
          teamId: teamId,
        },
      });
      
      // Optionally delete the user entirely (you might want to keep them for other teams)
      // await this.prisma.user.delete({
      //   where: { id: memberId },
      // });
    }

    return {
      message: 'Team member removed successfully',
    };
  }

  async deleteTeam(teamId: string) {
    try {
      // Delete all salespeople in the team
      await this.prisma.salesperson.deleteMany({
        where: { teamId },
      });

      // Remove all user-team relationships
      await this.prisma.userTeam.deleteMany({
        where: { teamId },
      });

      // Delete the team
      await this.prisma.team.delete({
        where: { id: teamId },
      });

      return {
        message: 'Team and all associated data deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete team: ${error.message}`);
    }
  }

  async deleteRegion(regionId: string) {
    try {
      // Get all teams in the region
      const teams = await this.prisma.team.findMany({
        where: { regionId },
      });

      // Delete all salespeople in all teams
      for (const team of teams) {
        await this.prisma.salesperson.deleteMany({
          where: { teamId: team.id },
        });

        // Remove all user-team relationships
        await this.prisma.userTeam.deleteMany({
          where: { teamId: team.id },
        });
      }

      // Delete all teams in the region
      await this.prisma.team.deleteMany({
        where: { regionId },
      });

      // Remove all user-region relationships
      await this.prisma.userRegion.deleteMany({
        where: { regionId },
      });

      // Delete the region
      await this.prisma.region.delete({
        where: { id: regionId },
      });

      return {
        message: 'Region and all associated data deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete region: ${error.message}`);
    }
  }

  async deleteEverything() {
    try {
      // Delete all salespeople
      await this.prisma.salesperson.deleteMany();

      // Delete all user-team relationships
      await this.prisma.userTeam.deleteMany();

      // Delete all user-region relationships
      await this.prisma.userRegion.deleteMany();

      // Delete all teams
      await this.prisma.team.deleteMany();

      // Delete all regions
      await this.prisma.region.deleteMany();

      // Delete all users (except keep some system users if needed)
      await this.prisma.user.deleteMany({
        where: {
          role: {
            not: 'ADMIN', // Keep admin users
          },
        },
      });

      return {
        message: 'All organizational data deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete everything: ${error.message}`);
    }
  }

  async getRegionsCount(): Promise<number> {
    return this.prisma.region.count();
  }

  async getTeamsCount(): Promise<number> {
    return this.prisma.team.count();
  }

  async getSalespeopleCount(): Promise<number> {
    return this.prisma.salesperson.count();
  }

  async getUsersCount(): Promise<number> {
    return this.prisma.user.count();
  }

  async getEvaluationsCount(): Promise<number> {
    return this.prisma.evaluation.count();
  }

  async getPendingRegistrations() {
    // For now, return all users as "pending" since we don't have isRegistered field
    // This is a simplified approach that works with the existing schema
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
