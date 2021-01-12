import React from 'react';
import { TableColumnsMap, TableColumns, TableDataRow } from './index';
import { Table, Button } from 'antd';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { columnsA, getColumnsB } from './result-columns';
import XLSX, { Sheet, ColInfo } from 'xlsx';

interface TableDataRowBasisA {
  trainProjectCount: number;
  trainPersonCount: number;
  theoryHours: number;
  practiceHours: number;
  unitName: string;
};
interface TableDataRowA extends TableDataRowBasisA, TableDataRow { };
interface TableDataRowBasisB {
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
interface TableDataRowB extends TableDataRowBasisB, TableDataRow { }


interface IProps {
  outerData: TableDataRow[];
  outerColumns: TableColumns;
}
interface IState {
  tableDataA: TableDataRowA[];
  tableColumnsA: TableColumns;
  tableDataB: TableDataRowB[];
  tableColumnsB: TableColumns;
}

class Result extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      tableDataA: [],
      tableColumnsA: columnsA,
      tableDataB: [],
      tableColumnsB: getColumnsB(this),
    };
  }

  // 生成表格 A
  calcDataA() {
    let idCount: number = Date.now();

    const mapA: Map<number, TableDataRowBasisA> = new Map();
    this.props.outerData.forEach(item => {
      if (item.V === '培训师' && item.H === '必知必会培训') {
        const month = new Date(item.B).getMonth() + 1;

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

    const dataA: TableDataRowA[] = [];
    for (let [key, params] of mapA.entries()) {
      dataA.push({
        id: (idCount++).toString(),
        ...params,
        month: key,
      });
    }
    dataA.sort((a, b) => a.month - b.month);

    this.setState({ tableDataA: dataA });
  }

  // 生成表格 B
  calcDataB() {
    let idCount: number = Date.now();

    const mapB: Map<string, TableDataRowBasisB> = new Map();
    this.props.outerData.forEach(item => {
      if (item.V === '培训师') {
        // M：管理，P：生产
        const month = new Date(item.B).getMonth() + 1;
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

    const dataB: TableDataRowB[] = [];
    for (let [key, params] of mapB.entries()) {
      dataB.push({
        id: (idCount++).toString(),
        ...params,
      });
    }

    // 先岗位，后月份排序
    dataB.sort((a, b) => {
      const res = a.type.charCodeAt(0) - b.type.charCodeAt(0);
      if (res === 0) {
        return a.month - b.month;
      } else {
        return res;
      }
    });

    // 先月份，后岗位排序
    // dataB.sort((a, b) => {
    //   const res = a.month - b.month;
    //   if (res === 0) {
    //     return a.type.charCodeAt(0) - b.type.charCodeAt(0);
    //   } else {
    //     return res;
    //   }
    // });

    this.setState({ tableDataB: dataB });
  }

  // 计算表格
  handleCalc = () => {
    this.calcDataA();
    this.calcDataB();
  }

  // 导出
  handleExport = () => {
    const wb = XLSX.utils.book_new();
    const sheetA = this.getExportSheet(this.state.tableColumnsA, this.state.tableDataA);
    XLSX.utils.book_append_sheet(wb, sheetA, '表A');

    const sheetB = this.getExportSheet(this.state.tableColumnsB, this.state.tableDataB);
    XLSX.utils.book_append_sheet(wb, sheetB, '表B');

    XLSX.writeFile(wb, 'output.xlsx');
  }

  // 根据 columns 过滤生成导出的 excel 表格列
  getExportSheet(columns: TableColumns, data: TableDataRow[]): Sheet {
    const map: Map<string, string> = new Map();
    const res: any = [];
    const colInfos: ColInfo[] = [];
    columns.forEach((item, index) => {
      const title: string = (item.title ?? '').toString();
      map.set((item.key ?? '').toString(), title);
      colInfos.push({
        wpx: Number(item.width ?? 100),
      });
    });

    data.forEach(item => {
      const obj: any = {};
      for (let [key, val] of map.entries()) {
        obj[val] = item[key];
      }
      res.push(obj);
    });

    const sheet = XLSX.utils.json_to_sheet(res);
    sheet['!cols'] = colInfos;
    return sheet;
  }

  render() {
    return (
      <div className="workbench-result">
        <div className="workbench-result-btns">
          <Button type="primary" size="small" onClick={() => this.handleCalc()}>生成</Button>
          <Button size="small" onClick={ () => this.handleExport() }>导出</Button>
        </div>
        <Table
          columns={this.state.tableColumnsA}
          dataSource={this.state.tableDataA}
          size="small"
          bordered
          rowKey="id"
          pagination={false}
          sticky={true}
          scroll={{ x: 'max-content' }}
        ></Table>
        <Table
          columns={this.state.tableColumnsB}
          dataSource={this.state.tableDataB}
          size="small"
          bordered
          rowKey="id"
          pagination={false}
          sticky={true}
          scroll={{ x: 'max-content' }}
        ></Table>
      </div>
    );
  }
}

export default Result;