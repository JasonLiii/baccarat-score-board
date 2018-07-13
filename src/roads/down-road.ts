import { RoundResult } from '../round-result';
import { SharedBigRoad } from './shared-big-road';
import { Road, RoadArray } from './road';
import { BigRoadItem } from './big-road';

/**
 * 下三路所共用的 RoadItem 结构
 */
export type DownRoadItem = Readonly<{
  /**
   * RoundResult 对应的顺序
   */
  order: number; // 用于折行后确认先后关系
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
export function generateDownRoadData(
  bigRoadGraph: RoadArray<BigRoadItem>,
  rowGap: DownRoadGap,
): ReadonlyArray<DownRoadItem> {
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
          repetition:
            lengthArr[item.columnIndex - rowGap - 1] ===
            lengthArr[item.columnIndex - 1],
        });
      } else {
        const lastItem =
          bigRoadGraph[item.rowIndex - 1][item.columnIndex - rowGap];
        const targetItem =
          bigRoadGraph[item.rowIndex][item.columnIndex - rowGap];
        downGraphArr.push({
          order: item.order,
          repetition:
            typeof lastItem === 'undefined' ||
            typeof targetItem !== 'undefined',
        });
      }
    }
  });
  return downGraphArr;
}

export abstract class DownRoad extends Road<DownRoadItem> {
  /**
   * 庄问路 (对外暴露为 getter)
   * 即 下一局是庄赢的话 当前下路图的下一个 Item 是什么颜色的
   * ```
   const fakeNextRound: RoundResult = {
     order: this.roundResults.length,
     result: 0, // Dummy
     gameResult: GameResult.BankerWin,
     pairResult: PairResult.NoPair,
   };
   return this.getPrediction(fakeNextRound);
   * ```
   * @return {boolean} repetition - true 为红色 false 为蓝色
   */
  public abstract get bankerPrediction(): boolean;

  /**
   * 闲问路 (对外暴露为 getter)
   * 即 下一局是闲赢的话 当前下路图的下一个 Item 是什么颜色的
   * ```
   {
     const fakeNextRound: RoundResult = {
       order: this.roundResults.length,
       result: 0, // Dummy
       gameResult: GameResult.PlayerWin,
       pairResult: PairResult.NoPair,
     };
     return this.getPrediction(fakeNextRound);
   }
   * ```
   * @return {boolean} repetition - true 为红色 false 为蓝色
   */
  public abstract get playerPrediction(): boolean;

  /**
   * 庄/闲 问路 的结果
   */
  protected getPrediction(
    fakeNextRound: RoundResult,
    downRoadGap: DownRoadGap,
  ): boolean {
    const fakeRoundResults = this.roundResults.map(result =>
      RoundResult.from(result),
    ); // Todo: is deep copy necessary?
    fakeRoundResults.push(fakeNextRound);
    const fakeBigRoad = new SharedBigRoad(
      this.row,
      this.column,
      fakeRoundResults,
    );
    const fakeDownRoadData = generateDownRoadData(
      fakeBigRoad.rawArray,
      downRoadGap,
    );
    const fakeNextDownRoadItem = fakeDownRoadData[fakeDownRoadData.length - 1];
    return fakeNextDownRoadItem.repetition;
  }
}
