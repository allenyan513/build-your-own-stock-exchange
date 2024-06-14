import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super();
    this.logger.log('PrismaService constructor');
  }
  async onModuleInit() {
    await this.$connect();
  }
}
