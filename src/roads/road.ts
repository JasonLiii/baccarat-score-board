import { RoundResult } from '../round-result';

// Editable RoadRow, internal use only
export type InnerRoadRow = (RoundResult | undefined)[];
// Editable RoadArray, internal use only
export type InnerRoadArray = InnerRoadRow[];

export type RoadRow = ReadonlyArray<RoundResult | undefined>;
export type RoadArray = ReadonlyArray<RoadRow>;

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

  public get rowCount(): number {
    return this.row;
  }

  public get columnCount(): number {
    return this.column;
  }

  public getItem(
    rowIndex: number,
    columnIndex: number,
  ): RoundResult | undefined {
    return this.array[rowIndex][columnIndex];
  }
}
