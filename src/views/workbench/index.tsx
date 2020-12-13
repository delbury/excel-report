import React from 'react';
import { Layout, Upload, Button } from 'antd';
import { RcFile, UploadProps, UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import XLSX from 'xlsx';

const { Content } = Layout;

interface Props {}
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
      console.log(ev);
    };
    fileReader.onload = ev => {
      console.log('end');
    };
    fileReader.readAsArrayBuffer(file);
  }

  // 清除文件
  clearFile = () => {}

  render() {
    return (
      <Layout className="workbench">
        <Content className="workbench-content">
          <div className="workbench-operation">
            <div className="row">
              <Upload
                { ...uploadConfig }
                fileList={this.state.fileList}
                beforeUpload={this.handleBeforeUpload}
                onChange={this.uploadOnChange}
              >
                <Button icon={<UploadOutlined />}>选择本地文件</Button>
              </Upload>
            </div>
          </div>
          <div className="workbench-preview"></div>
        </Content>
      </Layout>
    );
  }
}

export default Workbench;