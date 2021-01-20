import { TableColumns } from '../index-types';
import { TableDataRowNameList } from './columns-types';

export const columnsNameList: TableColumns<TableDataRowNameList> = [
  {
    title: '序号',
    key: '_order',
    dataIndex: '_order',
    ellipsis: true,
    width: 40,
    render: (text, record, index) => `${ index + 1 }`,
  },
  {
    title: '单位',
    key: 'unitName',
    dataIndex: 'unitName',
    ellipsis: true,
    width: 180,
  },
  {
    title: '姓名',
    key: 'name',
    dataIndex: 'name',
    ellipsis: true,
    width: 80,
  },
  {
    title: '手机号码',
    key: 'phone',
    dataIndex: 'phone',
    ellipsis: true,
    width: 100,
  },
  {
    title: '岗位',
    key: 'station',
    dataIndex: 'station',
    ellipsis: true,
    width: 100,
  },
  {
    title: '成绩',
    key: 'score',
    dataIndex: 'score',
    ellipsis: true,
    width: 100,
  },
  {
    title: '结果',
    key: 'result',
    dataIndex: 'result',
    ellipsis: true,
    width: 100,
  },
];