import { Injectable, Logger } from '@nestjs/common';
import { Consumer, Producer } from 'kafkajs';
import Order from '../entities/Order';
import { OrderEventMsgType } from '../entities/enum/OrderEventMsgType';
import { OrderEvent } from '../entities/OrderEvent';
import { Side } from '../entities/enum/Side';
import { OrderStatus } from '../entities/enum/OrderStatus';
import { OrderType } from '../entities/enum/OrderType';
import { KafkaService } from '../kafka/kafka.service';
import { MatchEngineService } from '../match-engine/match-engine.service';

@Injectable()
export class OrderManagerService {
  private readonly logger = new Logger(OrderManagerService.name);
  private inboundQueue: Consumer;
  private outboundQueue: Producer;

  constructor(private kafkaService: KafkaService) {
    this.initInboundQueue()
      .then(() => {
        this.logger.log('initInboundQueue success');
      })
      .catch((err) => {
        this.logger.error(err);
      });
    this.initOutboundQueue()
      .then(() => {
        this.logger.log('initOutboundQueue success');
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }
  async initOutboundQueue() {
    this.outboundQueue = this.kafkaService.getKafka().producer();
    await this.outboundQueue.connect();
  }
  async initInboundQueue() {
    this.inboundQueue = this.kafkaService
      .getKafka()
      .consumer({ groupId: 'order-manager-service-group' });
    await this.inboundQueue.connect();
    await this.inboundQueue.subscribe({
      topic: MatchEngineService.TOPIC_OUTBOUND,
      fromBeginning: true,
    });
    await this.inboundQueue.run({
      eachMessage: async ({ topic, partition, message }) => {
        // this.logger.log({ topic, partition, offset: message.offset });
        const orderEvent = JSON.parse(message.value.toString());
        await this.handleOrderEvent(orderEvent);
      },
    });
  }

  async handleOrderEvent(orderEvent: OrderEvent) {
    switch (orderEvent.msgType) {
      case OrderEventMsgType.MATCHED_SUCCESS:
        await this.handleMatchedSuccess(orderEvent);
        break;
      default:
        this.logger.log(`ignore orderEvent: msgType:${orderEvent.msgType}`);
    }
  }

  async handleMatchedSuccess(orderEvent: OrderEvent) {
    this.logger.log('handleMatchedSuccess', orderEvent);
  }

  async sendCmd(cmd: string) {
    await this.sendOrderEvent(this.buildOrderEvent(cmd));
  }

  async sendOrderEvent(orderEvent: OrderEvent) {
    // this.logger.log('sendOrderEvent', orderEvent);
    await this.outboundQueue.send({
      topic: MatchEngineService.TOPIC_INBOUND,
      messages: [{ value: JSON.stringify(orderEvent) }],
    });
  }

  buildOrderEvent(cmd: string) {
    const args = cmd.split(' ');
    if (args[0] === 'CANCEL') {
      return {
        // sequenceId: i,
        msgType: OrderEventMsgType.CANCEL,
        payload: {
          symbol: args[1],
          orderId: args[2],
        },
      } as OrderEvent;
    } else {
      const order = new Order(
        0,
        1,
        Number(args[2]),
        Number(args[3]),
        0,
        args[0] === 'BUY' ? Side.BUY : Side.SELL,
        args[1],
        OrderStatus.NEW,
        OrderType.LIMIT,
        1,
      );
      return {
        sequenceId: 0,
        msgType: OrderEventMsgType.NEW,
        payload: order,
      } as OrderEvent;
    }
  }
}
