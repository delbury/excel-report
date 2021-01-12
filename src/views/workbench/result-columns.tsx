import { spawn } from 'child_process';
import { TableColumns } from './index';
import { Input } from 'antd';
import Result from './result';

export const columnsA: TableColumns = [
  {
    title: '单位',
    key: 'unitName',
    dataIndex: 'unitName',
    ellipsis: true,
    width: 120,
    fixed: 'left',
  },
  {
    title: '月份',
    key: 'month',
    dataIndex: 'month',
    ellipsis: true,
    width: 80,
    fixed: 'left',
  },
  {
    title: '培训项目数',
    key: 'trainProjectCount',
    dataIndex: 'trainProjectCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '培训总人次',
    key: 'trainPersonCount',
    dataIndex: 'trainPersonCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '理论培训课时',
    key: 'theoryHours',
    dataIndex: 'theoryHours',
    ellipsis: true,
    width: 100,
  },
  {
    title: '实操培训课时',
    key: 'practiceHours',
    dataIndex: 'practiceHours',
    ellipsis: true,
    width: 100,
  },
  // {
  //   title: '评估项目数',
  //   key: 'assessProjectCount',
  //   dataIndex: 'assessProjectCount',
  //   ellipsis: true,
  // },
  // {
  //   title: '评估人次',
  //   key: 'assessPersonCount',
  //   dataIndex: 'assessPersonCount',
  //   ellipsis: true,
  // },
  // {
  //   title: '合格率',
  //   key: 'rate',
  //   dataIndex: 'rate',
  //   ellipsis: true,
  // },
];

// export const columnsB: TableColumns = [];

export function getColumnsB(that: Result): TableColumns {
  return [
    {
      title: '单位',
      key: 'unitName',
      dataIndex: 'unitName',
      ellipsis: true,
      width: 120,
      fixed: 'left',
    },
    {
      title: '岗位',
      key: 'station',
      dataIndex: 'station',
      ellipsis: true,
      width: 120,
      fixed: 'left',
    },
    {
      title: '月份',
      key: 'month',
      dataIndex: 'month',
      ellipsis: true,
      width: 60,
      fixed: 'left',
    },
    {
      title: '现员人数',
      key: 'nowPersonCount',
      dataIndex: 'nowPersonCount',
      ellipsis: true,
      width: 100,
      fixed: 'left',
      render: (text, record, index) => {
        return (
          <Input
            type="number"
            size="small"
            min={0}
            step={1}
            onChange={(ev) => {
              const value: number = +ev.target.value;
              const rows = [...that.state.tableDataB];
              rows[index].nowPersonCount = value;
              rows[index].averTrainHours = value ? rows[index].trainHours / value : undefined;

              let lastM = -1;
              let lastP = -1;
              rows.forEach((row, index) => {
                if (row.type === 'M') {
                  if (lastM < 0) {
                    rows[index].yearAverHours = rows[index].averTrainHours ?? 0;
                  } else {
                    rows[index].yearAverHours = (rows[index].averTrainHours ?? 0) + (rows[lastM].averTrainHours ?? 0);
                  }
                  rows[index].completeRate = (rows[index].yearAverHours ?? 0) / 42;
                  lastM = index;
                } else if (row.type === 'P') {
                  if (lastP < 0) {
                    rows[index].yearAverHours = rows[index].averTrainHours ?? 0;
                  } else {
                    rows[index].yearAverHours = (rows[index].averTrainHours ?? 0) + (rows[lastP].averTrainHours ?? 0);
                  }
                  rows[index].completeRate = (rows[index].yearAverHours ?? 0) / 60;
                  lastP = index;
                }
              });
              that.setState({ tableDataB: rows });
            }}></Input>);
      }
    },
    {
      title: '培训课时',
      key: 'trainHours',
      dataIndex: 'trainHours',
      ellipsis: true,
      width: 80,
    },
    {
      title: '培训条数',
      key: 'trainCount',
      dataIndex: 'trainCount',
      ellipsis: true,
      width: 80,
    },
    {
      title: '培训人次',
      key: 'trainPersonCount',
      dataIndex: 'trainPersonCount',
      ellipsis: true,
      width: 80,
    },
    {
      title: '人均培训课时（小时）',
      key: 'averTrainHours',
      dataIndex: 'averTrainHours',
      ellipsis: true,
      width: 120,
    },
    {
      title: '年度累计人均课时（小时）',
      key: 'yearAverHours',
      dataIndex: 'yearAverHours',
      ellipsis: true,
      width: 120,
    },
    {
      title: '年度培训课时完成率',
      key: 'completeRate',
      dataIndex: 'completeRate',
      ellipsis: true,
      width: 120,
    },
  ];
}