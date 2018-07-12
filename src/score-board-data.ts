import { GameResult, PairResult, RoundResult } from './round-result';

function GameResultParser(
  this: void,
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

function PairResultParser(
  this: void,
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

function strToRoundResult(this: void, str: string, order: number): RoundResult {
  const result = Number(str[1]);
  const winner = GameResultParser(str[0]);
  const pair = PairResultParser(str[2]);
  if (!Number.isInteger(result) || result < 0 || result > 9) {
    throw new Error(`[Invalid] Value not in range: ${str}`);
  }
  if (typeof winner === 'undefined') {
    throw new Error(`[Invalid] Winner not in range: ${str}`);
  }
  if (typeof pair === 'undefined') {
    throw new Error(`[Invalid] Pair not in range: ${str}`);
  }
  return new RoundResult(order, result, winner, pair);
}

export function fromRawData(
  this: void,
  results: ReadonlyArray<string>,
): ReadonlyArray<RoundResult> {
  return results.map(strToRoundResult);
}
