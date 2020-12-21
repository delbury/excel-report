import React from 'react';
import { Button, Tooltip, Input, Form } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import { validateFormula } from './tools';

const formFormulaName = 'formFormula';
interface TipPropRow {
  message: string;
  isBold?: boolean;
}
interface ITipProps {
  rows: TipPropRow[];
}
const Tips: React.FC<ITipProps> = function (props: ITipProps) {
  return (
    <>
      {
        props.rows.map((item, index) => (
          <div key={index} className={`${item.isBold ? 'fw-b' : ''}`}>
            { item.message }
          </div>)
        )
      }
    </>
  );
};

interface Row {
  id: string;
  title: string;
  formula: string;
  formatFormula?: string;
}
interface IProps { }
interface IState {
  rows: Row[];
}


class Analysis extends React.Component<IProps, IState> {
  formRef: React.RefObject<FormInstance> = React.createRef();

  constructor(props: IProps) {
    super(props);

    this.state = {
      rows: [],
    };
  }

  componentDidMount() {
    this.handleAddRow(() => {
      this.setInitFormValues();
    });
  }

  // 添加一项行统计
  handleAddRow = (cb?: () => any) => {
    this.setState({
      rows: [...this.state.rows, {
        id: Date.now().toString(),
        title: '',
        formula: '',
        formatFormula: '',
      }]
    }, cb);
  }

  // 输入名称
  handleTitleChange = (ev: React.ChangeEvent<HTMLInputElement>, row: Row, index: number) => {
    const rows = [...this.state.rows];
    rows[index].title = ev.target.value;

    this.setState({ rows });
  }

  // 设置表单字段值
  setFormValue(row: Row, value: string) {
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        [formFormulaName + row.id]: value,
      });
    }
  }

  // 输入公式
  handleFormulaChange = (ev: React.ChangeEvent<HTMLInputElement>, row: Row, index: number) => {
    const rows = [...this.state.rows];
    const inputValue = ev.target.value.toLocaleUpperCase();
    rows[index].formula = inputValue;
    rows[index].formatFormula = inputValue;

    this.setState({ rows });
    this.setFormValue(row, inputValue);
  }

  // 设置表单初值
  setInitFormValues = () => {
    const rows = this.state.rows.map(row => {
      row.formula = 'B + C + D';
      row.formatFormula = row.formula;
      this.setFormValue(row, row.formula);

      return row;
    });

    this.setState({ rows });
  }

  // 计算结果
  handleGetResult = () => {
    if (this.formRef.current) {
      this.formRef.current.validateFields();
    }
  }


  render() {
    return (
      <div className="workbench-analysis flex-v">
        <div className="workbench-analysis-btns">
          <Tooltip
            title={<Tips rows={[
              { message: '新增一项行统计' },
              { message: '计算公式说明：' }]
            } />}
            placement="topRight"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              shape="circle"
              size="small"
              onClick={() => this.handleAddRow()}
            ></Button>
          </Tooltip>
          <Button type="primary" size="small" onClick={() => this.handleGetResult()} >计算</Button>
          <Button size="small">保存</Button>
        </div>

        <Form
          className="workbench-analysis-rows"
          size="small"
          ref={ this.formRef }
        >
          {/* <div className="section-title">行统计</div> */}
          {
            this.state.rows.map((row, index) => (
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
                <Input
                  value={row.title}
                  size="small"
                  allowClear
                  placeholder="字段名称"
                  style={{ width: '200px' }}
                  onChange={(ev) => this.handleTitleChange(ev, row, index)}
                />
                <Tooltip
                  title={() => <Tips rows={[{ message: row.formatFormula ?? '' }]} /> }
                  placement="topLeft"
                  trigger={['focus']}
                  mouseLeaveDelay={0}
                >
                  <Form.Item
                    name={formFormulaName + row.id}
                    hasFeedback
                    style={{ margin: 0, width: '100%' }}
                    shouldUpdate={true}
                    rules={[
                      {
                        validator: (rule: any, value: any) => {
                          if(!value) return Promise.reject('公式不能为空！');

                          if (validateFormula(value)) {
                            return Promise.resolve();
                          } else {
                            return Promise.reject('公式格式错误！');
                          }
                        },
                      }
                    ]}
                  >
                    <Input
                      value={row.formula}
                      size="small"
                      allowClear
                      placeholder="输入计算公式"
                      onChange={(ev) => this.handleFormulaChange(ev, row, index)}
                      autoComplete="off"
                    />
                  </Form.Item>
                </Tooltip>
              </div>
            ))
          }
        </Form>
      </div>
    );
  }
}

export default Analysis;