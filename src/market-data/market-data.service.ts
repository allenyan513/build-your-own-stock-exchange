import { Injectable, Logger } from '@nestjs/common';
import { KafkaService } from '../kafka/kafka.service';
import { Consumer } from 'kafkajs';
import { MatchEngineService } from '../match-engine/match-engine.service';
import { OrderEvent } from '../entities/OrderEvent';
import { OrderEventMsgType } from '../entities/enum/OrderEventMsgType';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private inboundQueue: Consumer;
  private orderBookMap = new Map<string, any>();

  constructor(
    private kafkaService: KafkaService,
    private prismaService: PrismaService,
  ) {
    this.initInboundQueue()
      .then(() => {
        this.logger.log('initInboundQueue success');
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }

  async initInboundQueue() {
    this.inboundQueue = this.kafkaService
      .getKafka()
      .consumer({ groupId: 'market-data-service-group' });
    await this.inboundQueue.connect();
    await this.inboundQueue.subscribe({
      topic: MatchEngineService.TOPIC_OUTBOUND,
      fromBeginning: true,
    });
    await this.inboundQueue.run({
      eachMessage: async ({ topic, partition, message }) => {
        // this.logger.log('Received message', {
        //   topic,
        //   partition,
        // });
        const inboundOrderEvent = JSON.parse(message.value.toString());
        await this.handleOrderEvent(inboundOrderEvent);
      },
    });
  }

  async handleOrderEvent(orderEvent: OrderEvent) {
    switch (orderEvent.msgType) {
      case OrderEventMsgType.MATCHED_SUCCESS:
        await this.handleMatchedSuccess(orderEvent);
        break;
      case OrderEventMsgType.UPDATE_ORDER_BOOK:
        await this.handleUpdateOrderBook(orderEvent);
        break;
      default:
        this.logger.log(`ignore orderEvent: msgType:${orderEvent.msgType}`);
    }
  }

  async handleMatchedSuccess(orderEvent: OrderEvent) {
    const payload = orderEvent.payload;
    if (!payload.trade) {
      this.logger.error('Trade not found in payload');
      return;
    }
    const { symbol, price, quantity, timeStamp } = payload.trade;
    if (!symbol || !price || !quantity || !timeStamp) {
      this.logger.error('Invalid trade data:', payload.trade);
      return;
    }

    await this.prismaService.trades.create({
      data: {
        symbol: symbol,
        price: this.formatToTwoDecimalPlaces(new Prisma.Decimal(Number(price))),
        quantity: Number(quantity),
        timestamp: timeStamp,
      },
    });
    await this.updateCandleChart(symbol, timeStamp);
  }

  async handleUpdateOrderBook(orderEvent: OrderEvent) {
    const payload = orderEvent.payload;
    const orderBook = payload.orderBook;
    this.orderBookMap.set(orderBook.symbol, orderBook);
    // const { symbol, sellBook, buyBook } = orderBook;
    // const orderBook = payload.orderBook as OrderBook;
    // const symbol = orderBook.symbol
    // await this.getOrderBook(level, symbol, depth);
    //  payload: {
    //         orderBook: {
    //           symbol: order.symbol,
    //           sellBook: orderBook.sellBook.toArray(),
    //           buyBook: orderBook.buyBook.toArray(),
    //         },
    //       },
  }

  async updateCandleChart(symbol: string, currentTimestamp: Date) {
    // 获取当前时间戳所在的分钟的开始时间
    const startOfMinute = new Date(currentTimestamp);
    startOfMinute.setSeconds(0, 0);
    // 获取当前分钟内的所有交易
    const trades = await this.prismaService.trades.findMany({
      where: {
        symbol: symbol,
        timestamp: {
          gte: startOfMinute,
          lt: new Date(startOfMinute.getTime() + 60000), // 加1分钟
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    if (trades.length === 0) return;

    // 计算蜡烛图数据
    const open = this.formatToTwoDecimalPlaces(trades[0].price);
    const close = this.formatToTwoDecimalPlaces(
      trades[trades.length - 1].price,
    );
    let high = trades[0].price;
    let low = trades[0].price;
    for (const trade of trades) {
      const price = trade.price;
      if (price.gt(high)) {
        high = price;
      }
      if (price.lt(low)) {
        low = price;
      }
    }
    high = this.formatToTwoDecimalPlaces(high);
    low = this.formatToTwoDecimalPlaces(low);

    const volume = trades.reduce((sum, trade) => sum + trade.quantity, 0);

    // 更新蜡烛图数据
    await this.prismaService.candleSticks.upsert({
      where: {
        symbol_interval_timestamp: {
          symbol: symbol,
          interval: '1m',
          timestamp: startOfMinute,
        },
      },
      update: {
        open: open,
        close: close,
        high: high,
        low: low,
        volume: volume,
      },
      create: {
        symbol: symbol,
        interval: '1m',
        timestamp: startOfMinute,
        open: open,
        close: close,
        high: high,
        low: low,
        volume: volume,
      },
    });
  }
  // Format decimal to two decimal places
  formatToTwoDecimalPlaces(value: Prisma.Decimal) {
    return new Prisma.Decimal(value.toFixed(2));
  }

  getOrderBook(level: string, symbol: string, depth: string) {
    const orderBook = this.orderBookMap.get(symbol);
    if (!orderBook) {
      return {};
    }
    return orderBook;
  }

  async getCandlestick(
    symbol: string,
    interval: string,
    startTime: Date,
    endTime: Date,
  ) {
    // this.logger.log('getCandlestick', symbol, interval, startTime, endTime);
    return this.prismaService.candleSticks.findMany({
      where: {
        symbol: symbol,
        interval: interval,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });
  }
}
