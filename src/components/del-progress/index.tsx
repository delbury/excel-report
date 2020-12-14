import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import style from './style.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { StoreState } from '@/redux';
import { actions } from '@/redux/actions/global';

enum ProgressStatuses {
  Normal = 'normal',
  Exception = 'exception',
  Active = 'active',
  Success = 'success',
};

const DelProgress: React.FC = function() {
  const dispatch = useDispatch();
  const show = useSelector((state: StoreState) => state.global.showProgress);
  const percent = useSelector((state: StoreState) => state.global.percent);
  const [status, setStatus] = useState(ProgressStatuses.Normal);

  useEffect(() => {
    if(percent === 100 && status !== ProgressStatuses.Success) {
      setStatus(ProgressStatuses.Success);
    } else if(percent !== 100 && status === ProgressStatuses.Success) {
      setStatus(ProgressStatuses.Normal);
    }
  }, [percent, status]);

  if(percent === 100) {
    setTimeout(() => {
      dispatch(actions.toggleGlobalProgress(false));
      dispatch(actions.setGlobalProgressPercent(0));
    }, 1000);
  }
  
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