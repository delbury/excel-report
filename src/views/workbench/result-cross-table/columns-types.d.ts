import { TableDataRow } from '../index-types';
import { ChartStatisticalParams } from './index-types';

// 需要从外部获取的字段 map 映射关系字段类型
export interface ExternalParamsMap {
  unitName: string;
  name: string;
  station: string;
  phone: string;
}

export interface TableDataRowBasisNameList {
  unitName: string;
  name: string;
  station: string;
  phone: string;
  score?: number;
  result?: string;
  isOutsource: boolean; // 是否是委外单位
  isMatched?: boolean; // 是否已匹配
  matchedId?: string; // 匹配项的 id
};

export interface TableDataRowNameList extends TableDataRowBasisNameList, TableDataRow { };

export interface TableDataRowChartBasis extends ChartStatisticalParams {
  unitName: string;
  monthName: string;
  passLine?: number;
  remark?: string;
  rePassedRate?: number;
}

export interface TableDataRowChart extends TableDataRowChartBasis, TableDataRow { };