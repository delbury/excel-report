import React, { useEffect, useRef } from 'react';
import { TableDataRow, TableColumns } from './index';
import style from './style/chart.module.scss';

import { EChartsFullOption } from 'echarts/lib/option';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/title';
// import 'echarts/lib/component/grid'; // 5.0.1 修复，需要添加此项
import 'echarts/lib/coord/cartesian/Grid'; // 5.0.1 修复，移除此项
import 'echarts/lib/coord/cartesian/Axis2D'; // 5.0.1 修复，移除此项


interface IProps {
  columns: TableColumns<any>;
  data: TableDataRow[];
}

const ResultCharts: React.FC<IProps> = function (props: IProps) {
  const lineChartEle = useRef<HTMLCanvasElement>(null);
  // 绘图，折线图
  useEffect(() => {
    if (!lineChartEle.current) return;

    const lineChart = echarts.init(lineChartEle.current, {},  {
      height: lineChartEle.current?.parentElement?.offsetHeight ?? 400,
      width: lineChartEle.current?.parentElement?.offsetWidth ?? 600,
    });

    const option: EChartsFullOption = {
      title: {
        text: '标题',
        textAlign: 'center',
        left: '50%',
      },
      xAxis: {
        data: ['哦哦哦', '吼吼吼'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        { name: '啊啊啊', type: 'line', data: [1, 3] },
      ],
    };

    lineChart.setOption(option);

    return () => {
      // 清除操作
      lineChart.dispose();
    };
  }, [props.data]);

  return (
    <div className={style['charts-container']}>
      <canvas className={style['chart']} ref={lineChartEle}></canvas>
    </div>
  );
};

export default ResultCharts;