import { IsString, IsEnum, IsNumber } from 'class-validator';
import { Side } from '../../entities/enum/Side';
import { OrderType } from '../../entities/enum/OrderType';
export class CreateOrderDto {
  @IsString()
  symbol: string;
  @IsEnum([Side.BUY, Side.SELL])
  side: Side;
  @IsNumber()
  price: number;
  @IsEnum([OrderType.LIMIT])
  orderType: OrderType;
  @IsNumber()
  quantity: number;
}
