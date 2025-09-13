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
    return this.prisma.salesperson.findMany({
      include: {
        team: {
          include: {
            region: true,
          },
        },
      },
    });
  }
}
