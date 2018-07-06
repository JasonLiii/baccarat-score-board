import { InnerRoadArray, Road, RoadArray } from './road';
import { RoundResult } from '../round-result';

/**
 * 生成beadRoad对应的二维数组
 */
function generateBeadRoadGraph(
  baccaratItemList: ReadonlyArray<RoundResult>,
  rowCount: number,
  columnCount: number,
): RoadArray {
  // 若 total <= baccaratItemList.length 则从后往前切出所需数据
  // 若 total > baccaratItemList.length 由于 BeadRoad 向前对齐 因此无需在前面补空
  const data = baccaratItemList.slice(-rowCount * columnCount);
  const result: InnerRoadArray = Array(rowCount).fill(undefined);

  result.forEach((row, rowIndex, roadArray) => {
    roadArray[rowIndex] = Array(columnCount).fill(undefined);
    roadArray[rowIndex].forEach((column, columnIndex, roadRow) => {
      const oldResult: RoundResult | undefined =
        data[columnIndex * rowCount + rowIndex];
      if (typeof oldResult !== 'undefined') {
        roadRow[columnIndex] = RoundResult.from(
          data[columnIndex * rowCount + rowIndex],
        );
      }
    });
  });
  return result;
}

export class BeadRoad extends Road {
  protected readonly array: RoadArray;

  constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    this.array = generateBeadRoadGraph(roundResults, row, column);
  }
}
