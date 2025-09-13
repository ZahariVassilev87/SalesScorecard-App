import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ScoringService } from './scoring.service';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// DTOs
export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class CreateItemDto {
  @IsString()
  name: string;

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}

export class UpdateItemDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ApiTags('Scoring Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scoring')
export class ScoringController {
  constructor(
    private scoringService: ScoringService,
    private seedService: SeedService,
  ) {}

  // Categories
  @Get('categories')
  @ApiOperation({ summary: 'Get all behavior categories with items' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    return this.scoringService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new behavior category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.scoringService.createCategory(createCategoryDto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Update a behavior category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.scoringService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a behavior category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async deleteCategory(@Param('id') id: string) {
    return this.scoringService.deleteCategory(id);
  }

  // Items
  @Get('items')
  @ApiOperation({ summary: 'Get all behavior items' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully' })
  async getItems() {
    return this.scoringService.getItems();
  }

  @Get('items/category/:categoryId')
  @ApiOperation({ summary: 'Get behavior items for a specific category' })
  @ApiResponse({ status: 200, description: 'Items retrieved successfully' })
  async getItemsByCategory(@Param('categoryId') categoryId: string) {
    return this.scoringService.getItems(categoryId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Create a new behavior item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  async createItem(@Body() createItemDto: CreateItemDto) {
    return this.scoringService.createItem(createItemDto);
  }

  @Put('items/:id')
  @ApiOperation({ summary: 'Update a behavior item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  async updateItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.scoringService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Delete a behavior item' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  async deleteItem(@Param('id') id: string) {
    return this.scoringService.deleteItem(id);
  }

  // Seeding
  @Post('seed/default')
  @ApiOperation({ summary: 'Create default scoring structure' })
  @ApiResponse({ status: 201, description: 'Default structure created successfully' })
  async seedDefaultStructure() {
    return this.seedService.seedDefaultScoringStructure();
  }

  @Post('seed/sample-data')
  @ApiOperation({ summary: 'Create sample data for testing' })
  @ApiResponse({ status: 201, description: 'Sample data created successfully' })
  async createSampleData() {
    return this.seedService.createSampleData();
  }
}
