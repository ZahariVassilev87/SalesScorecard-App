import { Module } from '@nestjs/common';
import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';
import { SeedService } from './seed.service';

@Module({
  controllers: [ScoringController],
  providers: [ScoringService, SeedService],
  exports: [ScoringService, SeedService],
})
export class ScoringModule {}
