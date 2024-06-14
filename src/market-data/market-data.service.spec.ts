import { Test, TestingModule } from '@nestjs/testing';
import { MarketDataService } from './market-data.service';
import { OrderEvent } from '../entities/OrderEvent';
import { OrderEventMsgType } from '../entities/enum/OrderEventMsgType';
import { KafkaModule } from '../kafka/kafka.module';
import { PrismaModule } from '../prisma/prisma.module';
import { KafkaService } from '../kafka/kafka.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [KafkaModule, PrismaModule],
      providers: [MarketDataService, KafkaService, PrismaService],
    }).compile();

    service = module.get<MarketDataService>(MarketDataService);
  });

  it('handel order event', async () => {
    // generate a sample order event
    for (let i = 0; i < 10; i++) {
      // 100.00-100.99
      const randomPrice = Math.random() + 100;
      // 1-10
      const randomQuantity = Math.floor(Math.random() * 10) + 1;
      const orderEvent: OrderEvent = {
        sequenceId: 1,
        msgType: OrderEventMsgType.MATCHED_SUCCESS,
        payload: {
          trade: {
            symbol: 'APPLE',
            price: randomPrice,
            quantity: randomQuantity,
            timeStamp: new Date(),
          },
          buyOrder: {},
          sellOrder: {},
        },
      };
      await service.handleOrderEvent(orderEvent);
      //random wait n seconds
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.random()));
    }
  }, 1000000);

  it('get candle stick', async () => {
    const response = await service.getCandlestick(
      'APPLE',
      '1m',
      new Date('2024-06-13 01:00:00.000'),
      new Date('2024-06-15 02:00:00.000'),
    );
    console.log(response);
  });
});
