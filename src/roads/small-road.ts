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
 * 根据 BigRoad 生成 SmallRoad 所需一维数据
 */
function generateSmallRoadItemList(
  bigRoadItemGraph: RoadArray<BigRoadItem>,
): ReadonlyArray<DownRoadItem> {
  return generateDownRoadData(bigRoadItemGraph, DownRoadGap.SmallRoadGap);
}

/**
 * 生成 SmallRoad 对应的二维数组
 */
function generateSmallRoadGraph(
  bigRoadGraph: RoadArray<BigRoadItem>,
  rowCount: number,
  columnCount: number,
): RoadArray<DownRoadItem> {
  return wrapRow(
    wrapColumn(
      generateSmallRoadItemList(bigRoadGraph),
      (previousItem, currentItem) =>
        previousItem.repetition === currentItem.repetition,
    ),
    rowCount,
    columnCount,
  );
}

export class SmallRoad extends Road<DownRoadItem> {
  protected readonly array: RoadArray<DownRoadItem>;

  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    const bigRoad = new SharedBigRoad(row, roundResults.length, roundResults);
    this.array = generateSmallRoadGraph(bigRoad.rawArray, row, column);
  }
}
