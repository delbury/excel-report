import React, {useState} from 'react';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Modal, Input, Switch } from 'antd';
import { BaseButtonProps } from 'antd/es/button/button';
import style from './index.module.scss';

interface IProps {
  buttonProps?: BaseButtonProps;
  initConfig?: Config;
}
interface ConfigOption {
  value: string;
  formatEnable?: boolean;
  separator?: string;
  index?: number;
}
interface Config {
  name?: string;
  phone?: string;
  unitName?: string;
  station?: string;
}
type ConfigState = Record<keyof Config, ConfigOption>;

const FIELDS: {
  label: string;
  key: keyof Config;
}[] = [
  { label: '单位', key: 'unitName' },
  { label: '姓名', key: 'name' },
  { label: '手机', key: 'phone' },
  { label: '岗位', key: 'station' },
];

const ColumnConfig: React.FC<IProps> = props => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ConfigState>({
    name: { value: '' },
    phone: { value: '' },
    unitName: { value: '' },
    station: { value: '' },
  });

  const handleConfigChange = (key: keyof Config, field: keyof ConfigOption, val: any) => {
    const obj: ConfigState = { ...config };
    obj[key] = {
      ...obj[key],
      [field]: val,
    };
    setConfig(obj);
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
        onCancel={() => setVisible(false)}
        zIndex={2000}
        width="600px"
      >
        <div className={style.grid}>
          {
            FIELDS.map(field => (
              <div className="flex-v flex-fill" key={field.key}>
                <div className="flex-h-sb row">
                  <span>{ field.label }：</span>
                  <Input 
                    className="flex-fill"
                    size="small"
                    placeholder="输入列名"
                    value={config[field.key].value}
                    onChange={ev => handleConfigChange(field.key, 'value', ev.target.value)}
                  ></Input>
                </div>
                <div className="flex-h center row">
                  <span>格式化</span>
                  <Switch size="small" checked={config[field.key].formatEnable} onChange={(ev) => handleConfigChange(field.key, 'formatEnable', ev)} />
                  {
                    config[field.key].formatEnable ? <>
                      <Input size="small" className="flex-fill" placeholder="分隔符" onChange={ev => handleConfigChange(field.key, 'separator', ev.target.value)} />
                      <Input
                        size="small"
                        className="flex-fill"
                        type="number"
                        min={0}
                        step={1}
                        placeholder="位置"
                        onChange={ev => handleConfigChange(field.key, 'index', ev.target.value)}
                      />
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