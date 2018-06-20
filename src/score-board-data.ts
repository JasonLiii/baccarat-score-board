import { GameResult, PairResult, RoundResult } from './round-result';

export class ScoreBoardData {
  // Prevent from being initialized
  protected constructor() {}

  public static fromRawData(
    results: ReadonlyArray<string>,
  ): ReadonlyArray<RoundResult> {
    return results.map(this.strToRoundResult);
  }

  private static GameResultParser(
    char: 'R' | 'G' | 'B' | string,
  ): GameResult | undefined {
    switch (char) {
      case 'R':
        return GameResult.BankerWin;
      case 'B':
        return GameResult.PlayerWin;
      case 'G':
        return GameResult.Tie;
      default:
        return undefined;
    }
  }

  private static PairResultParser(
    char: 'r' | 'b' | 'n' | 'a' | string,
  ): PairResult | undefined {
    switch (char) {
      case 'r':
        return PairResult.BankerPair;
      case 'b':
        return PairResult.PlayerPair;
      case 'n':
        return PairResult.NoPair;
      case 'a':
        return PairResult.AllPair;
      default:
        return undefined;
    }
  }

  private static strToRoundResult(str: string): RoundResult {
    const result = Number(str[1]);
    const winner = ScoreBoardData.GameResultParser(str[0]);
    const pair = ScoreBoardData.PairResultParser(str[2]);
    if (!Number.isInteger(result) || result < 0 || result > 9) {
      throw new Error(`[Invalid] Value not in range: ${str}`);
    }
    if (typeof winner === 'undefined') {
      throw new Error(`[Invalid] Winner not in range: ${str}`);
    }
    if (typeof pair === 'undefined') {
      throw new Error(`[Invalid] Pair not in range: ${str}`);
    }
    return new RoundResult(result, winner, pair);
  }
}
