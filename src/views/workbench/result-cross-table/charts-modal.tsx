import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DataCachesType, TableDataRowNameList } from './index-types';
import { Modal, Button, Checkbox, DatePicker } from 'antd';
import style from '../style/chart.module.scss';
import { echarts, ECOption } from '@/lib/echarts';
import moment from 'moment';

interface IProps {
  datas: DataCachesType;
}

interface StatisticalParams {
  totalPeople: number; // 总人数
  joinedPeople: number; // 参考人数
  passedPeople: number; // 通过人数
  totalScores: number; // 参考人员总分
  joinedRate?: number; // 参考率
  passedRate?: number; // 通过率
  averageScores?: number; // 参考人员平均分
}

// 图表属性配置
const commonEchartsOption: { width?: number, height?: number } = {
  width: 700,
  height: 350,
};

// echart options
const createBaseOption = (
  title: string,
  date: moment.Moment | null,
  resolvedData: Map<string, StatisticalParams>,
  keyName: string,
  showTechnicalGroup: boolean = false,
): ECOption => {
  const dateStr: string = date?.format('YYYY-MM') ?? '';
  
  const xAxisData: string[] = [];
  const seriesData: number[] = [];
  const temp: { key: string, value: number }[] = [];

  for (let [key, item] of resolvedData) {
    if (!showTechnicalGroup && key === '技术组') continue;
      
    // xAxisData.push(key);
    // // @ts-ignore
    // seriesData.push(item[keyName] ?? 0);
    temp.push({
      key,
      // @ts-ignore
      value: item[keyName] ?? 0,
    });
  }

  temp.sort((a, b) => b.value - a.value);
  temp.forEach(item => {
    xAxisData.push(item.key);
    seriesData.push(item.value);
  });

  return {
    title: {
      text: `机电三车间${dateStr}月考${title}`,
      textAlign: 'center',
      left: '50%',
    },
    grid: {
      // top: 50,
      bottom: 150,
      left: 120,
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
      data: xAxisData,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: seriesData,
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: (params) => params.value ? (+params.value).toFixed(2) : ''
        },
        barCategoryGap: '50%',
      },
    ],
  };
};

const ChartModal: React.FC<IProps> = function (props: IProps) {
  const [showModal, setShowModal] = useState<boolean>(false); // 显示未匹配信息详情弹框
  const [showTechnicalGroup, setShowTechnicalGroup] = useState<boolean>(false); // 是否统计技术组
  const [date, setDate] = useState<moment.Moment | null>(moment());
  const examRateChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const firstPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const secondPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const averageScoresChartEle = useRef<HTMLCanvasElement>(null); // 图表
  // 计算数据
  const resolvedDatas = useMemo(() => {
    // 计算参考率
    const unitMaps: Map<string, StatisticalParams>[] = [new Map(), new Map()];
    const unitDatas = [props.datas.first, props.datas.second];

    for (let i = 0; i < unitDatas.length; i++) {
      const unitMap = unitMaps[i];

      unitDatas[i].forEach(item => {
        if (unitMap.has(item.unitName)) {
          // 累计
          const old = unitMap.get(item.unitName);
          if (old) {
            old.totalPeople += 1;
            old.joinedPeople += !!item.score ? 1 : 0;
            old.passedPeople += item.result === '是' ? 1 : 0;
            old.totalScores += !!item.score ? +item.score : 0;
          }
        } else {
          // 新增初始化
          unitMap.set(item.unitName, {
            totalPeople: 1,
            joinedPeople: !!item.score ? 1 : 0,
            passedPeople: item.result === '是' ? 1 : 0,
            totalScores: !!item.score ? +item.score : 0,
          });
        }
      });
    }

    // 计算
    for (let i = 0; i < unitMaps.length; i++) {
      for (let list of unitMaps[i].values()) {
        list.passedRate = list.joinedPeople ? list.passedPeople / list.joinedPeople : 0;
        list.averageScores = list.joinedPeople ? list.totalScores / list.joinedPeople : 0;
        list.joinedRate = list.totalPeople ? list.joinedPeople / list.totalPeople : 0;
      }
    }

    return unitMaps;
  }, [props.datas]);

  useEffect(() => {
    if (
      !examRateChartEle.current || !firstPassedChartEle.current ||
      !secondPassedChartEle.current || !averageScoresChartEle.current ||
      !showModal
    ) {
      return;
    }

    // 参考率图表
    const examRateChart = echarts.init(examRateChartEle.current, {}, commonEchartsOption);
    const optionA: ECOption = createBaseOption('参加考试率', date, resolvedDatas[0], 'joinedRate', showTechnicalGroup);

    // 一次通过率
    const firstPassedChart = echarts.init(firstPassedChartEle.current, {}, commonEchartsOption);
    const optionB: ECOption = createBaseOption('一次通过率', date, resolvedDatas[0], 'passedRate', showTechnicalGroup);
    
    // 二次通过率
    const secondPassedChart = echarts.init(secondPassedChartEle.current, {}, commonEchartsOption);
    const optionC: ECOption = createBaseOption('二次通过率', date, resolvedDatas[1], 'passedRate', showTechnicalGroup);

    // 平均分
    const averageScoresChart = echarts.init(averageScoresChartEle.current, {}, commonEchartsOption);
    const optionD: ECOption = createBaseOption('平均分', date, resolvedDatas[0], 'averageScores', showTechnicalGroup);
  

    examRateChart.setOption(optionA);
    firstPassedChart.setOption(optionB);
    secondPassedChart.setOption(optionC);
    averageScoresChart.setOption(optionD);

    return () => {
      examRateChart.dispose();
      firstPassedChart.dispose();
      secondPassedChart.dispose();
      averageScoresChart.dispose();
    };
  }, [resolvedDatas, date, showTechnicalGroup, showModal]);

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
        style={{ top: '40px' }}
      >
        <div className="toolbar mg-b-10">
          {/* <Button size="small" type="primary">刷新图表</Button> */}
          <DatePicker
            picker="month"
            size="small"
            value={date}
            onChange={(selected, str) => setDate(selected)}
          ></DatePicker>
          <Checkbox
            checked={showTechnicalGroup}
            onChange={ev => setShowTechnicalGroup(ev.target.checked)}
          >是否统计技术组</Checkbox>
        </div>
        <div className={style['modal-charts-container']}>
          <canvas className={style['chart']} ref={examRateChartEle}></canvas>
          <canvas className={style['chart']} ref={firstPassedChartEle}></canvas>
          <canvas className={style['chart']} ref={secondPassedChartEle}></canvas>
          <canvas className={style['chart']} ref={averageScoresChartEle}></canvas>
        </div>
      </Modal>
    </>
  );
};

export default ChartModal;
