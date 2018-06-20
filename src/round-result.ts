export enum GameResult {
  Tie,
  BankerWin,
  PlayerWin,
}

export enum PairResult {
  NoPair,
  BankerPair,
  PlayerPair,
  AllPair,
}

export class RoundResult {
  public constructor(
    public readonly result: number,
    public readonly gameResult: GameResult,
    public readonly pairResult: PairResult,
  ) {}

  /**
   * 得到新的 RoundResult 实例
   */
  public static from(source: RoundResult): RoundResult {
    return new RoundResult(source.result, source.gameResult, source.pairResult);
  }
}
