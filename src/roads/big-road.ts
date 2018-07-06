import { Road, RoadArray } from './road';
import { GameResult, RoundResult } from '../round-result';
import { wrapColumn, wrapRow } from './shared';

/**
 * 根据baccaratItemList生成bigRoad所需一维数据
 */
function generateBigRoadItemList(
  baccaratItemList: ReadonlyArray<RoundResult>,
): ReadonlyArray<RoundResult> {
  return baccaratItemList
    .filter(result => result.gameResult !== GameResult.Tie)
    .map(result => RoundResult.from(result));
}

/**
 * 生成bigRoad对应的二维数组
 */
function generateBigRoadGraph(
  baccaratItemList: ReadonlyArray<RoundResult>,
  rowCount: number,
): RoadArray {
  return wrapRow(
    wrapColumn(generateBigRoadItemList(baccaratItemList)),
    rowCount,
  );
}

export class BigRoad extends Road {
  protected readonly array: RoadArray;

  // Todo: simplify
  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    // Todo: 实际上宽度不一致
    const graph = generateBigRoadGraph(roundResults, row);
    const maxColCount = Math.max(
      0, // In case no row exists
      ...graph.map(row => row.length),
    );
    this.array =
      column >= maxColCount
        ? graph // 若 column >= maxColCount 则由于向前对齐 返回整个二维数组
        : graph.map(row => {
            // 若 delta < column 则从后往前切出所需数据
            // 若 delta >= column 则所需数据部分全部为空 直接返回包含空元素的行
            const delta = maxColCount - row.length;
            if (delta >= column) {
              return Array(column).fill(undefined);
            } else {
              return row.slice(delta - column);
            }
          });
  }
}
