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

  @Get('test')
  async getTest() {
    return { message: 'Admin controller is working!', timestamp: new Date().toISOString() };
  }

  @Get('panel-json')
  async getAdminPanelJson() {
    return { 
      status: 'success',
      message: 'Admin panel is accessible',
      timestamp: new Date().toISOString(),
      endpoints: {
        panel: '/public-admin/panel',
        teamManager: '/public-admin/team-manager',
        dashboard: '/public-admin/dashboard',
        test: '/public-admin/test'
      }
    };
  }

  @Get('panel')
  async getAdminPanel(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sales Scorecard - Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .section { margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .section h2 { color: #555; margin-bottom: 15px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Sales Scorecard Admin Panel</h1>
        
        <div class="section">
            <h2>📊 System Status</h2>
            <div class="status success">
                ✅ Application is running successfully!
            </div>
            <p><strong>Server:</strong> Railway Production</p>
            <p><strong>Database:</strong> SQLite</p>
            <p><strong>Status:</strong> Online</p>
        </div>

        <div class="section">
            <h2>🔧 Quick Actions</h2>
            <button onclick="window.open('/public-admin/team-manager', '_blank')">Team Manager</button>
            <button onclick="window.open('/api/docs', '_blank')">API Documentation</button>
            <button onclick="testAPI()">Test API Connection</button>
        </div>

        <div class="section">
            <h2>📱 Mobile App Setup</h2>
            <p>Your iOS app is now configured for production mode!</p>
            <p><strong>API URL:</strong> <code id="apiUrl">Loading...</code></p>
            <p><strong>Status:</strong> <span id="appStatus">Ready for production</span></p>
        </div>

        <div class="section">
            <h2>🎯 Next Steps</h2>
            <ul>
                <li>✅ App deployed to Railway</li>
                <li>✅ Admin panel accessible</li>
                <li>✅ API endpoints working</li>
                <li>🔄 Test with your iOS app</li>
                <li>🔄 Add team members via Team Manager</li>
            </ul>
        </div>
    </div>

    <script>
        document.getElementById('apiUrl').textContent = window.location.origin;
        
        async function testAPI() {
            try {
                const response = await fetch('/public-admin/dashboard');
                const data = await response.json();
                alert('API is working! Dashboard data: ' + JSON.stringify(data, null, 2));
            } catch (error) {
                alert('API test failed: ' + error.message);
            }
        }
    </script>
</body>
</html>`;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('team-manager')
  async getTeamManager(@Res() res: Response) {
    const htmlPath = path.join(process.cwd(), 'src', 'admin', 'better-admin.html');
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

  // Sales Director Management Endpoints
  @Get('regions/:regionId/directors')
  async getRegionDirectors(@Param('regionId') regionId: string) {
    return this.seedService.getRegionDirectors(regionId);
  }

  @Post('regions/:regionId/directors')
  async addRegionDirector(
    @Param('regionId') regionId: string,
    @Body() body: { name: string; email: string; role: string }
  ) {
    return this.seedService.addRegionDirector(regionId, body);
  }

  @Delete('regions/:regionId/directors/:directorId')
  async removeRegionDirector(
    @Param('regionId') regionId: string,
    @Param('directorId') directorId: string
  ) {
    return this.seedService.removeRegionDirector(regionId, directorId);
  }

  @Get('directors')
  async getAllDirectors() {
    return this.seedService.getAllDirectors();
  }
}
