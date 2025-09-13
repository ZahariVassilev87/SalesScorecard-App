import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class EvaluationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.evaluation.findMany({
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
  }

  async findOne(id: string) {
    return this.prisma.evaluation.findUnique({
      where: { id },
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
  }
}
