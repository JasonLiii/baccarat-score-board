import { InnerRoadArray, Road, RoadArray } from './road';
import { GameResult, PairResult, RoundResult } from '../round-result';
import { wrapRow } from './shared';

export type BigRoadItem = Readonly<{
  result: number;
  gameResult: GameResult.BankerWin | GameResult.PlayerWin;
  pairResult: PairResult;
}>;

/**
 * 将RoadItem[]转换为RoadItem[][]
 */
function wrapColumn(
  this: void,
  roadItemList: ReadonlyArray<BigRoadItem>,
): RoadArray<BigRoadItem> {
  const resultGraph: InnerRoadArray<BigRoadItem> = [];
  let tempColumn: BigRoadItem[] = [];
  for (let i = 0; i < roadItemList.length; i++) {
    if (tempColumn.length === 0) {
      tempColumn.push(roadItemList[i]);
    } else if (
      tempColumn[tempColumn.length - 1].gameResult ===
      roadItemList[i].gameResult
    ) {
      tempColumn.push(roadItemList[i]);
    } else {
      resultGraph.push(tempColumn);
      tempColumn = [];
      tempColumn.push(roadItemList[i]);
    }
  }
  resultGraph.push(tempColumn);
  return resultGraph;
}

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
    wrapColumn(generateBigRoadItemList(roundResults)),
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

/**
 * Internal usage only
 * 对外暴露出 getter() rawArray
 * 一般用于下三路的数据预处理
 */
export class InnerBigRoad extends BigRoad {
  public get rawArray(): RoadArray<BigRoadItem> {
    return this.array;
  }
}
