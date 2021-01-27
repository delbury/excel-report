import { TableColumns } from '../index-types';
import { TableDataRowNameList } from './columns-types';
import { ResolvedDataType } from './index-types';
import { Button } from 'antd';
import { LinkOutlined, DisconnectOutlined } from '@ant-design/icons';

export const getColumnsNameList = (cb: (record?: TableDataRowNameList, index?: number) => any): TableColumns<TableDataRowNameList> => {

  return [
    {
      title: '序号',
      titleName: '序号',
      key: '_order',
      dataIndex: '_order',
      ellipsis: true,
      width: 60,
      fixed: true,
      render: (text, record, index) => `${ index + 1 }`,
    },
    {
      title: '操作',
      titleName: '操作',
      key: '_operation',
      dataIndex: '_operation',
      ellipsis: true,
      width: 50,
      fixed: true,
      render: (text, record, index) => {
        return (
          <Button
            ghost
            type="primary"
            size="small"
            icon={<DisconnectOutlined />}
            shape="circle"
            onClick={() => cb(record, index)}
            disabled={!record.score}
          ></Button>
        );
      },
    },
    {
      title: '单位',
      titleName: '单位',
      key: 'unitName',
      dataIndex: 'unitName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '姓名',
      titleName: '姓名',
      key: 'name',
      dataIndex: 'name',
      ellipsis: true,
      width: 80,
    },
    {
      title: '手机号码',
      titleName: '手机号码',
      key: 'phone',
      dataIndex: 'phone',
      ellipsis: true,
      width: 100,
    },
    {
      title: '岗位',
      titleName: '岗位',
      key: 'station',
      dataIndex: 'station',
      ellipsis: true,
      width: 100,
    },
    {
      title: '成绩',
      titleName: '成绩',
      key: 'score',
      dataIndex: 'score',
      ellipsis: true,
      width: 100,
    },
    {
      title: '结果',
      titleName: '结果',
      key: 'result',
      dataIndex: 'result',
      ellipsis: true,
      width: 100,
    },
  ];
};


export const getColumnsResolvedData = (cb: (record?: ResolvedDataType, index?: number) => any): TableColumns<ResolvedDataType> => {

  return [
    {
      title: '序号',
      titleName: '序号',
      key: '_order',
      dataIndex: '_order',
      ellipsis: true,
      width: 50,
      fixed: true,
      render: (text, record, index) => `${ index + 1 }`,
    },
    {
      title: '操作',
      titleName: '操作',
      key: '_operation',
      dataIndex: '_operation',
      ellipsis: true,
      width: 50,
      fixed: true,
      render: (text, record, index) => {
        return (
          <Button
            ghost
            type="primary"
            size="small"
            icon={<LinkOutlined />}
            shape="circle"
            onClick={() => cb(record, index)}
          ></Button>
        );
      },
    },
    {
      title: '姓名',
      titleName: '姓名',
      key: 'B',
      dataIndex: 'B',
      ellipsis: true,
      width: 80,
      fixed: true,
    },
    {
      title: '手机号码',
      titleName: '手机号码',
      key: 'C',
      dataIndex: 'C',
      ellipsis: true,
      width: 120,
    },
    {
      title: '得分',
      titleName: '得分',
      key: 'D',
      dataIndex: 'D',
      ellipsis: true,
      width: 100,
    },
    {
      title: '是否通过',
      titleName: '是否通过',
      key: 'E',
      dataIndex: 'E',
      ellipsis: true,
      width: 100,
    },
    {
      title: '交卷时间',
      titleName: '交卷时间',
      key: 'F',
      dataIndex: 'F',
      ellipsis: true,
      width: 160,
    },
    {
      title: '考试用时',
      titleName: '考试用时',
      key: 'G',
      dataIndex: 'G',
      ellipsis: true,
      width: 100,
    },
    {
      title: '员工编码',
      titleName: '员工编码',
      key: 'H',
      dataIndex: 'H',
      ellipsis: true,
      width: 100,
    },
    {
      title: '所属专业',
      titleName: '所属专业',
      key: 'I',
      dataIndex: 'I',
      ellipsis: true,
      width: 120,
    },
    {
      title: '所在单位',
      titleName: '所在单位',
      key: 'J',
      dataIndex: 'J',
      ellipsis: true,
      width: 160,
    },
  ];
};
