import { RoundResult } from './round-result';
import { ScoreBoardData } from './score-board-data';
import { BigRoad } from './roads/big-road';

export class ScoreBoard {
  private readonly roundResults: ReadonlyArray<RoundResult>;

  public constructor(roundResults: ReadonlyArray<RoundResult>) {
    // 内部存储一个新的 ReadonlyArray<RoundResult> 实例
    this.roundResults = roundResults.map(result => RoundResult.from(result));
  }

  public static fromRawData(results: ReadonlyArray<string>): ScoreBoard {
    const res = results.slice(); // 浅拷贝一份数组 用于 reverse()
    res.reverse(); // 已知 WebSocket 传回的 string[] 中 最新的数据在最前面
    return new ScoreBoard(ScoreBoardData.fromRawData(res));
  }

  public getBigRoad(row: number = 6, column: number = 42): BigRoad {
    return new BigRoad(row, column, this.roundResults);
  }
}
