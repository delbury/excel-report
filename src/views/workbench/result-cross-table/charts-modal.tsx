import React, { useState, useRef, useMemo } from 'react';
import { DataCachesType } from './index-types';
import { Modal, Button } from 'antd';
import style from '../style/chart.module.scss';

interface IProps {
  datas: DataCachesType;
}

const ChartModal: React.FC<IProps> = function (props: IProps) {
  const [showModal, setShowModal] = useState<boolean>(false); // 显示未匹配信息详情弹框
  const examRateChartEle = useRef<HTMLCanvasElement>(null);

  // 计算数据
  useMemo(() => {
    // 计算参考率
    

  }, [props.datas]);

  // 关闭弹框
  const close = () => setShowModal(false);
  // 打开弹框
  const open = () => setShowModal(true);

  return (
    <>
      <Button size="small" onClick={open}>查看图表</Button>
      <Modal
        title="查看图表"
        visible={showModal}
        onCancel={close}
        onOk={close}
        cancelText="关闭"
        okText="确定"
        width="80vw"
      >
        <div className={style['modal-charts-container']}>
          <canvas className={style['chart']} ref={examRateChartEle}></canvas>
        </div>
      </Modal>
    </>
  );
};

export default ChartModal;
