import React, {useState} from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Modal, Input, Switch, Tooltip } from 'antd';
import { BaseButtonProps } from 'antd/es/button/button';
import style from './index.module.scss';
import cn from 'classnames';
import { Config, ConfigOption, ConfigProp, ConfigState } from './interface';


// 组件入参类型
interface IProps {
  buttonProps?: BaseButtonProps;
  initConfig?: ConfigProp;
}

// 需要映射的字段列表
const FIELDS: {
  label: string;
  key: keyof Config;
  required?: boolean;
}[] = [
  { label: '单位', key: 'unitName', required: true },
  { label: '姓名', key: 'name', required: true },
  { label: '手机', key: 'phone', required: true },
  { label: '岗位', key: 'station' },
];

// 初始化数据
const getInitConfig = (initConfig?: ConfigProp): ConfigState => {
  const result: ConfigState = {
    name: { value: '' },
    phone: { value: '' },
    unitName: { value: '' },
    station: { value: '' },
  };

  if (initConfig) {
    for (const [key, val] of Object.entries(initConfig)) {
      const k = key as keyof Config;
      if (typeof val === 'string') {
        result[k].value = val;
      } else {
        result[k] = val;
      }
    }
  }
  
  return result;
};

const ColumnConfig: React.FC<IProps> = props => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ConfigState>(getInitConfig(props.initConfig));

  const handleConfigChange = (key: keyof Config, field: keyof ConfigOption, val: any) => {
    const obj: ConfigState = { ...config };
    obj[key] = {
      ...obj[key],
      [field]: val,
    };
    setConfig(obj);
  };

  // 重置
  const rest = () => {
    setVisible(false);
    setConfig(getInitConfig(props.initConfig));
  };

  return (
    <>
      <Button
        size="small"
        icon={<SettingOutlined />}
        {...props?.buttonProps}
        onClick={() => setVisible(true)}
      ></Button>
      <Modal
        title="编辑列映射"
        visible={visible}
        onCancel={rest}
        zIndex={1070}
        width="600px"
      >
        <div className={style.grid}>
          {
            FIELDS.map(field => (
              <div className="flex-v flex-fill" key={field.key}>
                <div className="flex-h-sb row">
                  <span className={cn({ [style.required]: field.required })}>{field.label}：</span>
                  <Tooltip title="输入对应的列名">
                    <Input 
                      className="flex-fill"
                      size="small"
                      placeholder="输入列名"
                      value={config[field.key].value}
                      onChange={ev => handleConfigChange(field.key, 'value', ev.target.value)}
                    ></Input>
                  </Tooltip>
                </div>
                <div className="flex-h center row">
                  <span>格式化</span>

                  <Switch size="small" checked={config[field.key].formatEnable} onChange={(ev) => handleConfigChange(field.key, 'formatEnable', ev)} />
                  {
                    config[field.key].formatEnable ? <>
                      <Tooltip title="输入分隔符">
                        <Input
                          size="small"
                          className="flex-fill"
                          placeholder="分隔符"
                          value={config[field.key].separator}
                          onChange={ev => handleConfigChange(field.key, 'separator', ev.target.value)}
                        />
                      </Tooltip>

                      <Tooltip title="输入分割后需要获取的值的位置，从0开始">
                        <Input
                          size="small"
                          className="flex-fill"
                          type="number"
                          min={0}
                          step={1}
                          placeholder="位置"
                          value={config[field.key].index}
                          onChange={ev => handleConfigChange(field.key, 'index', ev.target.value)}
                        />
                      </Tooltip>

                    </> : null
                  }
                </div>
              </div>

            ))
          }
      
        </div>
      </Modal>
    </>
    
  );
};

export default ColumnConfig;