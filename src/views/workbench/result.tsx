import React from 'react';
import { TableColumnsMap, TableColumns, TableDataRow } from './index';
import { Table, Button, Select } from 'antd';
import { columnsA, getColumnsB, getColumnsC } from './result-columns';
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

interface TableDataRowBasisC {
  unitName: string;
  personCount?: number;
  personCourseCount: number;
  rate?: number;
  totalHours: number;
  averHours?: number;
}
interface TableDataRowC extends TableDataRowBasisC, TableDataRow { }


type ToolbarConfigItemKeyType = 'month' | 'project' | 'role' |
  'manage' | 'product' | 'hours' | 'totalPersonCount' |
  'theoryHours' | 'practiceHours' | 'unitName'
interface ToolbarConfigItem {
  label: string;
  key: ToolbarConfigItemKeyType;
}
const toolbarConfigItems: ToolbarConfigItem[] = [
  { label: '月份', key: 'month' },
  { label: '培训项目名称', key: 'project' },
  { label: '角色', key: 'role' },
  { label: '管理和业务技术', key: 'manage' },
  { label: '生产人员', key: 'product' },
  { label: '总课时', key: 'hours' },
  { label: '总人数', key: 'totalPersonCount' },
  { label: '理论课时', key: 'theoryHours' },
  { label: '实操课时', key: 'practiceHours' },
  { label: '单位', key: 'unitName' },
];

interface IProps {
  outerData: TableDataRow[];
  outerColumns: TableColumns;
}
interface IState {
  tableDataA: TableDataRowA[];
  tableColumnsA: TableColumns;
  tableDataB: TableDataRowB[];
  tableColumnsB: TableColumns;
  tableDataC: TableDataRowC[];
  tableColumnsC: TableColumns;
  selectedColumnsMap: {
    month: string;
    project: string;
    role: string;
    manage: string;
    product: string;
    hours: string;
    totalPersonCount: string;
    theoryHours: string;
    practiceHours: string;
    unitName: string;
  };
}

class Result extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      tableDataA: [],
      tableColumnsA: columnsA,
      tableDataB: [],
      tableColumnsB: getColumnsB(this),
      tableDataC: [],
      tableColumnsC: getColumnsC(this),
      selectedColumnsMap: {
        month: 'B',
        project: 'H',
        role: 'V',
        manage: 'Y',
        product: 'AA',
        hours: 'AG',
        totalPersonCount: 'AD',
        theoryHours: 'AE',
        practiceHours: 'AF',
        unitName: 'F',
      },
    };
  }

  // componentDidUpdate(prevProps: IProps, prevState: IState) {
  //   if (prevProps.outerColumns !== this.props.outerColumns) {
  //     console.log(this.props.outerColumns);
  //   }
  // }

  // 生成表格 A
  calcDataA() {
    let idCount: number = Date.now();
    const scmap = this.state.selectedColumnsMap;

    const mapA: Map<number, TableDataRowBasisA> = new Map();
    this.props.outerData.forEach(item => {
      if (item[scmap.role] === '培训师' && item[scmap.project] === '必知必会培训') {
        const month = new Date(item[scmap.month]).getMonth() + 1;

        if (mapA.has(month)) {
          const old = mapA.get(month);
          if (old) {
            old.trainProjectCount += 1;
            old.trainPersonCount += +item[scmap.totalPersonCount];
            old.theoryHours += +item[scmap.theoryHours];
            old.practiceHours += +item[scmap.practiceHours];
          }

        } else {
          mapA.set(month, {
            trainProjectCount: 1,
            trainPersonCount: +item[scmap.totalPersonCount],
            theoryHours: +item[scmap.theoryHours],
            practiceHours: +item[scmap.practiceHours],
            unitName: item[scmap.unitName],
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
    const scmap = this.state.selectedColumnsMap;

    const mapB: Map<string, TableDataRowBasisB> = new Map();
    this.props.outerData.forEach(item => {
      if (item[scmap.role] === '培训师') {
        // M：管理，P：生产
        const month = new Date(item[scmap.month]).getMonth() + 1;
        const countM = +item[scmap.manage];
        const countP = +item[scmap.product];
        
        if (countM > 0) {
          const key = month + 'M';
          if (mapB.has(key)) {
            const old = mapB.get(key);
            if (old) {
              old.trainCount += 1;
              old.trainHours += countM * +item[scmap.hours];
              old.trainPersonCount += countM;
            }
          } else {
            mapB.set(key, {
              type: 'M',
              station: '管理和业务技术',
              month,
              trainCount: 1,
              trainHours: countM * +item[scmap.hours],
              trainPersonCount: countM,
              unitName: item[scmap.unitName],
            });
          }
        }

        if (countP > 0) {
          const key = month + 'P';
          if (mapB.has(key)) {
            const old = mapB.get(key);
            if (old) {
              old.trainCount += 1;
              old.trainHours += countP * +item[scmap.hours];
              old.trainPersonCount += countP;
            }
          } else {
            mapB.set(key, {
              type: 'P',
              station: '生产人员',
              month,
              trainCount: 1,
              trainHours: countP * +item[scmap.hours],
              trainPersonCount: countP,
              unitName: item[scmap.unitName],
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

  // 生成表格 C
  calcDataC() {
    let idCount: number = Date.now();
    const scmap = this.state.selectedColumnsMap;

    const mapC: Map<number, TableDataRowBasisC> = new Map();
    const filterSet: Set<string> = new Set(['见习', '一星', '二星', '三星', '四星', '五星']);
    const isExisted: Set<string> = new Set();
    this.props.outerData.forEach(item => {
      if (filterSet.has(item.W)) {
        const month = new Date(item[scmap.month]).getMonth() + 1;
        const hash: string = (item.T + month).toString();

        if (!isExisted.has(hash)) {
          isExisted.add(hash);

          if (mapC.has(month)) {
            const old = mapC.get(month);
            if (old) {
              old.personCourseCount += 1;
              old.totalHours += +item[scmap.hours];
            }
          } else {
            mapC.set(month, {
              unitName: item[scmap.unitName],
              personCourseCount: 1,
              totalHours: +item[scmap.hours],
            });
          }
        } else {
          if (mapC.has(month)) {
            const old = mapC.get(month);
            if (old) {
              old.totalHours += +item[scmap.hours];
            }
          }
        }
      }
    });

    const dataC: TableDataRowC[] = [];
    for (let [key, params] of mapC.entries()) {
      dataC.push({
        id: (idCount++).toString(),
        ...params,
        month: +key,
        averHours: params.totalHours / params.personCourseCount
      });
    }

    dataC.sort((a, b) => a.month - b.month);
    this.setState({ tableDataC: dataC });
  }

  // 计算表格
  handleCalc = () => {
    this.calcDataA();
    this.calcDataB();
    this.calcDataC();
  }

  // 导出
  handleExport = () => {
    const wb = XLSX.utils.book_new();
    const sheetA = this.getExportSheet(this.state.tableColumnsA, this.state.tableDataA);
    XLSX.utils.book_append_sheet(wb, sheetA, '核心技能情况表');

    const sheetB = this.getExportSheet(this.state.tableColumnsB, this.state.tableDataB);
    XLSX.utils.book_append_sheet(wb, sheetB, '培训基本情况表');

    const sheetC = this.getExportSheet(this.state.tableColumnsC, this.state.tableDataC);
    XLSX.utils.book_append_sheet(wb, sheetC, '培训师情况表');

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
    const selectOptions = this.props.outerColumns.map(item => ({
      label: (item.title ?? '').toString(),
      value: (item.key ?? '').toString(),
      key: (item.key ?? '').toString(),
    }));
    return (
      <div className="workbench-result">
        <div className="workbench-result-toolbar">
          <div className="workbench-result-btns mg-b-10">
            <Button type="primary" size="small" onClick={() => this.handleCalc()}>生成</Button>
            <Button size="small" onClick={ () => this.handleExport() }>导出</Button>
          </div>

          {
            /* <div className="workbench-result-config">
              {
                toolbarConfigItems.map((item) => (
                  <Select
                    className="workbench-result-config-item"
                    key={item.key}
                    data-label={item.key}
                    size="small"
                    placeholder={`选择${item.label}`}
                    options={selectOptions}
                    value={this.state.selectedColumnsMap[item.key]}
                  >
                  </Select>
                ))
              }
            </div> */
          }
        </div>
        <div className="workbench-result-tables">
          <Table
            columns={this.state.tableColumnsA}
            dataSource={this.state.tableDataA}
            size="small"
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          ></Table>
          <Table
            columns={this.state.tableColumnsB}
            dataSource={this.state.tableDataB}
            size="small"
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          ></Table>
          <Table
            columns={this.state.tableColumnsC}
            dataSource={this.state.tableDataC}
            size="small"
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 'max-content' }}
          ></Table>
        </div>
      </div>
    );
  }
}

export default Result;