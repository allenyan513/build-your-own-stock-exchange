import { Injectable, Logger } from '@nestjs/common';
import Order from '../entities/Order';
import { Consumer, Producer } from 'kafkajs';
import OrderBook from '../entities/OrderBook';
import { OrderEvent } from '../entities/OrderEvent';
import { OrderEventMsgType } from '../entities/enum/OrderEventMsgType';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class MatchEngineService {
  public static TOPIC_INBOUND = 'match-engine-inbound';
  public static TOPIC_OUTBOUND = 'match-engine-outbound';
  private readonly logger = new Logger(MatchEngineService.name);

  private nextSequenceId = 0;
  private orderBookMap: Map<string, OrderBook> = new Map();
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

  async initInboundQueue() {
    this.inboundQueue = this.kafkaService
      .getKafka()
      .consumer({ groupId: 'match-engine-service-group' });
    await this.inboundQueue.connect();
    await this.inboundQueue.subscribe({
      topic: MatchEngineService.TOPIC_INBOUND,
      fromBeginning: true,
    });
    await this.inboundQueue.run({
      eachMessage: async ({ topic, partition, message }) => {
        // this.logger.log({ topic, partition, offset: message.offset });
        const inboundOrderEvent = JSON.parse(message.value.toString());
        const outboundOrderEvents = this.handleOrder(inboundOrderEvent);
        for (const outboundOrderEvent of outboundOrderEvents) {
          await this.sendOrderEvent(outboundOrderEvent);
        }
      },
    });
  }

  async initOutboundQueue() {
    this.outboundQueue = this.kafkaService.getKafka().producer();
    await this.outboundQueue.connect();
  }

  async sendOrderEvent(orderEvent: OrderEvent) {
    await this.outboundQueue.send({
      topic: MatchEngineService.TOPIC_OUTBOUND,
      messages: [{ value: JSON.stringify(orderEvent) }],
    });
  }

  /**
   * @param orderEvent
   */
  handleOrder(orderEvent: OrderEvent): OrderEvent[] {
    // if (orderEvent.sequenceId !== this.nextSequenceId) {
    //   throw new Error('Invalid sequence id');
    // }
    // const order = this.createOrderFromEvent(orderEvent);
    // if (!this.validateOrder(order)) {
    //   throw new Error('Invalid order');
    // }
    switch (orderEvent.msgType) {
      case OrderEventMsgType.NEW:
        const order = Order.newFromPayload(orderEvent.payload);
        return this.handleNew(order);
      case OrderEventMsgType.CANCEL:
        const { symbol, orderId } = orderEvent.payload;
        return this.handleCancel(symbol, orderId);
      default:
        throw new Error('Invalid message type');
    }
  }

  handleNew(order: Order): OrderEvent[] {
    const result: OrderEvent[] = [];
    let orderBook = this.orderBookMap.get(order.symbol);
    if (!orderBook) {
      this.orderBookMap.set(order.symbol, new OrderBook(order.symbol));
      orderBook = this.orderBookMap.get(order.symbol);
    }
    const bestPrice = orderBook.getBestPrice(order.getOppositeSide());
    if (!order.matchBestPrice(bestPrice)) {
      // 如果买单无法匹配最佳卖价，或者卖单无法匹配最佳买价，则将订单添加到对应的订单簿中
      orderBook.addOrder(order, order.side);
      result.push({
        sequenceId: this.nextSequenceId++,
        msgType: OrderEventMsgType.NEW,
        payload: order,
      });
    } else {
      let currentOrderNode = orderBook.findNextOrderNode(
        order.getOppositeSide(),
      );
      while (currentOrderNode && !order.isFullyMatched()) {
        const matchedQuantity = Math.min(
          order.getLeavesQuantity(),
          currentOrderNode.data.getLeavesQuantity(),
        );
        const matchedPrice = currentOrderNode.data.price;
        order.matchedQuantity += matchedQuantity;
        currentOrderNode.data.matchedQuantity += matchedQuantity;
        // 如果当前订单的数量已经全部成交，则删除当前订单, 移动到下一个订单
        // 如果当前订单的数量未全部成交，则继续匹配
        result.push(
          this.generateMatchedSuccessOrderEvent(
            currentOrderNode.data.symbol,
            matchedPrice,
            matchedQuantity,
            order,
            currentOrderNode.data,
          ),
        );
        if (currentOrderNode.data.isFullyMatched()) {
          orderBook.removeOrderNode(
            currentOrderNode.data,
            order.getOppositeSide(),
          );
          currentOrderNode = orderBook.findNextOrderNode(
            order.getOppositeSide(),
          );
        }
      }
      //如果order没有全部成交，则将剩余的order添加到orderBook中
      if (!order.isFullyMatched()) {
        orderBook.addOrder(order, order.side);
        result.push({
          sequenceId: this.nextSequenceId++,
          msgType: OrderEventMsgType.NEW,
          payload: order,
        });
      }
    }
    // this.logger.log('order matched, orderId:', order.orderId);
    this.logger.log('orderBook:', orderBook.toString());
    //update order book
    result.push({
      sequenceId: this.nextSequenceId++,
      msgType: OrderEventMsgType.UPDATE_ORDER_BOOK,
      payload: {
        orderBook: orderBook,
      },
    });
    return result;
  }
  handleCancel(symbol: string, orderId: number): OrderEvent[] {
    const result: OrderEvent[] = [];
    let orderBook = this.orderBookMap.get(symbol);
    if (!orderBook) {
      this.orderBookMap.set(symbol, new OrderBook(symbol));
      orderBook = this.orderBookMap.get(symbol);
    }
    if (!orderBook.orderMap.has(Number(orderId))) {
      //todo
      result.push({
        sequenceId: this.nextSequenceId++,
        msgType: OrderEventMsgType.CANCEL,
        payload: '',
      });
    }
    const order = orderBook.orderMap.get(orderId);
    orderBook.removeOrderNode(order, order.side);
    result.push({
      sequenceId: this.nextSequenceId++,
      msgType: OrderEventMsgType.CANCEL,
      payload: order,
    });
    return result;
  }

  validateOrder(order: Order): boolean {
    return true;
  }

  createOrderFromEvent(orderEvent: OrderEvent): Order {
    return orderEvent.payload;
  }

  generateMatchedSuccessOrderEvent(
    symbol: string,
    matchedPrice: number,
    matchedQuantity: number,
    buyOrder: Order,
    sellOrder: Order,
  ): OrderEvent {
    return {
      sequenceId: this.nextSequenceId++,
      msgType: OrderEventMsgType.MATCHED_SUCCESS,
      payload: {
        trade: {
          symbol: symbol,
          price: matchedPrice,
          quantity: matchedQuantity,
          timeStamp: new Date(),
        },
        buyOrder: buyOrder,
        sellOrder: sellOrder,
      },
    };
  }
}
