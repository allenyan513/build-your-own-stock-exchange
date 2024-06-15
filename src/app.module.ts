import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrderManagerModule } from './order-manager/order-manager.module';
import { MatchEngineModule } from './match-engine/match-engine.module';
import { MarketDataModule } from './market-data/market-data.module';
import { KafkaModule } from './kafka/kafka.module';
@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KafkaModule,
    OrderManagerModule,
    MatchEngineModule,
    MarketDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
