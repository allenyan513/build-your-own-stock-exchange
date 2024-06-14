import { OrderType } from './enum/OrderType';
import { Side } from './enum/Side';
import { OrderStatus } from './enum/OrderStatus';
import { ExecStatus } from './enum/ExecStatus';

export default class Execution {
  execId: number;
  orderId: number;
  price: number;
  quantity: number;
  side: Side;
  orderStatus: OrderStatus;
  orderType: OrderType;
  symbol: string;
  userId: number;
  feeCurrency: string;
  feeRate: number;
  feeAmount: number;
  accountId: number;
  execStatus: ExecStatus;
  transactionTime: number;

  constructor(
    execId: number,
    orderId: number,
    price: number,
    quantity: number,
    side: Side,
    orderStatus: OrderStatus,
    orderType: OrderType,
    symbol: string,
    userId: number,
    feeCurrency: string,
    feeRate: number,
    feeAmount: number,
    accountId: number,
    execStatus: ExecStatus,
    transactionTime: number,
  ) {
    this.execId = execId;
    this.orderId = orderId;
    this.price = price;
    this.quantity = quantity;
    this.side = side;
    this.orderStatus = orderStatus;
    this.orderType = orderType;
    this.symbol = symbol;
    this.userId = userId;
    this.feeCurrency = feeCurrency;
    this.feeRate = feeRate;
    this.feeAmount = feeAmount;
    this.accountId = accountId;
    this.execStatus = execStatus;
    this.transactionTime = transactionTime;
  }
}
