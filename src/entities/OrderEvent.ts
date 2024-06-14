import { OrderEventMsgType } from './enum/OrderEventMsgType';

export interface OrderEvent {
  sequenceId: number;
  msgType: OrderEventMsgType;
  payload: any;
}
