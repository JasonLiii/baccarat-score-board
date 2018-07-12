import { Road, RoadArray } from './road';
import { GameResult, PairResult, RoundResult } from '../round-result';
import { wrapColumn, wrapRow } from './shared';

export type BigRoadItem = Readonly<{
  order: number; // 用于折行后确认先后关系
  result: number;
  gameResult: GameResult.BankerWin | GameResult.PlayerWin;
  pairResult: PairResult;
}>;

/**
 * 根据baccaratItemList生成bigRoad所需一维数据
 */
function generateBigRoadItemList(
  this: void,
  roundResults: ReadonlyArray<RoundResult>,
): ReadonlyArray<BigRoadItem> {
  return roundResults
    .map(res => {
      return res.gameResult !== GameResult.Tie
        ? {
          order: res.order,
          result: res.result,
          gameResult: res.gameResult,
          pairResult: res.pairResult,
        }
        : undefined;
    })
    .filter((result): result is BigRoadItem => typeof result !== 'undefined');
}

/**
 * 生成bigRoad对应的二维数组
 */
function generateBigRoadGraph(
  this: void,
  roundResults: ReadonlyArray<RoundResult>,
  rowCount: number,
  columnCount: number,
): RoadArray<BigRoadItem> {
  return wrapRow(
    wrapColumn(
      generateBigRoadItemList(roundResults),
      (previousItem, currentItem) => previousItem.gameResult === currentItem.gameResult,
    ),
    rowCount,
    columnCount,
  );
}

export class BigRoad extends Road<BigRoadItem> {
  protected readonly array: RoadArray<BigRoadItem>;

  // Todo: simplify
  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    this.array = generateBigRoadGraph(roundResults, row, column);
  }
}
