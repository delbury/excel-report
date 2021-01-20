import { TableDataRow } from '../index-types';

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
};
export interface TableDataRowNameList extends TableDataRowBasisNameList, TableDataRow { };