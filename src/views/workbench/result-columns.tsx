import { TableColumns } from './index';
import { Input } from 'antd';
import Result from './result';
import { TableDataRowA, TableDataRowB, TableDataRowC, TableDataRowD } from './result-table-types';

export const columnsA: TableColumns<TableDataRowA> = [
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
    key: 'monthName',
    dataIndex: 'monthName',
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

/**
 * 现员人数：手动输入
 * 人均培训课时：培训课时 / 现员人数
 * 年度累计人均课时：上一个月年度累计人均课时 + 本月人均培训课时
 * 年度培训课时完成率：全年年度累计人均课时 / 系数(42 | 60)
 */
export function getColumnsB(that: Result): TableColumns<TableDataRowB> {
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
      key: 'monthName',
      dataIndex: 'monthName',
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

              const sameTableRows = rows.filter(row => row.type === rows[index].type && row.unitName === rows[index].unitName);
              const k: number = rows[index].type === 'M' ? 42 : rows[index].type === 'P' ? 60 : 1; // 年度培训课时完成率系数
              // 计算年度累计人均课时
              sameTableRows.forEach((row, ind) => {
                if (ind === 0) {
                  row.yearAverHours = row.averTrainHours ?? 0;
                } else {
                  row.yearAverHours = (row.averTrainHours ?? 0) + (rows[ind - 1].yearAverHours ?? 0);
                }
                row.completeRate = (row.yearAverHours ?? 0) / k;
              });
              // 计算年度培训课时完成率
              // sameTableRows.forEach((row, ind) => {
              //   row.completeRate = (row.yearAverHours ?? 0) / 42;
              // });

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

export function getColumnsC(that: Result): TableColumns<TableDataRowC> {
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
      title: '月份',
      key: 'monthName',
      dataIndex: 'monthName',
      ellipsis: true,
      width: 60,
      fixed: 'left',
    },
    {
      title: '培训师人数',
      key: 'personCount',
      dataIndex: 'personCount',
      ellipsis: true,
      width: 100,
      render: (text, record, index) => {
        return (
          <Input
            type="number"
            size="small"
            min={0}
            step={1}
            value={record.personCount}
            onChange={(ev) => {
              const value: number = +ev.target.value;
              const rows = [...that.state.tableDataC];
              rows[index].personCount = value;
              rows[index].rate = value ? rows[index].personCourseCount / value : undefined;

              rows.forEach((row, index) => {
               
              });
              that.setState({ tableDataC: rows });
            }}></Input>);
      }
    },
    {
      title: '培训师授课人数',
      key: 'personCourseCount',
      dataIndex: 'personCourseCount',
      ellipsis: true,
      width: 100,
    },
    {
      title: '培训师利用率',
      key: 'rate',
      dataIndex: 'rate',
      ellipsis: true,
      width: 100,
    },
    {
      title: '总授课学时',
      key: 'totalHours',
      dataIndex: 'totalHours',
      ellipsis: true,
      width: 100,
    },
    {
      title: '人均授课学时',
      key: 'averHours',
      dataIndex: 'averHours',
      ellipsis: true,
      width: 100,
    },
  ];
};

export const columnsD: TableColumns<TableDataRowD> = [
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
    key: 'monthName',
    dataIndex: 'monthName',
    ellipsis: true,
    width: 80,
    fixed: 'left',
  },
  {
    title: '评估项目数',
    key: 'projectCount',
    dataIndex: 'projectCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '评估人次',
    key: 'assessCount',
    dataIndex: 'assessCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '合格率',
    key: 'passedRate',
    dataIndex: 'passedRate',
    ellipsis: true,
    width: 100,
  },
  {
    title: '通过人次',
    key: 'passedCount',
    dataIndex: 'passedCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '未通过人次',
    key: 'failedCount',
    dataIndex: 'failedCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '理论验收人次',
    key: 'theoryCount',
    dataIndex: 'theoryCount',
    ellipsis: true,
    width: 100,
  },
  {
    title: '实操验收人次',
    key: 'trainCount',
    dataIndex: 'trainCount',
    ellipsis: true,
    width: 100,
  },
];