import { Module } from '@nestjs/common';
import { OrderManagerService } from './order-manager.service';

@Module({
  imports: [],
  providers: [OrderManagerService],
})
export class OrderManagerModule {}
