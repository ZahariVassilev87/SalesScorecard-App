import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get('regions')
  @ApiOperation({ summary: 'Get all regions' })
  @ApiResponse({ status: 200, description: 'Regions retrieved successfully' })
  async getRegions() {
    return this.organizationsService.getRegions();
  }

  @Get('teams')
  @ApiOperation({ summary: 'Get all teams' })
  @ApiResponse({ status: 200, description: 'Teams retrieved successfully' })
  async getTeams() {
    return this.organizationsService.getTeams();
  }

  @Get('salespeople')
  @ApiOperation({ summary: 'Get all salespeople' })
  @ApiResponse({ status: 200, description: 'Salespeople retrieved successfully' })
  async getSalespeople() {
    return this.organizationsService.getSalespeople();
  }
}
