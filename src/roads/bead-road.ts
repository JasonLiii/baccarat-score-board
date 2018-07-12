import { InnerRoadArray, Road, RoadArray } from './road';
import { GameResult, PairResult, RoundResult } from '../round-result';

export type BeadRoadItem = Readonly<{
  result: number;
  gameResult: GameResult;
  pairResult: PairResult;
}>;

/**
 * 生成beadRoad对应的二维数组
 */
function generateBeadRoadGraph(
  this: void,
  roundResults: ReadonlyArray<RoundResult>,
  rowCount: number,
  columnCount: number,
): RoadArray<BeadRoadItem> {
  // 若 total <= roundResults.length 则从后往前切出所需数据
  // 若 total > roundResults.length 由于 BeadRoad 向前对齐 因此无需在前面补空
  const data = roundResults.slice(-rowCount * columnCount);
  const result: InnerRoadArray<BeadRoadItem> = Array(rowCount).fill(undefined);

  result.forEach((row, rowIndex, roadArray) => {
    roadArray[rowIndex] = Array(columnCount).fill(undefined);
    roadArray[rowIndex].forEach((column, columnIndex, roadRow) => {
      const dataIndex = columnIndex * rowCount + rowIndex;
      const oldResult: BeadRoadItem | undefined = data[dataIndex];
      if (typeof oldResult !== 'undefined') {
        roadRow[columnIndex] = {
          result: data[dataIndex].result,
          gameResult: data[dataIndex].gameResult,
          pairResult: data[dataIndex].pairResult,
        };
      }
    });
  });
  return result;
}

export class BeadRoad extends Road<BeadRoadItem> {
  protected readonly array: RoadArray<BeadRoadItem>;

  constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    this.array = generateBeadRoadGraph(roundResults, row, column);
  }
}
