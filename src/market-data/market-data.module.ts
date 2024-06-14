import { Module } from '@nestjs/common';
import { MarketDataService } from './market-data.service';
import { MarketDataController } from './market-data.controller';

@Module({
  imports: [],
  providers: [MarketDataService],
  controllers: [MarketDataController],
})
export class MarketDataModule {}
