import { InnerRoadArray, RoadArray } from './road';
import { BigRoadItem } from './big-road';


/**
 * 下三路所共用的 RoadItem 结构
 */
export type DownRoadItem = Readonly<{
  /**
   * RoundResult 对应的顺序
   */
  order: number, // 用于折行后确认先后关系
  /**
   * repetition === true 为红色 否则为蓝色
   */
  repetition: boolean; // (大路中)是否与前面指定列指定位置均有值
}>;

/**
 * DownRoadGap 下三路进行对比的列数间隔
 * 大眼路/小路/小强路分别对应1/2/3
 * @enum {number}
 */
export const enum DownRoadGap {
  BigEyeRoadGap = 1,
  SmallRoadGap = 2,
  CockroachRoadGap = 3,
}

/**
 * 根据 BigRoad 生成下三路所需一维数据
 * @param bigRoadGraph
 * @param rowGap
 */
export function generateDownRoadData(bigRoadGraph: RoadArray<BigRoadItem>, rowGap: DownRoadGap): ReadonlyArray<DownRoadItem> {
  /**
   * 用于辅助生成路子图的IndexItemList
   */
  interface IndexItem {
    rowIndex: number;
    columnIndex: number;
    order: number;
  }

  const maxColumnCount = Math.max(0, ...bigRoadGraph.map(row => row.length));
  const downGraphArr: DownRoadItem[] = [];
  const down: DownRoadItem = { order: 1, repetition: false };
  downGraphArr.push(down);
  const indexArr: IndexItem[] = [];
  const lengthArr: number[] = [];
  let beginIndex: number;
  for (let columnIndex = 0; columnIndex < maxColumnCount; columnIndex++) {
    let currentLength = 0;
    for (let rowIndex = 0; rowIndex < bigRoadGraph.length; rowIndex++) {
      const item = bigRoadGraph[rowIndex][columnIndex];
      if (typeof item !== 'undefined') {
        currentLength++;
        indexArr.push({
          rowIndex: rowIndex,
          columnIndex: columnIndex,
          order: item.order,
        });
      }
    }
    lengthArr.push(currentLength);
  }
  {
    const item1 = bigRoadGraph[1][rowGap];
    const item2 = bigRoadGraph[0][rowGap + 1];
    if (typeof item1 !== 'undefined') {
      beginIndex = item1.order;
    } else if (typeof item2 !== 'undefined') {
      beginIndex = item2.order;
    } else {
      return downGraphArr;
    }
  }
  indexArr.sort((a, b) => a.order - b.order);
  indexArr.forEach(item => {
    if (item.order >= beginIndex) {
      if (item.rowIndex === 0) {
        downGraphArr.push({
          order: item.order,
          repetition: lengthArr[item.columnIndex - rowGap - 1] === lengthArr[item.columnIndex - 1],
        });
      } else {
        const lastItem = bigRoadGraph[item.rowIndex - 1][item.columnIndex - rowGap];
        const targetItem = bigRoadGraph[item.rowIndex][item.columnIndex - rowGap];
        downGraphArr.push({
          order: item.order,
          repetition: typeof lastItem === 'undefined' || typeof targetItem !== 'undefined',
        });
      }
    }
  });
  return downGraphArr;
}


/**
 * 将 Item[] 转换为 Item[][]
 * 根据给定的 shouldNoWrapFn() 来判断应当在何处开始新一列
 */
export function wrapColumn<T extends object>(
  this: void,
  roadItemList: ReadonlyArray<T>,
  shouldNoWrapFn: (previousItem: T, currentItem: T) => boolean,
): RoadArray<T> {
  const resultGraph: InnerRoadArray<T> = [];
  let tempColumn: T[] = [];
  for (let i = 0; i < roadItemList.length; i++) {
    if (tempColumn.length === 0) {
      tempColumn.push(roadItemList[i]);
    } else if (shouldNoWrapFn(tempColumn[tempColumn.length - 1], roadItemList[i])) {
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
 * 将 RoadItem[rowCount][] 转换为 RoadItem[rowCount][columnCount]
 * 已知此时的 roadItemGraph 每行长度均一致
 */
function truncateColumn<T extends object>(
  this: void,
  roadItemGraph: InnerRoadArray<T>,
  columnCount: number,
): void {
  roadItemGraph.forEach(row => {
    if (columnCount < row.length) {
      row.splice(0, row.length - columnCount);
    } else {
      row.push(...Array(columnCount - row.length).fill(undefined));
    }
  });
}

/**
 * 将 RoadItem[][] 转换为 RoadItem[rowCount][columnCount]
 * Todo: refactor
 */
export function wrapRow<T extends object>(
  this: void,
  roadItemGraph: RoadArray<T>,
  rowCount: number,
  columnCount: number,
): RoadArray<T> {
  const resultGraph: InnerRoadArray<T> = Array(rowCount)
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

  // 获取最大行的宽度
  const maxColCount = Math.max(
    0, // In case no row exists
    ...resultGraph.map(row => row.length),
  );
  // 使用 undefined 填充所有行的宽度为最大行宽度
  resultGraph.forEach(row => {
    while (row.length < maxColCount) {
      row.push(undefined);
    }
  });
  // 限制列数
  truncateColumn<T>(resultGraph, columnCount);
  return resultGraph;
}
