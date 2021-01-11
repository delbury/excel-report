import React from 'react';
import { TableColumnsMap, TableData, TableColumns, TableDataRow } from './index';
import { Table, Button } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { columnsA, getColumnsB } from './result-columns';

interface TableDataRowA {
  trainProjectCount: number;
  trainPersonCount: number;
  theoryHours: number;
  practiceHours: number;
  unitName: string;
};
interface TableDataRowB {
  type: 'M' | 'P';
  unitName: string;
  station: string;
  month: number;
  nowPersonCount?: number;
  trainHours: number;
  trainCount: number;
  trainPersonCount: number;
  averTrainHours?: number;
  yearAverHours?: number;
  completeRate?: number;
};

interface IProps {
  outerData: TableData;
  outerColumns: TableColumns;
}
interface IState {
  tableDataA: TableData;
  tableColumnsA: TableColumns;
  tableDataB: TableData;
  tableColumnsB: TableColumns;
}

class Result extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      tableDataA: [],
      tableColumnsA: columnsA,
      tableDataB: [],
      tableColumnsB: getColumnsB.call(this),
    };
  }

  // 计算表格
  handleCalc = () => {
    let idCount: number = Date.now();
    // 表 A
    const mapA: Map<number, TableDataRowA> = new Map();
    this.props.outerData.forEach(item => {
      if (item.V === '培训师' && item.H === '必知必会培训') {
        const month = +item.B.split('/')[0];

        if (mapA.has(month)) {
          const old = mapA.get(month);
          if (old) {
            old.trainProjectCount += 1;
            old.trainPersonCount += +item.AD;
            old.theoryHours += +item.AE;
            old.practiceHours += +item.AF;
          }

        } else {
          mapA.set(month, {
            trainProjectCount: 1,
            trainPersonCount: +item.AD,
            theoryHours: +item.AE,
            practiceHours: +item.AF,
            unitName: item.F,
          });
        }
      }
    });

    const dataA: TableDataRow[] = [];
    for (let [key, params] of mapA.entries()) {
      dataA.push({
        id: (idCount++).toString(),
        ...params,
        month: key,
      });
    }

    this.setState({ tableDataA: dataA });

    // 表 B
    const mapB: Map<string, TableDataRowB> = new Map();
    this.props.outerData.forEach(item => {
      if (item.V === '培训师') {
        // M：管理，P：生产
        const month = +item.B.split('/')[0];
        const countM = +item.Y;
        const countP = +item.AA;
        
        if (countM > 0) {
          const key = month + 'M';
          if (mapB.has(key)) {
            const old = mapB.get(key);
            if (old) {
              old.trainCount += 1;
              old.trainHours += countM * +item.AG;
              old.trainPersonCount += countM;
            }
          } else {
            mapB.set(key, {
              type: 'M',
              station: '管理和业务技术',
              month,
              trainCount: 1,
              trainHours: countM * +item.AG,
              trainPersonCount: countM,
              unitName: item.F,
            });
          }
        }

        if (countP > 0) {
          const key = month + 'P';
          if (mapB.has(key)) {
            const old = mapB.get(key);
            if (old) {
              old.trainCount += 1;
              old.trainHours += countP * +item.AG;
              old.trainPersonCount += countP;
            }
          } else {
            mapB.set(key, {
              type: 'P',
              station: '生产人员',
              month,
              trainCount: 1,
              trainHours: countP * +item.AG,
              trainPersonCount: countP,
              unitName: item.F,
            });
          }
        }
      }
    });

    const dataB: TableDataRow[] = [];
    for (let [key, params] of mapB.entries()) {
      dataB.push({
        id: (idCount++).toString(),
        ...params,
      });
    }

    this.setState({ tableDataB: dataB });

  }

  render() {
    return (
      <div className="workbench-result">
        <div className="workbench-result-btns">
          <Button type="primary" size="small" onClick={() => this.handleCalc()}>生成</Button>
        </div>
        <Table
          columns={this.state.tableColumnsA}
          dataSource={this.state.tableDataA}
          size="small"
          bordered
          rowKey="id"
          pagination={false}
          sticky={true}
        ></Table>
        <Table
          columns={this.state.tableColumnsB}
          dataSource={this.state.tableDataB}
          size="small"
          bordered
          rowKey="id"
          pagination={false}
          sticky={true}
        ></Table>
      </div>
    );
  }
}

export default Result;