import PriceLevel from './PriceLevel';
import SortedMap from './SortedMap';
import Order from './Order';
import { Side } from './enum/Side';

/**
 * 买盘或卖盘
 * limitMap 是一个有序的价格级别列表
 */
export default class Book {
  private side: Side;
  private priceLevelSortedMap: SortedMap<PriceLevel>;

  constructor(side: Side) {
    this.side = side;
    this.priceLevelSortedMap = new SortedMap(
      side === Side.BUY ? 'desc' : 'asc',
    );
  }

  getSide() {
    return this.side;
  }
  getPriceLevelSortedMap() {
    return this.priceLevelSortedMap;
  }

  /**
   * 获取下一个订单节点, 第一个priceLevel的第一个订单
   */
  findNextOrderNode() {
    const firstPriceLevel = this.getFirstPriceLevel();
    if (firstPriceLevel) {
      return firstPriceLevel.getFirstOrder();
    }
    return null;
  }

  /**
   * 删除订单节点
   */
  removeOrderNode(order: Order) {
    const priceLevel = this.priceLevelSortedMap.get(order.price);
    priceLevel.getOrders().delete(order);
    //todo reduce totalVolume
    if (priceLevel.getOrders().getSize() === 0) {
      this.priceLevelSortedMap.delete(priceLevel.getLimitPrice());
    }
  }

  getFirstPriceLevel(): PriceLevel {
    if (this.priceLevelSortedMap.getSize() === 0) {
      return null;
    }
    return this.priceLevelSortedMap.getFirst();
  }

  /**
   *  买盘: 价格最高的价格级别，如果没有则返回最大值
   *  卖盘: 价格最低的价格级别，如果没有则返回最小值
   */
  getBestPrice(): number {
    const nextOrderNode = this.findNextOrderNode();
    if (nextOrderNode) {
      return nextOrderNode.data.price;
    } else {
      if (this.side === Side.BUY) {
        return Number.MIN_VALUE;
      } else {
        return Number.MAX_VALUE;
      }
    }
  }

  addOrder(order: Order) {
    let priceLevel = this.priceLevelSortedMap.get(order.price);
    if (!priceLevel) {
      priceLevel = new PriceLevel(order.price, 0);
    }
    priceLevel.addOrder(order);
    this.priceLevelSortedMap.set(order.price, priceLevel);
  }

  /**
   * Format:
   * SELL 100 100
   */
  toString() {
    return `${this.side === Side.BUY ? '---------BUY---------' : '---------SELL---------'}\n${this.priceLevelSortedMap.toString()}\n`;
  }
}
