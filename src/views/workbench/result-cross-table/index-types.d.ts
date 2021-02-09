import { TableDataRowNameList } from './columns-types';
import { EnumColumns } from './resolve-excel';
// import { TableDataRow } from '../index-types';

export interface ResolvedDataType {
  id?: string;
  [key: string]: EnumColumns;
} 

export interface DataCachesType {
  first: TableDataRowNameList[];
  second: TableDataRowNameList[];
}

export interface ResolvedDataTypeMap {
  first: ResolvedDataType[];
  second: ResolvedDataType[];
}

export type UnmatchedCachesType = ResolvedDataTypeMap;
export { TableDataRowNameList };

export interface ChartBasisParams {
  joinedRate?: number; // 参考率
  passedRate?: number; // 通过率
  averageScores?: number; // 参考人员平均分
  allPassedRate?: number; // 两次总通过率
  allPassedPeople?: number; // 两次通过人数
  allJoinedPeople?: number; // 两次总参考人数
}

export interface ChartStatisticalParams extends ChartBasisParams {
  totalPeople: number; // 总人数
  joinedPeople: number; // 参考人数
  passedPeople: number; // 通过人数
  totalScores: number; // 参考人员总分
  isOutsource: boolean; // 是否是委外单位
}