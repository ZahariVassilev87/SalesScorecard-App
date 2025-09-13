import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  // Categories Management
  async getCategories() {
    return this.prisma.behaviorCategory.findMany({
      include: {
        items: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createCategory(data: { name: string; weight?: number; order?: number }) {
    const maxOrder = await this.prisma.behaviorCategory.aggregate({
      _max: { order: true },
    });

    return this.prisma.behaviorCategory.create({
      data: {
        name: data.name,
        weight: data.weight || 1.0,
        order: data.order || (maxOrder._max.order || 0) + 1,
      },
    });
  }

  async updateCategory(id: string, data: { name?: string; weight?: number; order?: number }) {
    return this.prisma.behaviorCategory.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    // First, delete all items in this category
    await this.prisma.behaviorItem.deleteMany({
      where: { categoryId: id },
    });

    // Then delete the category
    return this.prisma.behaviorCategory.delete({
      where: { id },
    });
  }

  // Items Management
  async getItems(categoryId?: string) {
    const where = categoryId ? { categoryId } : {};
    
    return this.prisma.behaviorItem.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async createItem(data: {
    name: string;
    categoryId: string;
    order?: number;
  }) {
    const maxOrder = await this.prisma.behaviorItem.aggregate({
      where: { categoryId: data.categoryId },
      _max: { order: true },
    });

    return this.prisma.behaviorItem.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        order: data.order || (maxOrder._max.order || 0) + 1,
      },
      include: {
        category: true,
      },
    });
  }

  async updateItem(id: string, data: { name?: string; order?: number; isActive?: boolean }) {
    return this.prisma.behaviorItem.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async deleteItem(id: string) {
    return this.prisma.behaviorItem.delete({
      where: { id },
    });
  }

  // Templates Management
  async createTemplate(data: {
    name: string;
    description?: string;
    categories: Array<{
      name: string;
      weight: number;
      order: number;
      items: Array<{
        name: string;
        order: number;
      }>;
    }>;
  }) {
    // This would create a template that can be applied later
    // For now, we'll implement this as a simple function
    return { message: 'Template creation will be implemented' };
  }

  async applyTemplate(templateId: string) {
    // This would apply a template to create categories and items
    return { message: 'Template application will be implemented' };
  }
}
