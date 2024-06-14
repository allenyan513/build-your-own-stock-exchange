export default class Product {
  productId: number;
  symbol: string;
  lotSize: number;
  tickSize: number;
  quoteCurrency: string;
  settleCurrency: string;
  description: string;
  field: string;

  constructor(
    productId: number,
    symbol: string,
    lotSize: number,
    tickSize: number,
    quoteCurrency: string,
    settleCurrency: string,
    description: string,
    field: string,
  ) {
    this.productId = productId;
    this.symbol = symbol;
    this.lotSize = lotSize;
    this.tickSize = tickSize;
    this.quoteCurrency = quoteCurrency;
    this.settleCurrency = settleCurrency;
    this.description = description;
    this.field = field;
  }
}
