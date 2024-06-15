import { OrderType } from './enum/OrderType';
import { Side } from './enum/Side';
import { OrderStatus } from './enum/OrderStatus';

export default class Order {
  orderId: string;
  productId: number;
  userId: number;
  price: number;
  quantity: number;
  matchedQuantity: number;
  side: Side;
  symbol: string;
  orderStatus: OrderStatus;
  orderType: OrderType;
  createdAt: number;

  constructor(
    orderId: string,
    createdAt: number,
    productId: number,
    userId: number,
    price: number,
    quantity: number,
    matchedQuantity: number,
    side: Side,
    symbol: string,
    orderStatus: OrderStatus,
    orderType: OrderType,
  ) {
    this.orderId = orderId;
    this.createdAt = createdAt;
    this.productId = productId;
    this.userId = userId;
    this.price = price;
    this.quantity = quantity;
    this.matchedQuantity = matchedQuantity;
    this.side = side;
    this.symbol = symbol;
    this.orderStatus = orderStatus;
    this.orderType = orderType;
  }

  public getOppositeSide() {
    return this.side === Side.BUY ? Side.SELL : Side.BUY;
  }

  /**
   * 如果买单无法匹配最佳卖价，或者卖单无法匹配最佳买价，则将订单添加到对应的订单簿中
   * @param bestPrice
   */
  public matchBestPrice(bestPrice: number) {
    return this.side === Side.BUY
      ? // 如果买单价格大于等于最佳卖价，则可以匹配
        this.price >= bestPrice
      : // 如果卖单价格小于等于最佳买价，则可以匹配
        this.price <= bestPrice;
  }

  public getLeavesQuantity() {
    return this.quantity - this.matchedQuantity;
  }

  public isFullyMatched() {
    return this.matchedQuantity === this.quantity;
  }

  public getSize() {
    return this.side;
  }

  static newFromPayload(payload: any) {
    return new Order(
      payload.orderId,
      payload.createdAt,
      payload.productId,
      payload.userId,
      payload.price,
      payload.quantity,
      payload.matchedQuantity,
      payload.side,
      payload.symbol,
      payload.orderStatus,
      payload.orderType,
    );
  }
  toString() {
    return `${this.getLeavesQuantity()}`;
  }
}
