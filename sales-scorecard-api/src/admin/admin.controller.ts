import { Controller, Get, Post, Put, Delete, UseGuards, Res, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;

  @IsString()
  role: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'System info retrieved successfully' })
  async getSystemInfo() {
    return this.adminService.getSystemInfo();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  async getRecentActivity() {
    return this.adminService.getRecentActivity();
  }

  @Get('panel')
  @ApiOperation({ summary: 'Get admin panel HTML interface' })
  async getAdminPanel(@Res() res: Response) {
    const htmlPath = path.join(__dirname, 'admin.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  // User Management Endpoints
  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetUserPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.adminService.resetUserPassword(id, body.password);
  }
}
