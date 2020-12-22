import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Layout, Upload, Button, Radio, Table } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { RadioChangeEvent } from 'antd/es/radio';
import { ColumnsType, ColumnType } from 'antd/es/table';
import { UploadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { actions } from '@/redux/actions/global';
import { StoreState } from '@/redux';
import XLSX, { WorkBook } from 'xlsx';
import BScroll, { BScrollInstance } from 'better-scroll';
import Analysis from './analysis';
import { fetchTestFile } from '@/lib/util';

const { Content } = Layout;

interface TableDataRow {
  id: string;
  [key: string]: any;
}
type TableData = TableDataRow[];
export type TableColumn = ColumnType<object>;
export type TableColumns = ColumnsType<object>;
export type TableColumnsMap = Map<string, TableColumn>;

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
}

const uploadConfig: UploadProps = {
  accept: '.xlsx, .xls',
};


class Workbench extends React.Component<IProps, IState> {
  workbook: WorkBook | null = null;
  sheetsWrapper: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  sheetScroll: BScrollInstance | null = null;
  tableColumnsCaches: { [key: string]: TableColumns } = {}; // 表头列配置缓存
  tableDataCaches: { [key: string]: TableData } = {}; // 表格数据缓存
  tableColumnsMapCaches: { [key: string]: TableColumnsMap } = {}; // 表头配置hash缓存
  constructor(props: IProps) {
    super(props);
    this.state = {
      fileList: [],
      sheetNames: [],
      currentSheet: '',
      tableData: [],
      tableColumns: [],
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
  loadFile = (file: File | Blob | undefined | null) => {
    if (!file) return;

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
      this.workbook = XLSX.read(fileReader.result, { type: 'array' });
      this.setState({
        sheetNames: [...this.workbook.SheetNames],
        currentSheet: this.workbook.SheetNames.length ? this.workbook.SheetNames[0] : '',
      });
      console.log(this.workbook);
    };
    
    fileReader.readAsArrayBuffer(file); // 读取文件
  }

  // 清除文件
  clearFile = () => {
    // 清除缓存
    this.tableColumnsCaches = {};
    this.tableDataCaches = {};
    this.tableColumnsMapCaches = {};

    // 清除表
    this.setState({
      tableColumns: [],
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
        tableData: this.tableDataCaches[sheetName],
      });
      return;
    }

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
      if (!sheet['A' + (i + 1)]) break;
        
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
    const headerMap: TableColumnsMap = new Map();
    for (let col of validCols.values()) {
      const key = col + firstRow;
      const title = sheet[key].w + `(${col})`;
      const length = title.length;
      const obj: TableColumn = {
        title,
        key: col,
        dataIndex: col,
        width: `calc(${(length >= 4 ? length : 4) + 'em'} + 17px)`,
        ellipsis: true,
      };
      header.push(obj);
      headerMap.set(col, obj);
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
        rowData[c] = sheet[c + r]?.w ?? '';
      }

      body.push(rowData);
    }

    this.tableColumnsCaches[sheetName] = header; // 缓存表头
    this.tableDataCaches[sheetName] = body; // 缓存数据
    this.tableColumnsMapCaches[sheetName] = headerMap; // 缓存hash
    this.setState({
      tableColumns: header,
      tableData: body,
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

    this.test();
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    // 刷新选择表区域的滚动布局
    if (this.state.sheetNames !== prevState.sheetNames && this.sheetScroll) {
      this.sheetScroll.refresh();
      this.switchSheet(this.state.currentSheet);
    }
  }

  // 测试
  async test() {
    const blob = await fetchTestFile(); // 获取测试文件
    this.loadFile(blob);
  }

  render() {
    const headerMap = this.tableColumnsMapCaches[this.state.currentSheet];

    return (
      <Layout className="workbench">
        <Content className="workbench-content">
          <div className="workbench-operation">
            <div className="workbench-operation-left">
              <Upload
                {...uploadConfig}
                fileList={this.state.fileList}
                beforeUpload={this.handleBeforeUpload}
                onChange={this.uploadOnChange}
              >
                <Button icon={<UploadOutlined />}>选择本地文件</Button>
              </Upload>
            </div>
            <div className="workbench-operation-right">
              <div className="sheets" ref={this.sheetsWrapper}>
                <Radio.Group value={this.state.currentSheet} onChange={this.handleSheetChange}>
                  {
                    this.state.sheetNames.map((name, index) => <Radio.Button value={name} key={name.toString() + index}>{ name }</Radio.Button>)
                  }
                </Radio.Group>
              </div>
            </div>
          </div>
          <div className="workbench-preview">
            <Table
              columns={this.state.tableColumns}
              dataSource={this.state.tableData}
              size="small"
              bordered
              scroll={{ x: 'max-content', y: 300 }}
              rowKey="id"
              pagination={false}
              sticky={true}
            />
        
            <Analysis columnsMap={headerMap} />
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