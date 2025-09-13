import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EvaluationsService } from './evaluations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Evaluations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('evaluations')
export class EvaluationsController {
  constructor(private evaluationsService: EvaluationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all evaluations' })
  @ApiResponse({ status: 200, description: 'Evaluations retrieved successfully' })
  async findAll() {
    return this.evaluationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evaluation by ID' })
  @ApiResponse({ status: 200, description: 'Evaluation retrieved successfully' })
  async findOne(@Param('id') id: string) {
    return this.evaluationsService.findOne(id);
  }
}
