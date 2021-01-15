import React from 'react';
import { TableColumns, TableDataRow } from './index';
import { Table, Button, Select, Tabs, List } from 'antd';
import { columnsA, getColumnsB, getColumnsC, columnsD } from './result-columns';
import XLSX, { Sheet, ColInfo, WorkBook } from 'xlsx';
import {
  TableDataRowA,
  TableDataRowB,
  TableDataRowC,
  TableDataRowD,
  TableDataRowBasisA,
  TableDataRowBasisB,
  TableDataRowBasisC,
  TableDataRowBasisD,
  TableDataRowKinds,
} from './result-table-types';
import ResultCharts from './chart';


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
  tableColumnsA: TableColumns<TableDataRowA>;
  tableDataB: TableDataRowB[];
  tableColumnsB: TableColumns<TableDataRowB>;
  tableDataC: TableDataRowC[];
  tableColumnsC: TableColumns<TableDataRowC>;
  tableDataD: TableDataRowD[];
  tableColumnsD: TableColumns<TableDataRowD>;
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
  filters: {
    table1: string;
    table2: string;
  };
  currentFilterKeyword: string;
  filtersOptions: {
    label: string;
    value: string;
  }[];
}

class Result extends React.Component<IProps, IState> {
  idCount: number = Date.now();
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
      filters: {
        table1: 'G',
        table2: 'H',
      },
      currentFilterKeyword: '',
      filtersOptions: [],
    };
  }

  // componentDidUpdate(prevProps: IProps, prevState: IState) {
  //   if (this.props.outerData !== prevProps.outerData) {
  //     const set: Set<string> = new Set();
  //     this.props.outerData.forEach(item => set.add(item[this.state.filters.table1]));
  //     const options = [];
  //     for (let val of set.values()) {
  //       options.push({
  //         label: val,
  //         value: val,
  //       });
  //     }
  //     this.setState({ filtersOptions: options });
  //   }
  // }

  // 生成表格 A
  calcDataA(condition?: string) {
    const scmap = this.state.selectedColumnsMap;

    const mapA: Map<number, TableDataRowBasisA> = new Map();
    this.props.outerData.forEach(item => {
      if (item[scmap.role] === '培训师' && item[scmap.project] === '必知必会培训' && (!condition || item.G === condition)) {
        const month = new Date(item[scmap.month]).getMonth() + 1;

        if (mapA.has(month)) {
          const old = mapA.get(month);
          if (old) {
            old.trainProjectCount += 1;
            old.trainPersonCount += +item[scmap.totalPersonCount];
            old.theoryHours += +item[scmap.theoryHours];
            old.practiceHours += +item[scmap.practiceHours];
            old.remarks?.add(item.J);
          }

        } else {
          mapA.set(month, {
            trainProjectCount: 1,
            trainPersonCount: +item[scmap.totalPersonCount],
            theoryHours: +item[scmap.theoryHours],
            practiceHours: +item[scmap.practiceHours],
            unitName: condition ? condition : item[scmap.unitName],
            remarks: new Set([item.J]),
            isCondition: !!condition,
          });
        }
      }
    });

    const dataA: TableDataRowA[] = [];
    for (let [key, params] of mapA.entries()) {
      dataA.push({
        id: (this.idCount++).toString(),
        ...params,
        month: key,
        monthName: key + '月',
        remarksText: Array.from(params.remarks ?? []).join('、')
      });
    }
    dataA.sort((a, b) => a.month - b.month);

    !condition && this.setState({ tableDataA: dataA });
    return dataA;
  }

  // 生成表格 B
  calcDataB(condition?: string) {
    const scmap = this.state.selectedColumnsMap;

    const mapB: Map<string, TableDataRowBasisB> = new Map();
    this.props.outerData.forEach(item => {
      if (item[scmap.role] === '培训师' && (!condition || item.G === condition)) {
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
              unitName: condition ? condition : item[scmap.unitName],
              isCondition: !!condition,
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
              unitName: condition ? condition : item[scmap.unitName],
              isCondition: !!condition,
            });
          }
        }
      }
    });

    const dataB: TableDataRowB[] = [];
    for (let [key, params] of mapB.entries()) {
      dataB.push({
        id: (this.idCount++).toString(),
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

    !condition && this.setState({ tableDataB: dataB });
    return dataB;
  }

  // 生成表格 C
  calcDataC(condition?: string) {
    const scmap = this.state.selectedColumnsMap;

    const mapC: Map<number, TableDataRowBasisC> = new Map();
    const filterSet: Set<string> = new Set(['见习', '一星', '二星', '三星', '四星', '五星']);
    const isExisted: Set<string> = new Set();
    this.props.outerData.forEach(item => {
      if (filterSet.has(item.W) && (!condition || item.G === condition)) {
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
              unitName: condition ? condition : item[scmap.unitName],
              personCourseCount: 1,
              totalHours: +item[scmap.hours],
              isCondition: !!condition,
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
        id: (this.idCount++).toString(),
        ...params,
        month: +key,
        averHours: params.totalHours / params.personCourseCount,
        monthName: key + '月',
        personCount: 7,
        rate: params.personCourseCount / 7,
      });
    }

    dataC.sort((a, b) => a.month - b.month);
    !condition && this.setState({ tableDataC: dataC });
    return dataC;
  }

  // 计算表格 D
  calcDataD(condition?: string) {
    const scmap = this.state.selectedColumnsMap;

    const mapD: Map<number, TableDataRowBasisD> = new Map();
    const filterSet: Set<string> = new Set([
      '【所有专业】设备维保必知必会安全红线',
      '【所有专业】设备维保必知必会应急处置类通用知识',
      '【站台门】基础知识',
      '【站台门】安全回路异常中断',
      '【站台门】信号系统无法控制屏蔽门联动开关',
      '【站台门】整侧滑动门多级无法开关',
      '【综合监控】基础知识',
      '【综合监控】网络中断',
      '【消防】FAS主机及工作站',
      '【消防】气灭',
      '【消防】水消防',
      '【消防】起火冒烟、FAS联动故障',
      '【消防】区间、车站消防爆管',
      '【消防】气灭误喷',
      '【电梯】基础知识',
      '【电梯】乘客电梯困人',
      '【给排水】控制柜',
      '【给排水】水泵',
      '【给排水】防汛应急设备',
      '【给排水】区间积水',
      '【通风】通风基础知识',
      '【通风】区间冷媒水管爆管',
      '【通风】消防系统联动中环控模式无法自动执行',
      '【低压】400V低压开关柜',
      '【低压】智能照明模块',
      '【低压】400V单段失电母联未备自投',
      '【低压】照明大面积失电',
      '【AFC】基本知识',
      '【AFC】全站闸机紧急释放'
    ]);
    const isExisted: Set<string> = new Set();
    this.props.outerData.forEach(item => {
      if (filterSet.has(item.K) && !!item.J && (!condition || item.H === condition)) {
        const month = new Date(item.J).getMonth() + 1;
        const hash: string = (item.K + month).toString();
        
        if (!isExisted.has(hash)) {
          isExisted.add(hash);

          if (mapD.has(month)) {
            const old = mapD.get(month);
            if (old) {
              old.projectCount += 1;
              old.assessCount += !!item.O ? 1 : 0;
              old.passedCount += item.O === '通过' ? 1 : 0;
              old.failedCount += item.O === '不通过' ? 1 : 0;
              old.theoryCount += (item.M === '理论' && !!item.O) ? 1 : 0;
              old.trainCount += (item.M === '实操' && !!item.O) ? 1 : 0;
              old.remarks?.add(item.K);
            }
          } else {
            mapD.set(month, {
              unitName: condition ? condition : item.G,
              projectCount: 1,
              assessCount: !!item.O ? 1 : 0,
              passedCount: item.O === '通过' ? 1 : 0,
              failedCount: item.O === '不通过' ? 1 : 0,
              theoryCount: (item.M === '理论' && !!item.O) ? 1 : 0,
              trainCount: (item.M === '实操' && !!item.O) ? 1 : 0,
              remarks: new Set([item.K]),
              isCondition: !!condition,
            });
          }
        } else {
          if (mapD.has(month)) {
            const old = mapD.get(month);
            if (old) {
              old.assessCount += !!item.O ? 1 : 0;
              old.passedCount += item.O === '通过' ? 1 : 0;
              old.failedCount += item.O === '不通过' ? 1 : 0;
              old.theoryCount += (item.M === '理论' && !!item.O) ? 1 : 0;
              old.trainCount += (item.M === '实操' && !!item.O) ? 1 : 0;
              old.remarks?.add(item.K);
            }
          }
        }
      }
    });

    const dataD: TableDataRowD[] = [];
    for (let [key, params] of mapD.entries()) {
      const remarksTextArr: string[] = [];
      if (params.remarks) {
        for (let val of params.remarks.values()) {
          remarksTextArr.push(val.replace(/【.*】/, ''));
        }
      }
      dataD.push({
        id: (this.idCount++).toString(),
        ...params,
        month: +key,
        monthName: key + '月',
        passedRate: params.assessCount ? params.passedCount / params.assessCount : undefined,
        remarksText: remarksTextArr.join('、'),
      });
    }

    dataD.sort((a, b) => a.month - b.month);
    !condition && this.setState({ tableDataD: dataD });
    return dataD;
  }

  // 计算表格，培训表
  handleCalcPatr1 = () => {
    // this.calcDataA();
    // this.calcDataB();
    // this.calcDataC();

    const set: Set<string> = new Set();
    this.props.outerData.forEach(item => set.add(item[this.state.filters.table1]));
    const options = [];
    for (let val of set.values()) {
      options.push({
        label: val,
        value: val,
      });
    }


    const tableDataA: TableDataRowA[] = [];
    const tableDataB: TableDataRowB[] = [];
    const tableDataC: TableDataRowC[] = [];
    [{ value: undefined }, ...options].forEach(({ value }) => {
      const dataA = this.calcDataA(value);
      const dataB = this.calcDataB(value);
      const dataC = this.calcDataC(value);

      tableDataA.push(...dataA);
      tableDataB.push(...dataB);
      tableDataC.push(...dataC);

    });
    this.setState({
      tableDataA: [...tableDataA],
      tableDataB: [...tableDataB],
      tableDataC: [...tableDataC],
    });
  }

  // 必知必会表
  handleCalcPatr2 = () => {
    // this.calcDataD();

    const set: Set<string> = new Set();
    this.props.outerData.forEach(item => set.add(item[this.state.filters.table2]));
    const options = [];
    for (let val of set.values()) {
      options.push({
        label: val,
        value: val,
      });
    }

    const tableDataD: TableDataRowD[] = [];
    [{ value: undefined }, ...options].forEach(({ value }) => {
      const dataD = this.calcDataD(value);

      tableDataD.push(...dataD);

    });
    this.setState({
      tableDataD: [...tableDataD],
    });
  }

  // 导出
  handleExportPart1 = (workbook?: WorkBook) => {
    const wb = workbook ?? XLSX.utils.book_new();
    const sheetA = this.getExportSheet(this.state.tableColumnsA, this.state.tableDataA);
    XLSX.utils.book_append_sheet(wb, sheetA, '核心技能情况表');

    const sheetB = this.getExportSheet(this.state.tableColumnsB, this.state.tableDataB);
    XLSX.utils.book_append_sheet(wb, sheetB, '培训基本情况表');

    const sheetC = this.getExportSheet(this.state.tableColumnsC, this.state.tableDataC);
    XLSX.utils.book_append_sheet(wb, sheetC, '培训师情况表');

    !workbook && XLSX.writeFile(wb, '培训情况分析结果.xlsx');
  }

  // 导出
  handleExportPart2(workbook?: WorkBook) {
    const wb = workbook ?? XLSX.utils.book_new();
    const sheetD = this.getExportSheet(this.state.tableColumnsD, this.state.tableDataD);
    XLSX.utils.book_append_sheet(wb, sheetD, '必知必会评估表');

    !workbook && XLSX.writeFile(wb, '必知必会分析结果.xlsx');
  }
  
  // 合并导出
  handleExportAll() {
    const wb = XLSX.utils.book_new();
    this.handleExportPart1(wb);
    this.handleExportPart2(wb);
    XLSX.writeFile(wb, '培训情况、必知必会分析结果.xlsx');
  }
  
  // 根据 columns 过滤生成导出的 excel 表格列
  getExportSheet(columns: TableColumns<any>, data: TableDataRow[]): Sheet {
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

          <div className="workbench-result-config">
            {
              // <Select
              //   className="workbench-result-config-item"
              //   size="small"
              //   placeholder="筛选条件"
              //   options={this.state.filtersOptions}
              //   value={this.state.currentFilterKeyword}
              //   onChange={(ev) => this.setState({ currentFilterKeyword: ev })}
              //   allowClear
              // >
              // </Select>
            }
            {
              // toolbarConfigItems.map((item) => (
              //   <Select
              //     className="workbench-result-config-item"
              //     key={item.key}
              //     data-label={item.key}
              //     size="small"
              //     placeholder={`选择${item.label}`}
              //     options={selectOptions}
              //     value={this.state.selectedColumnsMap[item.key]}
              //   >
              //   </Select>
              // ))
            }
          </div>
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
              <ResultCharts columns={ this.state.tableColumnsA } data={ this.state.tableDataA }></ResultCharts>
              <List size="small">
                {
                  this.state.tableDataA.filter(item => !item.isCondition).map(item => (
                    <List.Item
                      key={item.id}
                      style={{ padding: '5px 10px' }}
                    >{`${item.monthName}设备维保必知必会培训计划完成${item.trainPersonCount}人次，实际完成${item.trainPersonCount}人次，主要完成${item.remarksText}等${item.trainProjectCount}个技能项点的培训。`}</List.Item>
                  ))
                }
              </List>
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

              <List size="small">
                {
                  this.state.tableDataD.filter(item => !item.isCondition).map(item => (
                    <List.Item
                      key={item.id}
                      style={{ padding: '5px 10px' }}
                    >{`${item.monthName}完成设备维保必知必会验收评定${item.assessCount}人，实际通过${item.passedCount}人，通过率为${((item.passedRate ?? 0) * 100).toFixed(2)}%，其中理论验收${item.theoryCount}人，实操验收${item.trainCount}人，验收主要技能项点为：${item.remarksText}。`}</List.Item>
                  ))
                }
              </List>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

export default Result;