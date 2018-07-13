import { GameResult, PairResult, RoundResult } from '../round-result';
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
 * 根据 BigRoad 生成 BigEyeRoad 所需一维数据
 */
function generateBigEyeRoadItemList(
  bigRoadItemGraph: RoadArray<BigRoadItem>,
): ReadonlyArray<DownRoadItem> {
  return generateDownRoadData(bigRoadItemGraph, DownRoadGap.BigEyeRoadGap);
}

/**
 * 生成 BigEyeRoad 对应的二维数组
 */
function generateBigEyeRoadGraph(
  bigEyeRoadData: ReadonlyArray<DownRoadItem>,
  rowCount: number,
  columnCount: number,
): RoadArray<DownRoadItem> {
  return wrapRow(
    wrapColumn(
      bigEyeRoadData,
      (previousItem, currentItem) =>
        previousItem.repetition === currentItem.repetition,
    ),
    rowCount,
    columnCount,
  );
}

export class BigEyeRoad extends Road<DownRoadItem> {
  protected readonly array: RoadArray<DownRoadItem>;

  public constructor(
    protected readonly row: number,
    protected readonly column: number,
    protected readonly roundResults: ReadonlyArray<RoundResult>,
  ) {
    super(row, column, roundResults);
    const bigRoad = new SharedBigRoad(row, roundResults.length, roundResults);
    const bigEyeRoadData = generateBigEyeRoadItemList(bigRoad.rawArray);
    this.array = generateBigEyeRoadGraph(bigEyeRoadData, row, column);
  }

  // public get bankerNext(): number {
  //   const bigRoad = new SharedBigRoad(6, 6, this.roundResults); // Todo: 六列是否合适?
  //   const downRoadData = generateDownRoadData(bigRoad.rawArray, DownRoadGap.BigEyeRoadGap);
  //
  //   /**
  //    * 更新庄/闲问路信息
  //    */
  //   function updatePredictions(baccaratItemList: ReadonlyArray<RoundResult>): void {
  //     /** 已知baccaratItemList的index一定是按顺序递增的 */
  //     const fakeRedList = Array.from(baccaratItemList);
  //     fakeRedList.push({
  //       index: fakeRedList.length,
  //       winner: 'banker',
  //       value: 0,
  //       bankerPair: false,
  //       playerPair: false,
  //     });
  //     const fakeRedResult = generatePredictions(fakeRedList);
  //     const fakeBlueList = Array.from(baccaratItemList);
  //     fakeBlueList.push({
  //       index: fakeBlueList.length,
  //       winner: 'player',
  //       value: 0,
  //       bankerPair: false,
  //       playerPair: false,
  //     });
  //     const fakeBlueResult = generatePredictions(fakeBlueList);
  //     /**
  //      * 给playerNext/bankerNext内对应的div修改className(A bit tricky)
  //      * 约定：每个element的children均包含3个HTMLDivElement 分别可以修改classList为circle/solid/slash
  //      */
  //     ['circle', 'solid', 'slash'].forEach((suffix: 'circle' | 'solid' | 'slash', index: number): void => {
  //       playerNext.children.item(index).className = fakeBlueResult[index]
  //         ? fakeBlueResult[index]!.winner === 'banker' ? `red-${suffix}` : `blue-${suffix}`
  //         : '';
  //       bankerNext.children.item(index).className = fakeRedResult[index]
  //         ? fakeRedResult[index]!.winner === 'banker' ? `red-${suffix}` : `blue-${suffix}`
  //         : '';
  //     });
  //   }
  //
  //   return 0;
  // }
  /**
   * BigEyeRoad 庄问路
   * 即 下一局是庄赢的话 BigEyeRoad 的下一个 Item 是什么颜色的
   * @return {boolean} repetition - true 为红色 false 为蓝色
   */
  public get bankerPrediction(): boolean {
    const fakeNextRound: RoundResult = {
      order: this.roundResults.length,
      result: 0, // Dummy
      gameResult: GameResult.BankerWin,
      pairResult: PairResult.NoPair,
    };
    return this.getPrediction(fakeNextRound);
  }

  /**
   * BigEyeRoad 闲问路
   * 即 下一局是闲赢的话 BigEyeRoad 的下一个 Item 是什么颜色的
   * @return {boolean} repetition - true 为红色 false 为蓝色
   */
  public get playerPrediction(): boolean {
    const fakeNextRound: RoundResult = {
      order: this.roundResults.length,
      result: 0, // Dummy
      gameResult: GameResult.PlayerWin,
      pairResult: PairResult.NoPair,
    };
    return this.getPrediction(fakeNextRound);
  }

  /**
   * 庄/闲 问路 的结果
   */
  private getPrediction(fakeNextRound: RoundResult): boolean {
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
      DownRoadGap.BigEyeRoadGap,
    );
    const fakeNextDownRoadItem = fakeDownRoadData[fakeDownRoadData.length - 1];
    return fakeNextDownRoadItem.repetition;
  }
}
