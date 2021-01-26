import { TableDataRowNameList } from './columns-types';
import { EnumColumns } from './resolve-excel';

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
