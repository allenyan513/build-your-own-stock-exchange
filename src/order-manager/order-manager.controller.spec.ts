import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagerController } from './order-manager.controller';

describe('OrderManagerController', () => {
  let controller: OrderManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderManagerController],
    }).compile();

    controller = module.get<OrderManagerController>(OrderManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
