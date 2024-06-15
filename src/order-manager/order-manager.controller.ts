import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderManagerService } from './order-manager.service';

@Controller('orders')
export class OrderManagerController {
  constructor(private readonly orderManagerService: OrderManagerService) {}

  @Post('random')
  async createRandomOrder(
    @Body(new ValidationPipe()) createOrderDto: CreateOrderDto,
  ) {
    this.orderManagerService.createRandomOrder(createOrderDto);
    return 'Order created';
  }
  @Get()
  async getOrders() {
    return this.orderManagerService.getOrders();
  }
  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.orderManagerService.getOrder(id);
  }
  @Post()
  async createOrder(
    @Body(new ValidationPipe()) createOrderDto: CreateOrderDto,
  ) {
    return this.orderManagerService.createOrder(createOrderDto);
  }

  @Delete()
  async deleteOrder(@Body('id') id: number) {
    return this.orderManagerService.deleteOrder(id);
  }
}
