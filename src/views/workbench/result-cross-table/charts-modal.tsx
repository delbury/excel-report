import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DataCachesType, ChartStatisticalParams } from './index-types';
import { Modal, Button, Checkbox, DatePicker, Tooltip, Input } from 'antd';
import style from '../style/chart.module.scss';
import { echarts, ECOption } from '@/lib/echarts';
import moment from 'moment';
import { exportExcelFile } from '../tools';
import { columnsCharts } from './columns';
import { TableDataRowChart } from './columns-types';

interface IProps {
  datas: DataCachesType;
}

// 图表属性配置
const commonEchartsOption: { width?: number, height?: number } = {
  width: 700,
  height: 350,
};

// 汇总单位名
const TOTAL_UNIT_NAME: string = '机电三车间';

// echart options
const createBaseOption = (
  title: string,
  date: moment.Moment | null,
  resolvedData: Map<string, ChartStatisticalParams>,
  keyName: string,
  showTechnicalGroup: boolean = false,
): ECOption => {
  const dateStr: string = date?.format('YYYY-MM') ?? '';
  
  const xAxisData: string[] = [];
  const seriesData: number[] = [];
  const temp: { key: string, value: number }[] = [];

  for (let [key, item] of resolvedData) {
    if (!showTechnicalGroup && key === '技术组') continue;
    if (key === TOTAL_UNIT_NAME) continue;
      
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
  const [date, setDate] = useState<moment.Moment | null>(moment()); // 日期
  const [passLine, setPassLine] = useState<number>(60); // 合格线
  const examRateChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const firstPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const secondPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const averageScoresChartEle = useRef<HTMLCanvasElement>(null); // 图表

  // 计算数据
  const resolvedDatas = useMemo(() => {
    // 计算参考率
    const unitMaps: Map<string, ChartStatisticalParams>[] = [new Map(), new Map()];
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
            isOutsource: item.isOutsource,
          });
        }
      });
    }

    // 计算
    for (let i = 0; i < unitMaps.length; i++) {
      const totalParams: ChartStatisticalParams = {
        totalPeople: 0,
        joinedPeople: 0,
        passedPeople: 0,
        totalScores: 0,
        isOutsource: false,
      };
      for (let list of unitMaps[i].values()) {
        list.passedRate = list.joinedPeople ? list.passedPeople / list.joinedPeople : 0;
        list.averageScores = list.joinedPeople ? list.totalScores / list.joinedPeople : 0;
        list.joinedRate = list.totalPeople ? list.joinedPeople / list.totalPeople : 0;

        if (true || !list.isOutsource) {
          totalParams.totalPeople += list.totalPeople;
          totalParams.joinedPeople += list.joinedPeople;
          totalParams.passedPeople += list.passedPeople;
          totalParams.totalScores += list.totalScores;
        }
      } 
      totalParams.passedRate = totalParams.joinedPeople ? totalParams.passedPeople / totalParams.joinedPeople : 0;
      totalParams.averageScores = totalParams.joinedPeople ? totalParams.totalScores / totalParams.joinedPeople : 0;
      totalParams.joinedRate = totalParams.totalPeople ? totalParams.joinedPeople / totalParams.totalPeople : 0;

      unitMaps[i].set(TOTAL_UNIT_NAME, totalParams);
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

  // 导出 excel
  const handleExportExcel = () => {
    const tableDataRows: TableDataRowChart[] = [];
    
    let idCount: number = Date.now();
    for (let [key, value] of resolvedDatas[0]) {
      if (!showTechnicalGroup && key === '技术组') continue;

      const secondData = resolvedDatas[1].get(key);

      tableDataRows.push({
        id: (idCount++).toString(),
        unitName: key,
        monthName: date ? ((date.month() + 1) + '月') : '-',
        totalPeople: value.totalPeople,
        joinedPeople: value.joinedPeople,
        passedPeople: value.passedPeople,
        totalScores: value.totalPeople,
        isOutsource: value.isOutsource,
        passedRate: value.passedRate,
        averageScores: value.averageScores,
        rePassedRate: secondData ? secondData.passedRate : undefined,
        passLine: passLine,
      });
    }

    exportExcelFile([
      {
        columns: columnsCharts,
        data: tableDataRows,
        sheetName: '月考统计表',
        additionalRows: [theInfo],
      }
    ], `${date?.format('YYYY-MM') ?? ''}月考统计表`);
  };

  // 统计信息
  const theInfo = useMemo<string>(() => {
    const data = resolvedDatas[0].get(TOTAL_UNIT_NAME);
    const data2 = resolvedDatas[1].get(TOTAL_UNIT_NAME);
    if (!data || !data2) return '';

    const month = date ? (date.month() + 1) : '-';


    return `${TOTAL_UNIT_NAME}${month}月月考考试人数${data.joinedPeople}人，合格线${passLine.toFixed(2)}分，平均分${data.averageScores?.toFixed(2)}分，合格率${((data.passedRate ?? 0) * 100).toFixed(2)}%，补考合格率${((data2.passedRate ?? 0) * 100).toFixed(2)}%`;
  }, [resolvedDatas, date, passLine]);

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
        <div className="flex-h-sb">
          <div className="toolbar mg-b-10">
            <Button size="small" type="primary" onClick={handleExportExcel}>导出表格数据</Button>
            <Tooltip title="选择考试日期">
              <DatePicker
                picker="month"
                size="small"
                value={date}
                onChange={(selected, str) => setDate(selected)}
                placeholder="选择日期"
              ></DatePicker>
            </Tooltip>
            <Tooltip title="输入合格线">
              <Input
                className="field-width-short"
                size="small"
                type="number"
                min={0}
                max={1000}
                step={1}
                value={passLine}
                onChange={ev => setPassLine(+ev.target.value || 0)}
              ></Input>
            </Tooltip>
            <Checkbox
              checked={showTechnicalGroup}
              onChange={ev => setShowTechnicalGroup(ev.target.checked)}
            >是否统计技术组</Checkbox>
          </div>
          <div>{ theInfo }</div>
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
