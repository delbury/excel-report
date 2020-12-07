import React from 'react';
import { Layout, Upload, Button } from 'antd';
import { RcFile, UploadProps, UploadChangeParam } from 'antd/lib/upload';
import { UploadOutlined } from '@ant-design/icons';

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

  uploadOnChange = (info: UploadChangeParam) => {
    let fileList = info.fileList.slice(-1);
    console.log(info)
    this.setState({
      fileList,
    });
  }

  render() {
    return (
      <Layout className="workbench">
        <Content className="workbench-content">
          <div className="workbench-operation">
            <Upload
              { ...uploadConfig }
              fileList={this.state.fileList}
              beforeUpload={this.handleBeforeUpload}
              onChange={this.uploadOnChange}
            >
              <Button icon={<UploadOutlined />}>选择本地文件</Button>
            </Upload>
          </div>
          <div className="workbench-preview"></div>
        </Content>
      </Layout>
    );
  }
}

export default Workbench;