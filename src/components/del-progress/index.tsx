import React, { useState } from 'react';
import { Progress } from 'antd';
import style from './style.module.scss';

type ProgressStatuses = 'normal'| 'exception' | 'active' | 'success';

const DelProgress = function() {
  const defaultStatus: ProgressStatuses = 'normal';
  const [show, setShow] = useState(true);
  const [percent, setPercent] = useState(50);
  const [status, setStatus] = useState(defaultStatus);

  return (
    <div
      className={style['process-wrapper']}
      style={{ display: show ? '' : 'none' }}
    >
      <Progress
        percent={percent}
        size="small"
        status={status}
      ></Progress>
    </div>
  );
};

export default DelProgress;