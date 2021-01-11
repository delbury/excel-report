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
  },
  {
    title: '月份',
    key: 'month',
    dataIndex: 'month',
    ellipsis: true,
    width: '80px'
  },
  {
    title: '培训项目数',
    key: 'trainProjectCount',
    dataIndex: 'trainProjectCount',
    ellipsis: true,
  },
  {
    title: '培训总人次',
    key: 'trainPersonCount',
    dataIndex: 'trainPersonCount',
    ellipsis: true,
  },
  {
    title: '理论培训课时',
    key: 'theoryHours',
    dataIndex: 'theoryHours',
    ellipsis: true,
  },
  {
    title: '实操培训课时',
    key: 'practiceHours',
    dataIndex: 'practiceHours',
    ellipsis: true,
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

export function getColumnsB(): TableColumns {
  return [
    {
      title: '单位',
      key: 'unitName',
      dataIndex: 'unitName',
      ellipsis: true,
    },
    {
      title: '岗位',
      key: 'station',
      dataIndex: 'station',
      ellipsis: true,
    },
    {
      title: '月份',
      key: 'month',
      dataIndex: 'month',
      ellipsis: true,
      width: '80px',
    },
    {
      title: '现员人数',
      key: 'nowPersonCount',
      dataIndex: 'nowPersonCount',
      ellipsis: true,
      render: (text, record, index) => {
        // @ts-ignore
        return (<Input type="number" size="small" onChange={(ev) => {
          const value: number = +ev.target.value;
          // @ts-ignore
          const rows = [...this.state.tableDataB];
          rows[index].nowPersonCount = value;
          rows[index].averTrainHours = value ? rows[index].trainHours / value : undefined;
          
          let lastM = -1;
          let lastP = -1;
          rows.forEach((row, index) => {
            if (row.type === 'M') {
              if (lastM < 0) {
                rows[index].yearAverHours = rows[index].averTrainHours ?? 0;
              } else {
                rows[index].yearAverHours = rows[index].averTrainHours ?? 0 + rows[lastM].averTrainHours;
              }
              rows[index].completeRate = rows[index].yearAverHours / 42;
              lastM = index;
            } else if (row.type === 'P') {
              if (lastP < 0) {
                rows[index].yearAverHours = rows[index].averTrainHours ?? 0;
              } else {
                rows[index].yearAverHours = rows[index].averTrainHours ?? 0 + rows[lastP].averTrainHours;
              }
              rows[index].completeRate = rows[index].yearAverHours / 60;
              lastP = index;
            }
          });

          // @ts-ignore
          this.setState({ tableDataB: rows });
        }}></Input>);
      }
    },
    {
      title: '培训课时',
      key: 'trainHours',
      dataIndex: 'trainHours',
      ellipsis: true,
    },
    {
      title: '培训条数',
      key: 'trainCount',
      dataIndex: 'trainCount',
      ellipsis: true,
    },
    {
      title: '培训人次',
      key: 'trainPersonCount',
      dataIndex: 'trainPersonCount',
      ellipsis: true,
    },
    {
      title: '人均培训课时（小时）',
      key: 'averTrainHours',
      dataIndex: 'averTrainHours',
      ellipsis: true,
    },
    {
      title: '年度累计人均课时（小时）',
      key: 'yearAverHours',
      dataIndex: 'yearAverHours',
      ellipsis: true,
    },
    {
      title: '年度培训课时完成率',
      key: 'completeRate',
      dataIndex: 'completeRate',
      ellipsis: true,
    },
  ];
}