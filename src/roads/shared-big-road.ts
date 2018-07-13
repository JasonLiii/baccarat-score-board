import { RoadArray } from './road';
import { BigRoad, BigRoadItem } from './big-road';

/**
 * 对外暴露出 getter() rawArray
 * 用于下三路的数据预处理
 */
export class SharedBigRoad extends BigRoad {
  public get rawArray(): RoadArray<BigRoadItem> {
    return this.array;
  }
}
