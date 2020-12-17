import React from 'react';
import { Button, Tooltip, Input, Form } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

const Tips: React.FC = function () {
  return (
    <>
      <div className="fw-b">添加一项行统计</div>
      <div>计算公式说明：</div>
    </>
  );
};

interface Row {
  id: string;
  title: string;
  formula: string;
}
interface IProps { }
interface IState {
  rows: Row[];
  currentFormula: string;
}

class Analysis extends React.Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);

    this.state = {
      rows: [],
      currentFormula: '',
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
    const inputValue = ev.target.value.toLocaleUpperCase();
    rows[index].formula = inputValue;

    this.setState({
      rows,
      currentFormula: inputValue,
    });
  }

  render() {
    return (
      <div className="workbench-analysis flex-v">
        <div className="workbench-analysis-btns">
          <Tooltip title={<Tips />} placement="topRight">
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
        <Form className="workbench-analysis-rows">
          {/* <div className="section-title">行统计</div> */}
          {
            this.state.rows.map((row) => (
              <Form.Item className="Item" key={row.id}>
                <div className="row">
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
                  <Input
                    value={row.title}
                    size="small"
                    allowClear
                    placeholder="字段名称"
                    style={{ width: '200px' }}
                    onChange={(ev) => this.handleTitleChange(ev, row)}
                  />
                  <Tooltip
                    title={() => <span>{ this.state.currentFormula }</span>}
                    placement="topLeft"
                    trigger={['focus']}
                  >
                    <Input
                      value={row.formula}
                      size="small"
                      allowClear
                      placeholder="输入计算公式"
                      onChange={(ev) => this.handleFormulaChange(ev, row)}
                    />
                  </Tooltip>
                </div>
              </Form.Item>
            ))
          }
        </Form>
      </div>
    );
  }
}

export default Analysis;