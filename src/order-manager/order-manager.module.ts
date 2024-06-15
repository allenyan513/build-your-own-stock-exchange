import { Module } from '@nestjs/common';
import { OrderManagerService } from './order-manager.service';
import { OrderManagerController } from './order-manager.controller';

@Module({
  imports: [],
  providers: [OrderManagerService],
  controllers: [OrderManagerController],
})
export class OrderManagerModule {}
