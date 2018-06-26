import { RoundResult } from '../round-result';

/**
 * 将RoadItem[]转换为RoadItem[][]
 */
export function wrapColumn(
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
 * 将RoadItem[][]转换为RoadItem[][rowCount]
 */
export function wrapRow(
  roadItemGraph: ReadonlyArray<ReadonlyArray<RoundResult | undefined>>,
  rowCount: number,
): ReadonlyArray<ReadonlyArray<RoundResult | undefined>> {
  const resultGraph: (RoundResult | undefined)[][] = Array(rowCount)
    .fill(undefined)
    .map(() => []);
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
