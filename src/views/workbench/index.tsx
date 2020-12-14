import React from 'react';
import { Layout, Upload, Button } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { actions } from '@/redux/actions/global';
import { StoreState } from '@/redux';
import XLSX, { WorkBook } from 'xlsx';

const { Content } = Layout;

interface Props {
  percent: number;
  loading: boolean;
  toggleProgress: (status?: boolean) => void;
  setPercent: (percent: number) => void;
}
interface State {
  fileList: any[]
}

const uploadConfig: UploadProps = {
  accept: '.xlsx, .xls',
};

class Workbench extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      fileList: [],
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
    
    if(fileList.length === 0) {
      this.clearFile();
    } else {
      this.loadFile(fileList[0].originFileObj);
    }
  }

  // 加载文件
  loadFile = (file: File | Blob | undefined) => {
    if(!file) return;

    const fileReader: FileReader = new FileReader();
    fileReader.onprogress = ev => {
      const percent: number = (ev.loaded / ev.total) * 100;
      this.props.setPercent(percent);
    };
    fileReader.onload = ev => {
      const workbook: WorkBook = XLSX.read(fileReader.result, { type: 'array' });

      console.log(workbook);
    };
    fileReader.readAsArrayBuffer(file);
    this.props.setPercent(0);
    this.props.toggleProgress(true);
  }

  // 清除文件
  clearFile = () => {}

  render() {
    return (
      <Layout className="workbench">
        <Content className="workbench-content">
          <div className="workbench-operation">
            <div className="col">
              <Upload
                { ...uploadConfig }
                fileList={this.state.fileList}
                beforeUpload={this.handleBeforeUpload}
                onChange={this.uploadOnChange}
              >
                <Button icon={<UploadOutlined />}>选择本地文件</Button>
              </Upload>
            </div>
            <div className="col">
            </div>
          </div>
          <div className="workbench-preview"></div>
        </Content>
      </Layout>
    );
  }
}

const stateToProps = (state: StoreState) => ({
  loading: state.global.showProgress,
  percent: state.global.percent,
});
const dispatchToProps = (dispatch: Dispatch) => {
  return {
    toggleProgress: (status?: boolean) => dispatch(actions.toggleGlobalProgress(status)),
    setPercent: (percent: number) => dispatch(actions.setGlobalProgressPercent(percent)),
  };
};
export default connect(stateToProps, dispatchToProps)(Workbench);