import { TableDataRowNameList } from './columns-types';
import { EnumColumns, enumColumns } from './enums';
// import { TableDataRow } from '../index-types';

type Ks = keyof enumColumns;
export interface ResolvedDataType {
  id?: string;
  [key: string]: any;
  Name: string; // 姓名
  Phone: string; // 手机
  Score: number | string; // 得分
  Pass: string; // 是否通过
  Time: string; // 交卷时间
  Duration: string; // 考试用时
  Code: string; // 员工编码
  Major: string; // 所属专业
  Unit: string; // 所在单位
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