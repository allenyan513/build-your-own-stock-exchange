import { Injectable, Logger } from '@nestjs/common';
import { Kafka, logLevel } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;

  constructor(private readonly configService: ConfigService) {
    this.logger.log('KafkaService constructor');
    this.kafka = new Kafka({
      brokers: this.configService.get<string>('KAFKA_BROKERS').split(','),
      ssl: this.configService.get<boolean>('KAFKA_SSL'),
      sasl: {
        mechanism: 'scram-sha-256',
        username: this.configService.get<string>('KAFKA_USERNAME'),
        password: this.configService.get<string>('KAFKA_PASSWORD'),
      },
      logLevel: logLevel.ERROR,
    });
  }

  getKafka() {
    return this.kafka;
  }
}
