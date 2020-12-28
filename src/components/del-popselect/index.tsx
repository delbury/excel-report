import React, { useState } from 'react';
import { Popover, Button } from 'antd';
import style from './style.module.scss';

export interface Option<K> {
  title: string;
  key: K;
}
interface IProps<OK> {
  children: React.ReactNode;
  options: Option<OK>[];
  onSelect?: (option: Option<OK>) => void;
}

const DelPopselect = function<T>(props: IProps<T>) {
  const [visible, setVisible] = useState(false);

  return (
    <Popover
      visible={ visible }
      trigger="click"
      placement="bottomLeft"
      onVisibleChange={status => setVisible(status)}
      content={() => (
        <div>
          {
            props.options.map((option, index) => (
              <Button
                className={style.btn}
                type="dashed"
                size="small"
                key={index}
                onClick={() => {
                  props.onSelect && props.onSelect(option);
                  setVisible(false);
                }}
              >{option.title}</Button>
            ))
          }
        </div>
      )}
    >
      { props.children }
    </Popover>
  );
};

export default DelPopselect;