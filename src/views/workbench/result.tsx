import React from 'react';
import { TableColumns, TableDataRow } from './index';
import { Table, Button, Select, Tabs } from 'antd';
import { columnsA, getColumnsB, getColumnsC, columnsD } from './result-columns';
import XLSX, { Sheet, ColInfo } from 'xlsx';
import {
  TableDataRowA,
  TableDataRowB,
  TableDataRowC,
  TableDataRowD,
  TableDataRowBasisA,
  TableDataRowBasisB,
  TableDataRowBasisC,
  TableDataRowBasisD,
} from './result-table-types';


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
  tableDataD: TableDataRowD[];
  tableColumnsD: TableColumns;
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
      tableDataD: [],
      tableColumnsD: columnsD,
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
        monthName: key + '月',
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
        monthName: params.month + '月',
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
        averHours: params.totalHours / params.personCourseCount,
        monthName: key + '月',
      });
    }

    dataC.sort((a, b) => a.month - b.month);
    this.setState({ tableDataC: dataC });
  }

  // 计算表格 D
  calcDataD() {
    let idCount: number = Date.now();
    const scmap = this.state.selectedColumnsMap;

    const mapD: Map<number, TableDataRowBasisD> = new Map();
    this.props.outerData.forEach(item => {
      if (true /* item.XX */) {
        const month = new Date(item[scmap.month]).getMonth() + 1;
        
        if (mapD.has(month)) {
          const old = mapD.get(month);
          if (old) {
            //
          }
        } else {
          // mapD.set(month, {});
        }
      }
    });
  }

  // 计算表格，培训表
  handleCalcPatr1 = () => {
    this.calcDataA();
    this.calcDataB();
    this.calcDataC();
  }

  // 必知必会表
  handleCalcPatr2 = () => {
    this.calcDataD();
  }

  // 导出
  handleExportPart1 = () => {
    const wb = XLSX.utils.book_new();
    const sheetA = this.getExportSheet(this.state.tableColumnsA, this.state.tableDataA);
    XLSX.utils.book_append_sheet(wb, sheetA, '核心技能情况表');

    const sheetB = this.getExportSheet(this.state.tableColumnsB, this.state.tableDataB);
    XLSX.utils.book_append_sheet(wb, sheetB, '培训基本情况表');

    const sheetC = this.getExportSheet(this.state.tableColumnsC, this.state.tableDataC);
    XLSX.utils.book_append_sheet(wb, sheetC, '培训师情况表');

    XLSX.writeFile(wb, 'output.xlsx');
  }

  // 导出
  handleExportPart2() { }
  
  // 合并导出
  handleExportAll() {}
  
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
          <div className="workbench-result-btns">
            <Button.Group>
              <Button type="primary" size="small" onClick={() => this.handleCalcPatr1()}>分析月度培训明细表</Button>
              <Button size="small" onClick={ () => this.handleExportPart1() }>导出</Button>
            </Button.Group>

            <Button.Group>
              <Button type="primary" size="small" onClick={() => this.handleCalcPatr2()}>分析必知必会评估明细表</Button>
              <Button size="small" onClick={ () => this.handleExportPart2() }>导出</Button>
            </Button.Group>

            <Button size="small" onClick={ () => this.handleExportAll() }>整合导出</Button>
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
          <Tabs defaultActiveKey="1" tabBarStyle={{ padding: '0 10px' }} style={{ height: '100%' }}>
            {/* 培训表 */}
            <Tabs.TabPane key="1" tab="培训-技能表">
              <Table
                columns={this.state.tableColumnsA}
                dataSource={this.state.tableDataA}
                size="small"
                bordered
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              ></Table>
            </Tabs.TabPane>
            <Tabs.TabPane key="2" tab="培训-情况表">
              <Table
                columns={this.state.tableColumnsB}
                dataSource={this.state.tableDataB}
                size="small"
                bordered
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              ></Table>
            </Tabs.TabPane>
            <Tabs.TabPane key="3" tab="培训-讲师表">
              <Table
                columns={this.state.tableColumnsC}
                dataSource={this.state.tableDataC}
                size="small"
                bordered
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              ></Table>
            </Tabs.TabPane>

            {/* 必知必会表 */}
            <Tabs.TabPane key="4" tab="知会-评估表">
              <Table
                columns={this.state.tableColumnsD}
                dataSource={this.state.tableDataD}
                size="small"
                bordered
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              ></Table>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Result;