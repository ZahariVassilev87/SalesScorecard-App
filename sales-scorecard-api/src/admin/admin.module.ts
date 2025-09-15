import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PublicAdminController } from './public-admin.controller';
import { AdminService } from './admin.service';
import { ScoringService } from '../scoring/scoring.service';
import { SeedService } from '../scoring/seed.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, PublicAdminController],
  providers: [AdminService, ScoringService, SeedService],
  exports: [AdminService],
})
export class AdminModule {}
