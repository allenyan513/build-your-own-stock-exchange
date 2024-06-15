import { Controller, Get, Param, Query } from '@nestjs/common';
import { MarketDataService } from './market-data.service';

@Controller('market-data')
export class MarketDataController {
  constructor(private readonly marketService: MarketDataService) {}

  @Get('/order-book/:level/:symbol/:depth')
  async getOrderBook(
    @Param('level') level: string,
    @Param('symbol') symbol: string,
    @Param('depth') depth: string,
  ) {
    return this.marketService.getOrderBook(level, symbol, depth);
  }

  @Get('/candlestick/:symbol/:interval')
  async getCandlestick(
    @Param('symbol') symbol: string,
    @Param('interval') interval: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.marketService.getCandlestick(
      symbol,
      interval,
      new Date(startTime),
      new Date(endTime),
    );
  }
}
