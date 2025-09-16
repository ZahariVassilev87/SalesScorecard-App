import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminController } from './admin.controller';
import { PublicAdminController } from './public-admin.controller';
import { SimpleAdminController } from './simple-admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { ScoringService } from '../scoring/scoring.service';
import { SeedService } from '../scoring/seed.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AdminController, PublicAdminController, SimpleAdminController],
  providers: [AdminService, AdminGuard, ScoringService, SeedService],
  exports: [AdminService],
})
export class AdminModule {}
