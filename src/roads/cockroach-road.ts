import { RoundResult } from '../round-result';
import {
  DownRoadGap,
  DownRoadItem,
  generateDownRoadData,
  wrapColumn,
  wrapRow,
} from './shared';
import { SharedBigRoad } from './shared-big-road';
import { Road, RoadArray } from './road';
import { BigRoadItem } from './big-road';

/**
 * 根据 BigRoad 生成 CockroachRoad 所需一维数据
 */
function generateCockroachRoadItemList(
  bigRoadItemGraph: RoadArray<BigRoadItem>,
): ReadonlyArray<DownRoadItem> {
  return generateDownRoadData(bigRoadItemGraph, DownRoadGap.CockroachRoadGap);
}

/**
 * 生成 CockroachRoad 对应的二维数组
 */
function generateCockroachRoadRoadGraph(
  bigRoadGraph: RoadArray<BigRoadItem>,
  rowCount: number,
  columnCount: number,
): RoadArray<DownRoadItem> {
  return wrapRow(
    wrapColumn(
      generateCockroachRoadItemList(bigRoadGraph),
      (previousItem, currentItem) =>
        previousItem.repetition === currentItem.repetition,
    ),
    rowCount,
    columnCount,
  );
}

export class CockroachRoad extends Road<DownRoadItem> {
  protected readonly array: RoadArray<DownRoadItem>;

  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    const bigRoad = new SharedBigRoad(row, roundResults.length, roundResults);
    this.array = generateCockroachRoadRoadGraph(bigRoad.rawArray, row, column);
  }
}
