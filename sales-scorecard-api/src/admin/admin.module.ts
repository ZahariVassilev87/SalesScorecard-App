import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PublicAdminController } from './public-admin.controller';
import { SimpleAdminController } from './simple-admin.controller';
import { AdminService } from './admin.service';
import { ScoringService } from '../scoring/scoring.service';
import { SeedService } from '../scoring/seed.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController, PublicAdminController, SimpleAdminController],
  providers: [AdminService, ScoringService, SeedService],
  exports: [AdminService],
})
export class AdminModule {}
