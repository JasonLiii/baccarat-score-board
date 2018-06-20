import { RoundResult } from '../round-result';

export type RoadRow = ReadonlyArray<RoundResult | undefined>;
// Todo: 检查是否会出现空行空列?
export type RoadArray = ReadonlyArray<RoadRow | undefined>;

export abstract class Road {
  protected abstract readonly array: RoadArray;

  protected constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    if (
      !Number.isInteger(row) ||
      !Number.isInteger(column) ||
      row <= 0 ||
      column <= 0
    ) {
      throw new Error('Row/Column must be positive integer');
    }
  }

  public getItem(
    rowIndex: number,
    columnIndex: number,
  ): RoundResult | undefined {
    const row: RoadRow | undefined = this.array[rowIndex];
    if (typeof row !== 'undefined') {
      return row[columnIndex];
    } else {
      return undefined;
    }
  }
}
