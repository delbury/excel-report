import React from 'react';
import { Button, Tooltip, Input, Form, Tag, Select } from 'antd';
import { PlusOutlined, MinusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/es/form';
import { validateFormula, resolveFormula, formatFormula } from './tools';
import { TableColumnsMap, TableData, TableColumns } from './index';
import DelPopselect, { Option as DelPopselectOption } from '@/components/del-popselect';

const FORM_FORMULA_NAME = 'formFormula';
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

// 常用函数的提示信息
const commonFormulaInfos: TipPropRow[] = [
  { message: 'X.toString(): 转换为字符串' },
  { message: 'X.padStart(num, str): 字符串头部填充' },
  { message: 'X.padEnd(num, str): 字符串尾部填充' },
];

export interface Row {
  id: string;
  title: string;
  formula: string;
  formatedFormula: string;
  resolvedFormula: string;
  example?: string | number | boolean;
}
enum FieldTypes { Text = 'text', Origin = 'origin', Computed = 'computed' };
enum FieldOperationTypes { Summation = 'summation', Average = 'average', Percentage = 'percentage' };
interface Field {
  id: string;
  value: string | undefined;
  type: FieldTypes;
  operationType?: FieldOperationTypes;
}
interface IProps {
  columnsMap: TableColumnsMap;
  data: TableData;
  columns: TableColumns;
}
interface IState {
  rows: Row[];
  fields: Field[];
  resultTemplate: string;
  resultOutput: string;
}

class Analysis extends React.Component<IProps, IState> {
  formRef: React.RefObject<FormInstance> = React.createRef();

  constructor(props: IProps) {
    super(props);

    this.state = {
      resultTemplate: '',
      resultOutput: '',
      rows: [],
      fields: [
        { id: Date.now().toString(), value: '', type: FieldTypes.Text },
        { id: (Date.now() + 1).toString(), value: undefined, type: FieldTypes.Origin },
      ],
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
        formatedFormula: '',
        resolvedFormula: '',
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
        [FORM_FORMULA_NAME + row.id]: value,
      });
    }
  }

  // 公式获得焦点
  handleFormulaFocus = (ev: React.FocusEvent<HTMLInputElement>, row: Row, index: number) => {
    if (row.formula && !row.formatedFormula && this.formRef.current) {
      const rows = [...this.state.rows];

      this.formRef.current.validateFields([FORM_FORMULA_NAME + row.id]).then(() => {
        rows[index].formatedFormula = formatFormula(this.props.columnsMap, rows[index].formula);
        rows[index].resolvedFormula = resolveFormula(rows[index].formula);
        this.setState({ rows });
      }).catch(() => {});
    }
  }

  // 输入公式
  handleFormulaChange = (ev: React.ChangeEvent<HTMLInputElement>, row: Row, index: number) => {
    const rows = [...this.state.rows];
    const inputValue = ev.target.value;
    rows[index].formula = inputValue;

    if (this.formRef.current) {
      this.formRef.current.validateFields([FORM_FORMULA_NAME + row.id]).then(() => {
        rows[index].formatedFormula = formatFormula(this.props.columnsMap, inputValue);
        rows[index].resolvedFormula = resolveFormula(inputValue);
        this.setState({ rows });
      }).catch(() => {
        rows[index].formatedFormula = '';
        rows[index].example = '';
        // rows[index].resolvedFormula = '';
        this.setState({ rows });
      });
    } else {
      this.setState({ rows });
    }
    this.setFormValue(row, inputValue);
  }

  // 设置表单初值
  setInitFormValues = () => {
    const rows = this.state.rows.map(row => {
      row.formula = `+B + +C`;

      this.setFormValue(row, row.formula);

      return row;
    });

    this.setState({ rows });
  }

  // 计算结果
  handleGetResult = () => {
    if (this.formRef.current) {
      this.formRef.current.validateFields().then(() => {
        const res: any[] = this.props.data.map(rowObj => {
          if (this.state.rows[0].resolvedFormula) {
            return eval(this.state.rows[0].resolvedFormula);
          } else {
            return 0;
          }
        });
        
        console.log(res);
      }).catch(() => null);
    }
  }

  // 添加一个统计字段
  handleFieldAdd = (option: DelPopselectOption<FieldTypes>) => {
    const fields = [...this.state.fields];
    const field: Field = {
      id: Date.now().toString(),
      value: '',
      type: option.key
    };
    fields.push(field);
    this.setState({ fields });
  }

  // 统计字段输入值改变
  handleFieldInputChange(ev: React.ChangeEvent<HTMLInputElement>, field: Field, index: number) {
    const fields = [...this.state.fields];
    fields[index].value = ev.target.value;
    this.setState({ fields });
  }

  handleFieldOriginSelectChange(ev: string, field: Field, index: number) {
    const fields = [...this.state.fields];
    fields[index].value = ev;
    this.setState({ fields });
  }

  // 输出模板改变
  handleResultTemplateChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({
      resultTemplate: ev.target.value,
    });
  }

  render() {
    return (
      <div className="workbench-analysis flex-v">
        <div className="workbench-analysis-btns">
          <Tooltip
            title={<Tips rows={[
              { message: '新增一项行统计' },
              { message: '计算公式说明：' }
            ]} />}
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

          <Button type="primary" size="small" onClick={() => this.handleGetResult()}>
            <span>计算</span>
            <Tooltip
              overlayClassName="workbench-analysis-formula-tooltip"
              title={<Tips rows={[
                { message: '常用公式：' },
                ...commonFormulaInfos,
              ]} />}
              placement="right"
            >
              <InfoCircleOutlined />
            </Tooltip>
          </Button>

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
                <Tag
                  color="#3b5999"
                  closable
                  onClose={() => this.setState({
                    rows: this.state.rows.filter(r => r.id !== row.id)
                  })}
                >
                  {`自定义字段(OWN${(index + 1).toString().padStart(2, '0')})`}
                </Tag>
                {/* <Button
                  type="primary"
                  danger
                  icon={<MinusOutlined />}
                  shape="circle"
                  size="small"
                  onClick={() => this.setState({
                    rows: this.state.rows.filter(r => r.id !== row.id)
                  })}
                ></Button> */}
                {/* <Input
                  value={`自定义字段(OWN${index + 1})`}
                  size="small"
                  style={{ width: '240px' }}
                  disabled
                /> */}

                <Input
                  value={row.title}
                  size="small"
                  allowClear
                  placeholder="字段名称"
                  style={{ width: '200px' }}
                  onChange={(ev) => this.handleTitleChange(ev, row, index)}
                />

                <Tooltip
                  title={() => <Tips rows={[
                    { message: row.formatedFormula ?? '' },
                    { message: row.formatedFormula ? ('第一行结果 = ' + row.example ?? '') : '' }
                  ]} />}
                  placement="topLeft"
                  trigger={['focus']}
                  overlayClassName="workbench-analysis-formula-tooltip"
                >
                  <Form.Item
                    name={FORM_FORMULA_NAME + row.id}
                    hasFeedback
                    style={{ margin: 0, width: '100%' }}
                    validateTrigger={[]}
                    rules={[
                      {
                        validator: (rule: any, value: any) => {
                          if(!value) return Promise.reject('公式不能为空！');
                          
                          const res = validateFormula(value, row, this.props.columnsMap, this.props.data);
                          const rows = [...this.state.rows];
                          if (res !== false) {
                            rows[index].example = res;
                            this.setState({ rows });
                            return Promise.resolve();
                          } else {
                            rows[index].example = 'null';
                            this.setState({ rows });
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
                      onFocus={(ev) => this.handleFormulaFocus(ev, row, index)}
                      autoComplete="off"
                    />
                  </Form.Item>
                </Tooltip>
              </div>
            ))
          }
        </Form>

        <div className="workbench-analysis-result">
          <Input.TextArea
            autoSize={false}
            placeholder="填写输出模板"
            style={{ marginBottom: '10px', resize: 'none', flex: 1 }}
            value={this.state.resultTemplate}
            onChange={ev => this.handleResultTemplateChange(ev)}
          ></Input.TextArea>
          <Input.TextArea
            autoSize={false}
            style={{ resize: 'none', flex: 1 }}
            value={ this.state.resultOutput }
            ></Input.TextArea>
          {/* {
            this.state.fields.map((field, index) => {
              if (field.type === FieldTypes.Text) {
                // 文本字段
                return (
                  <div key={field.id} className="workbench-analysis-result-field">
                    <Tooltip placement="topLeft" title={field.value} trigger={['hover']}>
                      <Input
                        placeholder="输入文本"
                        size="small"
                        value={field.value}
                        onChange={(ev) => this.handleFieldInputChange(ev, field, index)}
                        allowClear
                      ></Input>
                    </Tooltip>
                  </div>
                );

              } else if (field.type === FieldTypes.Origin) {
                // 原生字段
                return (
                  <div key={field.id} className="workbench-analysis-result-field">
                    <Select
                      value={field.value}
                      size="small"
                      style={{ flex: 1 }}
                      placeholder="选择原生字段"
                      allowClear
                      onChange={(ev) => this.handleFieldOriginSelectChange(ev, field, index)}
                    >
                      {
                        this.props.columns.map(col => (<Select.Option key={col.key} value={col.key ?? ''}>{ col.title }</Select.Option>))
                      }
                    </Select>

                    <Select
                      value={field.operationType}
                      size="small"
                      style={{ width: '90px', flexGrow: 0, flexShrink: 0 }}
                      placeholder="运算"
                      allowClear
                    >
                      <Select.Option value={FieldOperationTypes.Summation}>求和</Select.Option>
                      <Select.Option value={FieldOperationTypes.Average}>平均</Select.Option>
                      <Select.Option value={FieldOperationTypes.Percentage}>百分比</Select.Option>
                    </Select>
                  </div>
                );
              }
            })
          }
          <DelPopselect
            options={[
              { title: '文本', key: FieldTypes.Text },
              { title: '原生字段', key: FieldTypes.Origin },
              { title: '自定义字段', key: FieldTypes.Computed },
            ]}
            onSelect={(option) => this.handleFieldAdd(option)}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              style={{ width: '60px' }}
            ></Button>
          </DelPopselect> */}
        </div>
      </div>
    );
  }
}

export default Analysis;