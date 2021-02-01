import { ColumnsType, ColumnType } from 'antd/es/table';

export interface TableDataRow {
  id?: string;
  [key: string]: any;
}
export type TableData = TableDataRow[];
// export type TableColumn<T = object> = ColumnType<T>;
// export type TableColumns<T = object> = ColumnsType<T>;
interface AdditionalColumn {
  titleName: string;
}
export interface TableColumn<T = object> extends ColumnType<T>, AdditionalColumn { }
export type TableColumns<T = object> = TableColumn<T>[];

export type TableColumnsMap = Map<string, TableColumn>;
export { ColumnsType, ColumnType };
