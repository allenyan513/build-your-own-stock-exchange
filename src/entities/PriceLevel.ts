import DoubleLinkedList from './DoubleLinkedList';
import Order from './Order';

/**
 * 相同价格的订单集合
 * 保存了价格和总量，以及订单列表
 * 订单列表使用双向链表实现
 */
export default class PriceLevel {
  private limitPrice: number;
  private totalVolume: number;
  private orders: DoubleLinkedList<Order>;

  constructor(limitPrice: number, totalVolume: number) {
    this.limitPrice = limitPrice;
    this.totalVolume = totalVolume;
    this.orders = new DoubleLinkedList<Order>();
  }

  getFirstOrder() {
    return this.orders.getHead();
  }

  addOrder(order: Order) {
    this.orders.append(order);
    this.totalVolume += order.quantity;
  }

  getLimitPrice() {
    return this.limitPrice;
  }
  getTotalVolume() {
    return this.totalVolume;
  }

  getOrders() {
    return this.orders;
  }

  toString() {
    return `Price:${this.limitPrice} LeavesQuantity:${this.orders.toString()}`;
  }

  reduceTotalVolume(quantity: number) {
    this.totalVolume -= quantity;
  }
}
