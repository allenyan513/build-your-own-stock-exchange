import { Test, TestingModule } from '@nestjs/testing';
import { MatchEngineService } from './match-engine.service';
import Order from '../entities/Order';
import { Side } from '../entities/enum/Side';
import { OrderStatus } from '../entities/enum/OrderStatus';
import { OrderType } from '../entities/enum/OrderType';
import { OrderEvent } from '../entities/OrderEvent';
import { OrderEventMsgType } from '../entities/enum/OrderEventMsgType';
import { v4 as uuidv4 } from 'uuid';
/**
 * SELL BUY CANCEL
 * @param cmd
 */
function parseOrderCmd(cmd: string): string[] {
  return cmd.split(' ');
}

describe('MatchEngineService', () => {
  let service: MatchEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatchEngineService],
    }).compile();
    service = module.get<MatchEngineService>(MatchEngineService);
  });

  /**
   * Sell
   * 101 : 400
   * 100 : 100,200
   *
   * Buy
   * 100 : 150
   */
  it('test1', () => {
    buildBook(['SELL APPLE 101 400']);
  });

  function buildBook(cmds: string[]) {
    const cmdList = cmds.map((cmd) => parseOrderCmd(cmd));
    for (let i = 0; i < cmdList.length; i++) {
      if (cmdList[i][0] === 'CANCEL') {
        service.handleOrder({
          sequenceId: i,
          msgType: OrderEventMsgType.CANCEL,
          payload: {
            symbol: cmdList[i][1],
            orderId: cmdList[i][2],
          },
        });
      } else {
        const order = new Order(
          uuidv4(),
          Date.now(),
          i,
          1,
          Number(cmdList[i][2]),
          Number(cmdList[i][3]),
          0,
          cmdList[i][0] === 'BUY' ? Side.BUY : Side.SELL,
          cmdList[i][1],
          OrderStatus.NEW,
          OrderType.LIMIT,
        );
        const orderEvent: OrderEvent = {
          sequenceId: i,
          msgType: OrderEventMsgType.NEW,
          payload: order,
        };
        service.handleOrder(orderEvent);
      }
    }
  }
});
