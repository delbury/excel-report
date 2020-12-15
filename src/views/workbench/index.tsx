import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Layout, Upload, Button, Radio } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { UploadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { actions } from '@/redux/actions/global';
import { StoreState } from '@/redux';
import XLSX, { WorkBook } from 'xlsx';
import BScroll, { BScrollInstance } from 'better-scroll';

const { Content } = Layout;

interface IProps extends RouteComponentProps {
  loading: boolean;
  toggleLoading: (status?: boolean) => void;
}
interface IState {
  fileList: any[];
  sheetNames: string[];
  currentSheet: string;
}

const uploadConfig: UploadProps = {
  accept: '.xlsx, .xls',
};

class Workbench extends React.Component<IProps, IState> {
  workbook: WorkBook | null = null;
  sheetsWrapper: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
  sheetScroll: BScrollInstance | null = null;
  constructor(props: IProps) {
    super(props);
    this.state = {
      fileList: [],
      sheetNames: [],
      currentSheet: '',
    };
  }

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
  loadFile = (file: File | Blob | undefined) => {
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
  clearFile = () => { }

  // 选择表改变
  handleSheetChange = (ev: RadioChangeEvent) => {
    this.setState({ currentSheet: ev.target.value });
  } 

  componentDidMount() {
    if (this.sheetsWrapper.current) {
      console.log(this.sheetsWrapper.current);
      this.sheetScroll = new BScroll(this.sheetsWrapper.current, {
        scrollX: true,
        scrollY: true,
        click: true,
        bounce: false,
      });
    }
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    if (this.state.sheetNames !== prevState.sheetNames && this.sheetScroll) {
      this.sheetScroll.refresh();
    }
  }

  render() {
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
          <div className="workbench-preview"></div>
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