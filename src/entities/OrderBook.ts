import Book from './Book';
import PriceLevel from './PriceLevel';
import Order from './Order';
import { Side } from './enum/Side';

export default class OrderBook {
  symbol: string;
  buyBook: Book;
  sellBook: Book;
  bestBid: PriceLevel;
  bestOffer: PriceLevel;
  orderMap: Map<number, Order>;

  constructor(symbol: string) {
    this.symbol = symbol;
    this.buyBook = new Book(Side.BUY);
    this.sellBook = new Book(Side.SELL);
    this.bestBid = new PriceLevel(0, 0);
    this.bestOffer = new PriceLevel(0, 0);
    this.orderMap = new Map<number, Order>();
  }

  getBestPrice(side: Side) {
    return side === Side.BUY
      ? this.buyBook.getBestPrice()
      : this.sellBook.getBestPrice();
  }
  addOrder(order: Order, side: Side) {
    if (side === Side.BUY) {
      this.buyBook.addOrder(order);
    } else {
      this.sellBook.addOrder(order);
    }
    this.orderMap.set(order.orderId, order);
  }

  findNextOrderNode(side: Side) {
    return side === Side.BUY
      ? this.buyBook.findNextOrderNode()
      : this.sellBook.findNextOrderNode();
  }
  removeOrderNode(order: Order, side: Side) {
    if (side === Side.BUY) {
      this.buyBook.removeOrderNode(order);
    } else {
      this.sellBook.removeOrderNode(order);
    }
    this.orderMap.delete(order.orderId);
  }

  toString() {
    return `\n--------${this.symbol} Order Book---------\n${this.sellBook.toString()}\n${this.buyBook.toString()}`;
  }
}
