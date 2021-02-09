import React, { useState, useRef, useMemo, useEffect } from 'react';
import { DataCachesType, ChartStatisticalParams } from './index-types';
import { Modal, Button, Checkbox, DatePicker, Tooltip, Input, Radio } from 'antd';
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

// echart options
const createBaseOption = (
  unitName: string,
  title: string,
  date: moment.Moment | null,
  resolvedData: Map<string, ChartStatisticalParams>,
  keyName: string,
  showTechnicalGroup: boolean = false,
  isWeek: boolean = false,
): ECOption => {
  const dateStr: string = date?.format('YYYY-MM') ?? '';
  
  const xAxisData: string[] = [];
  const seriesData: number[] = [];
  const temp: { key: string, value: number }[] = [];

  for (let [key, item] of resolvedData) {
    if (!showTechnicalGroup && key === '技术组') continue;
    if (key === unitName) continue;
      
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
      text: `${unitName}${dateStr}${isWeek ? '周考' : '月考'}${title}`,
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

type DataGroupType = 'all' | 'inside' | 'outside';

const ChartsModal: React.FC<IProps> = function (props: IProps) {
  const [showModal, setShowModal] = useState<boolean>(false); // 显示未匹配信息详情弹框
  const [showTechnicalGroup, setShowTechnicalGroup] = useState<boolean>(false); // 是否统计技术组
  const [date, setDate] = useState<moment.Moment | null>(moment()); // 日期
  const [passLine, setPassLine] = useState<number>(60); // 合格线
  const examRateChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const firstPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const secondPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const averageScoresChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const secondTotalPassedChartEle = useRef<HTMLCanvasElement>(null); // 图表
  const [dataGroup, setDataGroup] = useState<DataGroupType>('all'); // 展示的数据集合
  const [isWeek, setIsWeek] = useState<boolean>(false); // 是否周考

  // 单位名
  const totalUnitName = useMemo<string>(() => {
    return dataGroup === 'outside' ? '机电三车间委外单位' : '机电三车间';
  }, [dataGroup]);

  // 计算数据
  const resolvedDatas = useMemo(() => {
    // 计算参考率
    const unitMaps: Map<string, ChartStatisticalParams>[] = [new Map(), new Map()];
    const unitDatas = [props.datas.first, props.datas.second];

    for (let i = 0; i < unitDatas.length; i++) {
      const unitMap = unitMaps[i];

      unitDatas[i].forEach(item => {
        // 过滤
        if (
          (dataGroup === 'inside' && item.isOutsource === true) ||
          (dataGroup === 'outside' && item.isOutsource === false)
        ) {
          return;
        }

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

        // 统计两次总数据
        if (i === 1) {
          const second = unitMap.get(item.unitName);
          const firstRow = unitDatas[0][i];
          const secondRow = item;

          if (second) {
            second.allJoinedPeople = (second.allJoinedPeople ?? 0) + (secondRow.score || firstRow.score ? 1 : 0);
            second.allPassedPeople = (second.allPassedPeople ?? 0) + (firstRow.result === '是' || secondRow.result === '是' ? 1 : 0);
          }
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
        allJoinedPeople: 0,
        allPassedPeople: 0,
        allPassedRate: 0,
      };
      for (let list of unitMaps[i].values()) {
        list.passedRate = list.joinedPeople ? +(list.passedPeople / list.joinedPeople).toFixed(2) : 0;
        list.averageScores = list.joinedPeople ? +(list.totalScores / list.joinedPeople).toFixed(2) : 0;
        list.joinedRate = list.totalPeople ? +(list.joinedPeople / list.totalPeople).toFixed(2) : 0;

        // 两次汇总统计
        if (i === 1) {
          list.allPassedRate = list.allJoinedPeople ? +((list.allPassedPeople ?? 0) / list.allJoinedPeople).toFixed(2) : 0;
        }

        if (true || !list.isOutsource) {
          totalParams.totalPeople += list.totalPeople;
          totalParams.joinedPeople += list.joinedPeople;
          totalParams.passedPeople += list.passedPeople;
          totalParams.totalScores += list.totalScores;  

          // 两次汇总统计
          if (i === 1) {
            totalParams.allJoinedPeople = (totalParams.allJoinedPeople ?? 0) + (list.allJoinedPeople ?? 0);
            totalParams.allPassedPeople = (totalParams.allPassedPeople ?? 0) + (list.allPassedPeople ?? 0);
          }
        }
      } 
      totalParams.passedRate = totalParams.joinedPeople ? +(totalParams.passedPeople / totalParams.joinedPeople).toFixed(2) : 0;
      totalParams.averageScores = totalParams.joinedPeople ? +(totalParams.totalScores / totalParams.joinedPeople).toFixed(2) : 0;
      totalParams.joinedRate = totalParams.totalPeople ? +(totalParams.joinedPeople / totalParams.totalPeople).toFixed(2) : 0;

      // 两次汇总统计
      if (i == 1) {
        totalParams.allPassedRate = totalParams.allJoinedPeople ? +((totalParams.allPassedPeople ?? 0) / totalParams.allJoinedPeople).toFixed(2) : 0;
      }

      unitMaps[i].set(totalUnitName, totalParams);
    }

    return unitMaps;
  }, [props.datas, dataGroup]);

  useEffect(() => {
    if (
      !examRateChartEle.current || !firstPassedChartEle.current ||
      !secondPassedChartEle.current || !averageScoresChartEle.current ||
      !secondTotalPassedChartEle.current || !showModal
    ) {
      return;
    }

    // 参考率图表
    const examRateChart = echarts.init(examRateChartEle.current, {}, commonEchartsOption);
    const optionA: ECOption = createBaseOption(totalUnitName, '参加考试率', date, resolvedDatas[0], 'joinedRate', showTechnicalGroup, isWeek);

    // 一次通过率
    const firstPassedChart = echarts.init(firstPassedChartEle.current, {}, commonEchartsOption);
    const optionB: ECOption = createBaseOption(totalUnitName, '一次通过率', date, resolvedDatas[0], 'passedRate', showTechnicalGroup, isWeek);
    
    // 补考合格率
    const secondPassedChart = echarts.init(secondPassedChartEle.current, {}, commonEchartsOption);
    const optionC: ECOption = createBaseOption(totalUnitName, '补考合格率（二次）', date, resolvedDatas[1], 'passedRate', showTechnicalGroup, isWeek);

    // 平均分
    const averageScoresChart = echarts.init(averageScoresChartEle.current, {}, commonEchartsOption);
    const optionD: ECOption = createBaseOption(totalUnitName, '平均分（一次）', date, resolvedDatas[0], 'averageScores', showTechnicalGroup, isWeek);
  
    // 二次通过率，包括一次
    const secondTotalChart = echarts.init(secondTotalPassedChartEle.current, {}, commonEchartsOption);
    const optionE: ECOption = createBaseOption(totalUnitName, '二次通过率（总）', date, resolvedDatas[1], 'allPassedRate', showTechnicalGroup, isWeek);

    examRateChart.setOption(optionA);
    firstPassedChart.setOption(optionB);
    secondPassedChart.setOption(optionC);
    averageScoresChart.setOption(optionD);
    secondTotalChart.setOption(optionE);

    return () => {
      examRateChart.dispose();
      firstPassedChart.dispose();
      secondPassedChart.dispose();
      averageScoresChart.dispose();
      secondTotalChart.dispose();
    };
  }, [resolvedDatas, date, showTechnicalGroup, showModal, isWeek]);

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
        allPassedRate: secondData?.allPassedRate ?? 0,
      });
    }

    exportExcelFile([
      {
        columns: columnsCharts,
        data: tableDataRows,
        sheetName: (isWeek ? '周考' : '月考') + '统计表',
        additionalRows: [theInfo],
      }
    ], `${date?.format('YYYY-MM') ?? ''}${isWeek ? '周考' : '月考'}统计表`);
  };

  // 统计信息
  const theInfo = useMemo<string>(() => {
    const data = resolvedDatas[0].get(totalUnitName);
    const data2 = resolvedDatas[1].get(totalUnitName);
    if (!data || !data2) return '';

    const month = date ? (date.month() + 1) : '-';


    return `${totalUnitName}${month}月${isWeek ? '周考' : '月考'}考试人数${data.joinedPeople}人，合格线${passLine.toFixed(2)}分，平均分${data.averageScores?.toFixed(2)}分，合格率${((data.passedRate ?? 0) * 100).toFixed(2)}%，补考合格率${((data2.passedRate ?? 0) * 100).toFixed(2)}%，总合格率${((data2.allPassedRate ?? 0) * 100).toFixed(2)}%。`;
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
        style={{ top: '40px', paddingBottom: 0 }}
      >
        <div className="flex-h-sb mg-b-10">
          <div className="toolbar">
            <Button size="small" type="primary" onClick={handleExportExcel}>导出表格数据</Button>

            <Radio.Group size="small" value={dataGroup} onChange={ev => setDataGroup(ev.target.value)}>
              <Radio value="all">全部</Radio>
              <Radio value="inside">车间</Radio>
              <Radio value="outside">委外</Radio>
            </Radio.Group>
            
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
              checked={isWeek}
              onChange={ev => setIsWeek(ev.target.checked)}
            >是否周考</Checkbox>

            <Checkbox
              checked={showTechnicalGroup}
              onChange={ev => setShowTechnicalGroup(ev.target.checked)}
            >是否统计技术组</Checkbox>
          </div>
          <div style={{ marginLeft: '10em', textAlign: 'right', wordBreak: 'keep-all' }}>{ theInfo }</div>
        </div>

        <div className={style['modal-charts-container']}>
          <canvas className={style['chart']} ref={examRateChartEle}></canvas>
          <canvas className={style['chart']} ref={firstPassedChartEle}></canvas>
          <canvas className={style['chart']} ref={secondPassedChartEle}></canvas>
          <canvas className={style['chart']} ref={averageScoresChartEle}></canvas>
          <canvas className={style['chart']} ref={secondTotalPassedChartEle}></canvas>
        </div>
      </Modal>
    </>
  );
};

export default ChartsModal;
