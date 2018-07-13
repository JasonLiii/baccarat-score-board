import { GameResult, PairResult, RoundResult } from './round-result';
import { fromRawData } from './score-board-data';
import { BeadRoad } from './roads/bead-road';
import { BigRoad } from './roads/big-road';
import { BigEyeRoad } from './roads/big-eye-road';
import { SmallRoad } from './roads/small-road';
import { CockroachRoad } from './roads/cockroach-road';

export class ScoreBoard {
  private readonly roundResults: ReadonlyArray<RoundResult>;

  public constructor(roundResults: ReadonlyArray<RoundResult>) {
    // 内部存储一个新的 ReadonlyArray<RoundResult> 实例
    this.roundResults = roundResults.map(result => RoundResult.from(result));
  }

  /**
   * Banker Count
   */
  public get bankerCount(): number {
    return this.roundResults.filter(
      round => round.gameResult === GameResult.BankerWin,
    ).length;
  }

  /**
   * Player Count
   */
  public get playerCount(): number {
    return this.roundResults.filter(
      round => round.gameResult === GameResult.PlayerWin,
    ).length;
  }

  /**
   * Tie Count
   */
  public get tieCount(): number {
    return this.roundResults.filter(
      round => round.gameResult === GameResult.Tie,
    ).length;
  }

  /**
   * Natural Count
   * 8/9点 即为 Natural
   */
  public get naturalCount(): number {
    return this.roundResults.filter(
      round => round.result === 8 || round.result === 9,
    ).length;
  }

  /**
   * Banker Pair Count
   * 包括 BankerPair & AllPair
   */
  public get bankerPairCount(): number {
    return this.roundResults.filter(
      round =>
        round.pairResult === PairResult.BankerPair ||
        round.pairResult === PairResult.AllPair,
    ).length;
  }

  /**
   * Player Pair Count
   * 包括 PlayerPair & AllPair
   */
  public get playerPairCount(): number {
    return this.roundResults.filter(
      round =>
        round.pairResult === PairResult.PlayerPair ||
        round.pairResult === PairResult.AllPair,
    ).length;
  }

  public static fromRawData(results: ReadonlyArray<string>): ScoreBoard {
    const res = results.slice(); // 浅拷贝一份数组 用于 reverse()
    res.reverse(); // 已知 WebSocket 传回的 string[] 中 最新的数据在最前面
    return new ScoreBoard(fromRawData(res));
  }

  public getBeadRoad(row: number = 6, column: number = 14): BeadRoad {
    return new BeadRoad(row, column, this.roundResults);
  }

  public getBigRoad(row: number = 6, column: number = 42): BigRoad {
    return new BigRoad(row, column, this.roundResults);
  }

  public getBigEyeRoad(row: number = 6, column: number = 84): BigEyeRoad {
    return new BigEyeRoad(row, column, this.roundResults);
  }

  public getSmallRoad(row: number = 6, column: number = 42): SmallRoad {
    return new SmallRoad(row, column, this.roundResults);
  }

  public getCockroachRoad(row: number = 6, column: number = 42): CockroachRoad {
    return new CockroachRoad(row, column, this.roundResults);
  }
}
