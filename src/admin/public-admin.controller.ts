import { Controller, Get, Post, Delete, Body, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ScoringService } from '../scoring/scoring.service';
import { SeedService } from '../scoring/seed.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller('public-admin')
export class PublicAdminController {
  constructor(
    private scoringService: ScoringService,
    private seedService: SeedService,
  ) {}

  @Get('panel')
  async getAdminPanel(@Res() res: Response) {
    const htmlPath = path.join(__dirname, 'admin.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('team-manager')
  async getTeamManager(@Res() res: Response) {
    const htmlPath = path.join(__dirname, 'better-admin.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('dashboard')
  async getDashboard() {
    const [
      totalRegions,
      totalTeams,
      totalSalespeople,
      totalUsers,
      totalEvaluations,
    ] = await Promise.all([
      this.seedService.getRegionsCount(),
      this.seedService.getTeamsCount(),
      this.seedService.getSalespeopleCount(),
      this.seedService.getUsersCount(),
      this.seedService.getEvaluationsCount(),
    ]);
    
    return {
      totalRegions,
      totalTeams,
      totalSalespeople,
      totalUsers,
      totalEvaluations,
    };
  }

  @Get('categories')
  async getCategories() {
    return this.scoringService.getCategories();
  }

  @Get('items')
  async getItems() {
    return this.scoringService.getItems();
  }

  @Post('seed/default')
  async seedDefaultStructure() {
    return this.seedService.seedDefaultScoringStructure();
  }

  @Post('seed/sample-data')
  async createSampleData() {
    return this.seedService.createSampleData();
  }

  @Post('create-organization')
  async createOrganization(@Body() body: any) {
    return this.seedService.createOrganizationStructure(body);
  }

  @Get('teams')
  async getTeams() {
    return this.seedService.getTeams();
  }

  @Get('teams/:id')
  async getTeamDetails(@Param('id') id: string) {
    return this.seedService.getTeamDetails(id);
  }

  @Post('teams/:id/members')
  async addTeamMember(@Param('id') id: string, @Body() body: { name: string; email: string; role: string }) {
    return this.seedService.addTeamMember(id, body);
  }

  @Delete('teams/:teamId/members/:memberId')
  async removeTeamMember(@Param('teamId') teamId: string, @Param('memberId') memberId: string, @Query('type') type: string) {
    return this.seedService.removeTeamMember(teamId, memberId, type);
  }

  @Delete('teams/:id')
  async deleteTeam(@Param('id') id: string) {
    return this.seedService.deleteTeam(id);
  }

  @Delete('regions/:id')
  async deleteRegion(@Param('id') id: string) {
    return this.seedService.deleteRegion(id);
  }

  @Delete('delete-everything')
  async deleteEverything() {
    return this.seedService.deleteEverything();
  }
}
