import { Road, RoadArray, RoadRow } from './road';
import { GameResult, RoundResult } from '../round-result';

/**
 * 将RoadItem[]转换为RoadItem[][]
 */
function wrapColumn(
  roadItemList: ReadonlyArray<RoundResult>,
): ReadonlyArray<ReadonlyArray<RoundResult>> {
  const resultGraph: RoundResult[][] = [];
  let tempColumn: RoundResult[] = [];
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
 * 将RoadItem[][]转换为RoadItem[][6]
 */
function wrapRow(
  roadItemGraph: ReadonlyArray<ReadonlyArray<RoundResult | undefined>>,
  rowCount: number,
): ReadonlyArray<ReadonlyArray<RoundResult | undefined>> {
  const resultGraph: (RoundResult | undefined)[][] = [[], [], [], [], [], []];
  let count = 0;
  let countTie = 0;
  let currentRowIndex = 0;
  let currentColumnIndex = 0;
  let isTurn = false;
  let temp = false;
  for (let c = 0; c < roadItemGraph.length; c++) {
    if (isTurn && currentRowIndex === 0) {
      temp = true;
    }
    if (temp && currentRowIndex === 0) {
      count = currentColumnIndex + 1;
    } else if (temp) {
      count = currentColumnIndex - countTie + 1;
    } else {
      count = c;
    }
    isTurn = false;
    countTie = 0;
    for (let r = 0; r < roadItemGraph[c].length; r++) {
      if (roadItemGraph[c][r] !== undefined) {
        if (r < rowCount) {
          if (!resultGraph[r][count] && !isTurn) {
            resultGraph[r][count] = roadItemGraph[c][r];
            currentRowIndex = r;
            currentColumnIndex = count;
          } else {
            resultGraph[currentRowIndex][++currentColumnIndex] =
              roadItemGraph[c][r];
            isTurn = true;
            countTie++;
          }
        } else {
          isTurn = true;
          resultGraph[currentRowIndex][++currentColumnIndex] =
            roadItemGraph[c][r];
          countTie++;
        }
      } else {
        break;
      }
    }
  }
  return resultGraph;
}

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
