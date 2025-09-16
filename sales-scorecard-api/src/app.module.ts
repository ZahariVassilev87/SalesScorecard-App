import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ScoringModule } from './scoring/scoring.module';
import { AdminModule } from './admin/admin.module';
import { ExportModule } from './export/export.module';
// import { SecurityModule } from './security/security.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    HealthModule,
    // SecurityModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    EvaluationsModule,
    AnalyticsModule,
    ScoringModule,
    AdminModule,
    ExportModule,
  ],
})
export class AppModule {}
