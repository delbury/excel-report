import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Layout, Upload, Button, Radio, Table, Tooltip, message } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { RadioChangeEvent } from 'antd/es/radio';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { actions } from '@/redux/actions/global';
import { StoreState } from '@/redux';
import XLSX, { WorkBook, WorkSheet } from 'xlsx';
import BScroll, { BScrollInstance } from 'better-scroll';
import TrainingAnalysis from './training-analysis/index';
import ResultCrossTable from './result-cross-table';
import { fetchTestFile } from '@/lib/util';
import {
  TableDataRow,
  TableData,
  TableColumn,
  TableColumns,
  TableColumnsMap,
} from './index-types';
import { TEST_FILE_URL } from '@/views/workbench/consts';
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table as DocTable, TableCell as DocTableCell, TableRow as DocTableRow,
  WidthType, VerticalAlign, AlignmentType,
} from "docx";
import { getColumnsB, getColumnsC, columnsA, columnsD } from './training-analysis/result-columns';
import { RefProps } from './result-cross-table/index-types';

enum AnalysisTypes { Train, Score }

interface IProps extends RouteComponentProps {
  loading: boolean;
  toggleLoading: (status?: boolean) => void;
}
interface IState {
  fileList: UploadFile[];
  sheetNames: string[];
  currentSheet: string;
  tableData: TableData;
  tableColumns: TableColumns;
  allTableData: TableData;
  currentAnalysisType: AnalysisTypes; // 当前分析处理的表格类型
}

const { Content } = Layout;
const EMPTY_COLUMNS_TITLE: string = '暂无，请导入文件';
class Workbench extends React.PureComponent<IProps, IState> {
  workbook: WorkBook | null = null;
  sheetsWrapper: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  sheetScroll: BScrollInstance | null = null;
  tableColumnsCaches: { [key: string]: TableColumns } = {}; // 表头列配置缓存
  tableDataCaches: { [key: string]: TableData } = {}; // 表格数据缓存
  // tableColumnsMapCaches: { [key: string]: TableColumnsMap } = {}; // 表头配置hash缓存
  refTrainingAnalysis = React.createRef<TrainingAnalysis>();
  refResultCrossTable = React.createRef<RefProps>();
  constructor(props: IProps) {
    super(props);
    this.state = {
      fileList: [],
      sheetNames: [],
      currentSheet: '',
      tableData: [],
      tableColumns: [{ title: EMPTY_COLUMNS_TITLE, titleName: EMPTY_COLUMNS_TITLE }],
      allTableData: [],
      currentAnalysisType: AnalysisTypes.Score,
    };
  }

  // 取消自动上传
  handleBeforeUpload = (file: RcFile, fileList: RcFile[]): boolean => {
    return false;
  }

  // 文件改变
  uploadOnChange = (info: UploadChangeParam) => {
    let fileList: UploadFile[] = info.fileList.slice(-1);
    this.setState({
      fileList,
    });

    if (fileList.length === 0) {
      this.clearFile();
    } else {
      this.loadFile(fileList[0].originFileObj);
    }
  }

  // 加载文件
  loadFile = (file: File | Blob | undefined | null, cb?: (wb?: WorkBook | null) => void) => {
    if (!file) return;

    this.clearFile();
    
    const fileReader: FileReader = new FileReader();

    // 开始加载
    fileReader.onloadstart = ev => {
      this.props.toggleLoading(true);
    };

    // 加载中
    fileReader.onloadend = ev => {
      this.props.toggleLoading(false);
    };

    // 加载完成
    fileReader.onload = ev => {
      this.workbook = XLSX.read(fileReader.result, {
        type: 'array',
        // cellDates: true
      });
      this.setState({
        sheetNames: [...this.workbook.SheetNames],
        currentSheet: this.workbook.SheetNames.length ? this.workbook.SheetNames[0] : '',
      });

      // @ts-ignore
      window.workbook = this.workbook;
    };
    
    fileReader.readAsArrayBuffer(file); // 读取文件
  }

  // 清除文件
  clearFile = () => {
    // 清除缓存
    this.tableColumnsCaches = {};
    this.tableDataCaches = {};
    // this.tableColumnsMapCaches = {};

    // 清除表
    this.setState({
      tableColumns: [{ title: EMPTY_COLUMNS_TITLE, titleName: EMPTY_COLUMNS_TITLE }],
      tableData: [],
      sheetNames: [],
      currentSheet: '',
      fileList: [],
    });
  }

  // 选择表改变
  handleSheetChange = (ev: RadioChangeEvent) => {
    this.setState({ currentSheet: ev.target.value });
    this.switchSheet(ev.target.value);
  }

  // 构造表数据
  createTableData(sheetName: string, sheet: WorkSheet, ref: string = sheet?.['!autofilter']?.ref ?? sheet?.['!ref'] ?? '') {
    if (sheetName in this.tableColumnsCaches) {
      return {
        header: this.tableColumnsCaches[sheetName],
        body: this.tableDataCaches[sheetName],
      };
    }
    if (!ref) return { header: [], body: [] };

    const range = XLSX.utils.decode_range(ref); // 当前 sheet 的数据范围

    // 去除有合并的单元格行
    const mergeRows: Set<number> = new Set();
    if (sheet['!merges']) {
      sheet['!merges'].forEach(rg => {
        for (let i = rg.s.r; i <= rg.e.r; i++) {
          mergeRows.add(i);
        }
      });
    }

    // 过滤存在合并的行
    const validRows: Set<number> = new Set();
    for (let i = range.s.r; i <= range.e.r; i++) {
      let breakFlag = true;
      for (let j = range.s.c; j <= range.e.c; j++) {
        if (sheet[XLSX.utils.encode_col(j) + (i + 1)]) {
          breakFlag = false;
          break;
        }
      }
      if(breakFlag) break;
        
      if (!mergeRows.has(i)) {
        validRows.add(i + 1);
      }
    }

    // 过滤空列，第一行的最长连续非空区域
    const firstRow: number = validRows.values().next().value;
    const validCols: Set<string> = new Set();
    for (let i = range.s.c; i <= range.e.c; i++) {
      const col: string = XLSX.utils.encode_col(i);
      if (sheet[col + firstRow]) {
        validCols.add(col);
      } else {
        break;
      }
    }

    // 构造表头、hash
    const header: TableColumns = [];
    // const headerMap: TableColumnsMap = new Map();
    for (let col of validCols.values()) {
      const key = col + firstRow;
      const title = sheet[key].w + `(${col})`;
      const length = title.length;
      const obj: TableColumn = {
        titleName: title,
        title,
        key: col,
        dataIndex: col,
        width: `calc(${(length >= 4 ? length : 4) + 'em'} + 17px)`,
        ellipsis: true,
      };
      header.push(obj);
      // headerMap.set(col, obj);
    }

    // 构造表数据
    const body: TableData = [];
    // 行
    const rows = validRows.values();
    rows.next(); // 去除表头
    for (let r of rows) {
      const rowData: TableDataRow = { id: r + '' };
      
      // 列
      for (let c of validCols.values()) {
        if (sheet[c + r]?.t === 'd') {
          rowData[c] = sheet[c + r].v.toLocaleDateString();
        } else {
          rowData[c] = sheet[c + r]?.w ?? '';
        }
      }

      body.push(rowData);
    }

    // 缓存
    this.tableColumnsCaches[sheetName] = header; // 缓存表头
    this.tableDataCaches[sheetName] = body; // 缓存数据
    // this.tableColumnsMapCaches[sheetName] = headerMap; // 缓存hash

    return {
      header,
      body,
      // headerMap,
    };
  }

  // 切换 sheet
  switchSheet(sheetName: string) {
    if (!this.workbook) return;

    const sheet = this.workbook.Sheets[sheetName];
    const ref: string = sheet?.['!autofilter']?.ref ?? sheet?.['!ref'] ?? '';

    // 空表
    if (!ref) {
      this.setState({
        tableColumns: [],
      });
      return;
    }

    // 已有缓存
    if (sheetName in this.tableColumnsCaches) {
      this.setState({
        tableColumns: this.tableColumnsCaches[sheetName],
        tableData: this.tableDataCaches[sheetName].slice(0, 20), // 取前 20 条
        allTableData: this.tableDataCaches[sheetName],
      });
      return;
    }

    const { header, body } = this.createTableData(sheetName, sheet, ref);
    
    this.setState({
      tableColumns: header,
      tableData: body.slice(0, 20), // 取前 20 条
      allTableData: body,
    });
  }

  // 生成 word
  handleCreateWord = () => {
    const titleSize: number = 32;
    const contentFont = { size: 24 };
    const doc = new Document();
    // 文本
    const pText = (text: string = '') => new TextRun({ text, ...contentFont });
    // 空行
    const pBlank = () => new Paragraph({ children: [pText()] });
    // 创建标题
    const pTitle = (text: string) => new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({ text, bold: true, color: '000000', font: '黑体', size: titleSize }),
      ],
    });
    // 创建表格
    const pTable = (
      headers: { title: string; width: number; key: string; }[],
      data: TableDataRow[]
    ) => {
      const table = new DocTable({
        width: {
          size: 5000,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new DocTableRow({
            tableHeader: true,
            children: headers.map(item => new DocTableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: item.title, ...contentFont })],
                alignment: AlignmentType.CENTER,
              })],
              width: {
                size: item.width,
                type: WidthType.PERCENTAGE,
              },
              verticalAlign: VerticalAlign.CENTER,
            })),
          }),
          ...data.map((item, index) => new DocTableRow({
            children: headers.map(it => new DocTableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: (item[it.key] ?? '').toString(), ...contentFont })],
                alignment: AlignmentType.CENTER,
              })],
              width: {
                size: item.width,
                type: WidthType.PERCENTAGE,
              },
              verticalAlign: VerticalAlign.CENTER,
            })),
          }))
        ]
      });

      return table;
    };

    // 获取表格数据
    if (!this.refTrainingAnalysis.current) throw new Error('refTrainingAnalysis is undefined');
    const datas = this.refTrainingAnalysis.current.getTableDatas();

    // 数据格式化
    const getTableHeader = (columns: TableColumns<any>, totalWidth: number) => columns.map(item => ({
      title: item.titleName,
      width: +((item.width as number ?? 0) / totalWidth * 100).toFixed(2),
      key: item.dataIndex as string,
    }));
    // 培训情况表格
    const columnsB = getColumnsB();
    const tempTotalMaxWidthB = columnsB.reduce((sum, b) => sum + (b.width as number ?? 0), 0);
    const tableHeaderB = getTableHeader(columnsB, tempTotalMaxWidthB);
    const tableDataB = datas.B.filter(item => !item.isCondition).sort((a, b) => {
      const res = a.month - b.month;
      if (res !== 0) {
        return res;
      } else {
        return a.type.charCodeAt(0) - b.type.charCodeAt(0);
      }
    });
    // 兼职培训师情况
    const columnsC = getColumnsC();
    const tempTotalMaxWidthC = columnsC.reduce((sum, b) => sum + (b.width as number ?? 0), 0);
    const tableHeaderC = getTableHeader(columnsC, tempTotalMaxWidthC);
    const tableDataC = datas.C.filter(item => !item.isCondition);
    // 必知必会培训
    const tempTotalMaxWidthA = columnsA.reduce((sum, b) => sum + (b.width as number ?? 0), 0);
    const tableHeaderA = getTableHeader(columnsA, tempTotalMaxWidthA);
    const tableDataA = datas.A.filter(item => !item.isCondition);
    // 必知必会评估
    const tempTotalMaxWidthD = columnsD.reduce((sum, b) => sum + (b.width as number ?? 0), 0);
    const tableHeaderD = getTableHeader(columnsD, tempTotalMaxWidthD);
    const tableDataD = datas.D.filter(item => !item.isCondition);


    // 月考成绩
    if (!this.refResultCrossTable.current) throw new Error('refResultCrossTable is undefined');
    const chartsData = this.refResultCrossTable.current.getData();
    let tableHeaderCharts: ReturnType<typeof getTableHeader> = [];
    let tableDataCharts: NonNullable<typeof chartsData>['data'] = [];

    if (chartsData) {
      tableDataCharts = chartsData.data;
      const tempTotalMaxWidthCharts = chartsData.columns.reduce((sum, b) => sum + (b.width as number ?? 0), 0);
      tableHeaderCharts = getTableHeader(chartsData.columns, tempTotalMaxWidthCharts);
    }

    const infos = this.refResultCrossTable.current.getInfos() ?? [];
    
    doc.addSection({
      children: [
        pTitle('培训情况'),
        pTable(tableHeaderB, tableDataB),
        ...tableDataB.map(data => new Paragraph({
          children: [
            pText(data.monthName),
            pText(data.type === 'M' ? '管理和业务技术' : '生产人员'),
            pText(`参训课时${data.trainHours}小时，`),
            pText(`参训培训${data.trainCount}次，`),
            pText(`参训培训${data.trainPersonCount}人次，`),
            pText(`人均参训课时${data.averTrainHours}小时，`),
            pText(`年度累计人均课时${data.yearAverHours}小时。`),
          ]
        })),
        pBlank(),
        pTitle('兼职培训师情况'),
        pTable(tableHeaderC, tableDataC),
        ...tableDataC.map(data => new Paragraph({
          children: [
            pText(data.monthName),
            pText(`${data.unitName}内部培训师共${data.personCount}人，`),
            pText(`培训师授课人数为${data.personCourseCount}人，`),
            pText(`培训师利用率为${+((data.rate ?? 0) * 100).toFixed(2)}%，`),
            pText(`总授课学时为${data.totalHours}小时，`),
            pText(`人均授课学时为${data.averHours}小时。`),
          ]
        })),
        pBlank(),
        pTitle('必知必会培训'),
        pTable(tableHeaderA, tableDataA),
        ...tableDataA.map(data => new Paragraph({
          children: [
            pText(data.monthName),
            pText(`设备维保必知必会培训计划完成${data.trainPersonCount}人次，`),
            pText(`实际完成${data.trainPersonCount}人次，`),
            pText(`主要完成${data.remarksText}等${data.remarks?.size ?? 0}个技能项点的培训。`),
          ]
        })),
        pBlank(),
        pTitle('必知必会评估'),
        pTable(tableHeaderD, tableDataD),
        ...tableDataD.map(data => new Paragraph({
          children: [
            pText(`${data.monthName}${data.unitName}`),
            pText(`评估项目数${data.projectCount}个，`),
            pText(`评估人次${data.assessCount}人次，`),
            pText(`通过人次${data.passedCount}人次，`),
            pText(`未通过人次${data.failedCount}人次，`),
            pText(`合格率${+((data.passedRate ?? 0) * 100).toFixed(2)}%，`),
            pText(`理论验收人次${data.theoryCount}人次，`),
            pText(`实操验收人次${data.trainCount}人次。`),
          ]
        })),
        pBlank(),
        pTitle('每周一练'),
        pBlank(),
        pTitle('月考'),
        tableHeaderCharts.length ? pTable(tableHeaderCharts, tableDataCharts) : pBlank(),
        ...infos.map(info => new Paragraph({
          children: [pText(info)],
        })),
        pBlank(),
        pTitle('演练情况'),
        pBlank(),
        pTitle('比武情况'),

      ],
    });

    // 创建并下载
    Packer.toBuffer(doc).then(buffer => {
      const blob = new Blob([buffer]);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '培训月报.docx';
      link.style.display = 'none';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }


  componentDidMount() {
    // 初始化选择表区域滚动功能
    if (this.sheetsWrapper.current) {
      this.sheetScroll = new BScroll(this.sheetsWrapper.current, {
        scrollX: true,
        scrollY: true,
        click: true,
        bounce: false,
      });
    }

    // this.test(TEST_FILE_URL);
    // this.test('/test/test-file2.xlsx');
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    // 刷新选择表区域的滚动布局
    if (this.state.sheetNames !== prevState.sheetNames && this.sheetScroll) {
      this.sheetScroll.refresh();
      this.switchSheet(this.state.currentSheet);
    }
  }

  // 测试
  test(url: string) {
    fetchTestFile(url).then(blob => {
      this.loadFile(blob);
    }).catch(err => console.log(err)); // 获取测试文件
  }

  render() {
    // const headerMap = this.tableColumnsMapCaches[this.state.currentSheet];

    const hideTop = this.state.currentAnalysisType === AnalysisTypes.Score;

    return (
      <Layout className="workbench">
        <Content className="workbench-content">
          <div className="workbench-operation" style={{ height: hideTop ? '0' : '', marginBottom: hideTop ? '-10px' : '' }}>
            <div className="workbench-operation-left">
              <Upload
                accept=".xlsx, .xls"
                fileList={this.state.fileList}
                beforeUpload={this.handleBeforeUpload}
                onChange={this.uploadOnChange}
              >
                <Button
                  size="small"
                  icon={<UploadOutlined />}
                >导入本地文件</Button>

                <Tooltip
                  title="预览只展示前20行数据"
                  placement="right"
                  className="mg-l-10"
                >
                  <InfoCircleOutlined />
                </Tooltip>
              </Upload>
              
              {/* <Button size="small" onClick={() => this.test('/test/test-file2.xlsx')}>加载必知必会表</Button> */}
            </div>
            <div className="workbench-operation-right">
              <div className="sheets" ref={this.sheetsWrapper}>
                <Radio.Group size="small" value={this.state.currentSheet} onChange={this.handleSheetChange}>
                  {
                    this.state.sheetNames.map((name, index) => <Radio.Button value={name} key={name.toString() + index}>{ name }</Radio.Button>)
                  }
                </Radio.Group>
              </div>
            </div>
          </div>
          <div className="workbench-preview">
            <div className="workbench-preview-main-table-container">
              <div style={{ height: hideTop ? '0' : '' }}>
                <Table
                  columns={this.state.tableColumns}
                  dataSource={this.state.tableData}
                  size="small"
                  bordered
                  scroll={{ x: 'max-content', y: 150 }}
                  rowKey="id"
                  pagination={false}
                  sticky={true}
                />
              </div>

              <div className="additional-toolbar">
                <Button className="mg-r-10" type="primary" size="small" onClick={() => this.handleCreateWord()}>生成 Word</Button>
                <Radio.Group
                  options={[
                    { label: '培训分析处理', value: AnalysisTypes.Train },
                    { label: '考评成绩处理', value: AnalysisTypes.Score },
                  ]}
                  value={this.state.currentAnalysisType}
                  optionType="button"
                  size="small"
                  onChange={(ev) => {
                    this.props.toggleLoading(true);
                    setTimeout(() => {
                      this.setState(
                        { currentAnalysisType: ev.target.value },
                        () => setTimeout(() => this.props.toggleLoading(false), 0)
                      );
                    });
                  }}
                ></Radio.Group>
              </div>
            </div>
        
            <div className="workbench-preview-tabs">
              <TrainingAnalysis
                ref={this.refTrainingAnalysis}
                className={'page ' + (this.state.currentAnalysisType === AnalysisTypes.Train ? '' : 'none')}
                outerColumns={this.state.tableColumns}
                outerData={this.state.allTableData}
              ></TrainingAnalysis>
              <ResultCrossTable
                ref={this.refResultCrossTable}
                className={'page ' + (this.state.currentAnalysisType === AnalysisTypes.Score ? '' : 'none')}
                outerColumns={this.state.tableColumns}
                outerData={this.state.allTableData}
                currentSheetName={this.state.currentSheet}
              ></ResultCrossTable>
            </div>
          </div>
          
        </Content>
      </Layout>
    );
  }
}

const stateToProps = (state: StoreState) => ({
  loading: state.global.loading,
});
const dispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleLoading: (status?: boolean) => dispatch(actions.toggleGlobalLoading(status)),
  };
};
export default connect(stateToProps, dispatchToProps)(Workbench);