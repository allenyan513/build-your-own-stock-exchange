import { Module } from '@nestjs/common';
import { MatchEngineService } from './match-engine.service';

@Module({
  imports: [],
  providers: [MatchEngineService],
})
export class MatchEngineModule {}
