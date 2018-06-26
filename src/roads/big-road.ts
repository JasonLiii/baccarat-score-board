import { Road, RoadArray, RoadRow } from './road';
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
    const graph = generateBigRoadGraph(roundResults, row);
    const maxColCount = Math.max(
      ...graph
        .filter((row): row is RoadRow => typeof row !== 'undefined')
        .map(row => row.length),
    );
    this.array = graph.map(row => {
      if (typeof row !== 'undefined') {
        return row.slice(maxColCount - row.length - column);
      } else {
        return row;
      }
    });
  }

  public get rowCount(): number {
    return this.row;
  }

  public get columnCount(): number {
    return this.column;
  }
}
