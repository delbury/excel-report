import React, { useState } from 'react';
import { Input } from 'antd';
import { InputProps } from 'antd/es/input';

const DelInput: React.FC<InputProps> = function (props: InputProps) {
  let isOnComposition: boolean = false;
  let lastChangeEvent: React.ChangeEvent<HTMLInputElement>;

  const compositionCallback = (ev: React.CompositionEvent<HTMLInputElement>) => {
    // @ts-ignore
    console.log(ev.target.value, ev);
    if (ev.type === 'compositionstart') {
      isOnComposition = true;
      
    } else if (ev.type === 'compositionend') {
      isOnComposition = false;

      props.onChange && props.onChange(lastChangeEvent);
    }
  };

  return (
    <Input
      {...props}
      onChange={ev => {
        console.log(isOnComposition, ev);
        lastChangeEvent = ev;
        // if (props.onChange && !isOnComposition) {
        //   props.onChange(ev);
        // }
        props.onChange && props.onChange(ev);
      }}
      // onCompositionStart={compositionCallback}
      // onCompositionEnd={compositionCallback}
    ></Input>
  );
};

export default DelInput;