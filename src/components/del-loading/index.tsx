import React, { useState, useEffect } from 'react';
import style from './style.module.scss';
import { Spin } from 'antd';
import { useSelector } from 'react-redux';
import { StoreState } from '@/redux';

const DelLoading: React.FC = function () {
  const show = useSelector((state: StoreState) => state.global.loading);

  return (
    <div
      className={style['loading-wrapper']}
      style={{ display: show ? '' : 'none' }}
    >
      <Spin size="large" />
    </div>
  );
};

export default DelLoading;