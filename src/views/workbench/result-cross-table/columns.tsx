import { TableColumns } from '../index-types';
import { TableDataRowNameList, TableDataRowChart, TableDataRowNameListMerged } from './columns-types';
import { ResolvedDataType } from './index-types';
import { Button, Tooltip } from 'antd';
import { LinkOutlined, DisconnectOutlined, SelectOutlined } from '@ant-design/icons';
import React from 'react';

export const getColumnsNameList = (
  type?: 'unmatch' | 'select',
  cb?: (record?: TableDataRowNameList, index?: number) => any,
): TableColumns<TableDataRowNameList> => {
  // 是否有操作列
  const operation: TableColumns<TableDataRowNameList> = type === 'unmatch' ? [
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
          <Tooltip title="取消匹配" placement="left">
            <Button
              ghost
              type="primary"
              size="small"
              icon={<DisconnectOutlined />}
              shape="circle"
              onClick={() => cb && cb(record, index)}
              disabled={!record.isMatched}
            ></Button>
          </Tooltip>
        );
      },
    },
  ] : type === 'select' ? [
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
            icon={<SelectOutlined />}
            shape="circle"
            onClick={() => cb && cb(record, index)}
            disabled={record.isMatched}
          ></Button>
        );
      },
    },
  ] : [];

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
    ...operation,
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

// 导出的成绩合并表头
export const columnsNameListMerged: TableColumns<TableDataRowNameListMerged> = [
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
    width: 150,
  },
  {
    title: '一次成绩',
    titleName: '一次成绩',
    key: 'score1',
    dataIndex: 'score1',
    ellipsis: true,
    width: 100,
  },
  {
    title: '一次通过',
    titleName: '一次通过',
    key: 'result1',
    dataIndex: 'result1',
    ellipsis: true,
    width: 100,
  },
  {
    title: '二次成绩',
    titleName: '二次成绩',
    key: 'score2',
    dataIndex: 'score2',
    ellipsis: true,
    width: 100,
  },
  {
    title: '二次通过',
    titleName: '二次通过',
    key: 'result2',
    dataIndex: 'result2',
    ellipsis: true,
    width: 100,
  },
];

// 导入的成绩表格格式
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
          <Tooltip title="手动匹配" placement="left">
            <Button
              ghost
              type="primary"
              size="small"
              icon={<LinkOutlined />}
              shape="circle"
              onClick={() => cb(record, index)}
            ></Button>
          </Tooltip>
        );
      },
    },
    {
      title: '姓名',
      titleName: '姓名',
      key: 'Name',
      dataIndex: 'Name',
      ellipsis: true,
      width: 80,
      fixed: true,
    },
    {
      title: '手机号码',
      titleName: '手机号码',
      key: 'Phone',
      dataIndex: 'Phone',
      ellipsis: true,
      width: 120,
    },
    {
      title: '得分',
      titleName: '得分',
      key: 'Score',
      dataIndex: 'Score',
      ellipsis: true,
      width: 100,
    },
    {
      title: '是否通过',
      titleName: '是否通过',
      key: 'Pass',
      dataIndex: 'Pass',
      ellipsis: true,
      width: 100,
    },
    {
      title: '交卷时间',
      titleName: '交卷时间',
      key: 'Time',
      dataIndex: 'Time',
      ellipsis: true,
      width: 160,
    },
    {
      title: '考试用时',
      titleName: '考试用时',
      key: 'Duration',
      dataIndex: 'Duration',
      ellipsis: true,
      width: 100,
    },
    {
      title: '员工编码',
      titleName: '员工编码',
      key: 'Code',
      dataIndex: 'Code',
      ellipsis: true,
      width: 100,
    },
    {
      title: '所属专业',
      titleName: '所属专业',
      key: 'Major',
      dataIndex: 'Major',
      ellipsis: true,
      width: 120,
    },
    {
      title: '所在单位',
      titleName: '所在单位',
      key: 'Unit',
      dataIndex: 'Unit',
      ellipsis: true,
      width: 160,
    },
  ];
};

// 图表导出表格
export const columnsCharts: TableColumns<TableDataRowChart> = [
  {
    title: '单位',
    titleName: '单位',
    key: 'unitName',
    dataIndex: 'unitName',
    ellipsis: true,
    width: 200,
  },
  {
    title: '月份',
    titleName: '月份',
    key: 'monthName',
    dataIndex: 'monthName',
    ellipsis: true,
    width: 80,
  },
  {
    title: '考试人数',
    titleName: '考试人数',
    key: 'joinedPeople',
    dataIndex: 'joinedPeople',
    ellipsis: true,
    width: 100,
  },
  {
    title: '合格线',
    titleName: '合格线',
    key: 'passLine',
    dataIndex: 'passLine',
    ellipsis: true,
    width: 100,
  },
  {
    title: '平均分',
    titleName: '平均分',
    key: 'averageScores',
    dataIndex: 'averageScores',
    ellipsis: true,
    width: 100,
  },
  {
    title: '合格率',
    titleName: '合格率',
    key: 'passedRate',
    dataIndex: 'passedRate',
    ellipsis: true,
    width: 100,
  },
  {
    title: '补考合格率',
    titleName: '补考合格率',
    key: 'rePassedRate',
    dataIndex: 'rePassedRate',
    ellipsis: true,
    width: 100,
  },
  {
    title: '总合格率',
    titleName: '总合格率',
    key: 'allPassedRate',
    dataIndex: 'allPassedRate',
    ellipsis: true,
    width: 100,
  },
  {
    title: '主要问题',
    titleName: '主要问题',
    key: 'remark',
    dataIndex: 'remark',
    ellipsis: true,
    width: 150,
  },
];
