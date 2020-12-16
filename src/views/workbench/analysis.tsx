import React from 'react';
import { Button, Tooltip, Input } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

interface Row {
  id: string;
  title: string;
  formula: string;
}
interface IProps { }
interface IState {
  rows: Row[];
}

class Analysis extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    this.handleAddRow();
  }

  // 添加一项行统计
  handleAddRow = () => {
    this.setState({
      rows: [...this.state.rows, {
        id: Date.now().toString(),
        title: '',
        formula: '',
      }]
    });
  }

  // 输入名称
  handleTitleChange = (ev: React.ChangeEvent<HTMLInputElement>, row: Row) => {
    const rows = [...this.state.rows];
    const index = rows.findIndex(r => r === row);
    rows[index].title = ev.target.value;

    this.setState({ rows });
  }

  // 输入公式
  handleFormulaChange = (ev: React.ChangeEvent<HTMLInputElement>, row: Row) => {
    const rows = [...this.state.rows];
    const index = rows.findIndex(r => r === row);
    rows[index].formula = ev.target.value;

    this.setState({ rows });
  }

  render() {
    return (
      <div className="workbench-analysis flex-v">
        <div className="workbench-analysis-btns">
          <Tooltip title="添加一项行统计" placement="topRight">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              shape="circle"
              size="small"
              onClick={this.handleAddRow}
            ></Button>
          </Tooltip>
          <Button type="primary" size="small">计算</Button>
        </div>
        <ul className="workbench-analysis-rows">
          {
            this.state.rows.map((row) => (
              <div className="row" key={row.id}>
                <Button
                  type="primary"
                  danger
                  icon={<MinusOutlined />}
                  shape="circle"
                  size="small"
                  onClick={() => this.setState({
                    rows: this.state.rows.filter(r => r.id !== row.id)
                  })}
                ></Button>
                {/* <span>{row.id}</span> */}
                <Input
                  size="small"
                  allowClear
                  placeholder="字段名称"
                  style={{ width: '200px' }}
                  onChange={(ev) => this.handleTitleChange(ev, row)}
                />
                <Input
                  size="small"
                  allowClear
                  placeholder="输入计算公式"
                  onChange={(ev) => this.handleFormulaChange(ev, row)}
                />
              </div>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default Analysis;