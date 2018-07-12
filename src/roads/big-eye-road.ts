import { RoundResult } from '../round-result';
import { Road, RoadArray } from './road';
import { BigRoad, BigRoadItem } from './big-road';
import { DownRoadGap, DownRoadItem, generateDownRoadData, wrapColumn, wrapRow } from './shared';

/**
 * 根据 BigRoad 生成 BigEyeRoad 所需一维数据
 */
function generateBigEyeRoadItemList(bigRoadItemGraph: RoadArray<BigRoadItem>): ReadonlyArray<DownRoadItem> {
  return generateDownRoadData(bigRoadItemGraph, DownRoadGap.BigEyeRoadGap);
}

/**
 * 生成 BigEyeRoad 对应的二维数组
 */
function generateBigEyeRoadGraph(bigRoadGraph: RoadArray<BigRoadItem>, rowCount: number, columnCount: number): RoadArray<DownRoadItem> {
  return wrapRow(
    wrapColumn(
      generateBigEyeRoadItemList(bigRoadGraph),
      (previousItem, currentItem) => previousItem.repetition === currentItem.repetition,
    ),
    rowCount,
    columnCount,
  );
}

/**
 * 对外暴露出 getter() rawArray
 * 用于 SmallRoad 的数据预处理
 */
class InnerBigRoad extends BigRoad {
  public get rawArray(): RoadArray<BigRoadItem> {
    return this.array;
  }
}

export class BigEyeRoad extends Road<DownRoadItem> {
  protected readonly array: RoadArray<DownRoadItem>;

  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    const bigRoad = new InnerBigRoad(row, roundResults.length, roundResults);
    this.array = generateBigEyeRoadGraph(bigRoad.rawArray, row, column);
  }
}
