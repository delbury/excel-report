import React, { useEffect, useRef } from 'react';
import { TableDataRow, TableColumns } from './index-types';
import style from './style/chart.module.scss';
import { echarts, ECOption } from '@/lib/echarts';

interface IProps {
  columns: TableColumns<any>;
  data: TableDataRow[];
  title?: string;
  dimensions: {
    key: string;
    label: string;
  }[];
  widthScale?: number;
  markLine?: number;
}

const ResultCharts: React.FC<IProps> = function (props: IProps) {
  const lineChartEle = useRef<HTMLCanvasElement>(null);

  // const total: TableDataRow[] = [];
  // const other: Map<string, TableDataRow[]> = new Map();
  // props.data.forEach(row => {
  //   if (!row.isCondition) {
  //     total.push(row);
  //   } else {
  //     if (other.has(row.unitName)) {
  //       other.get(row.unitName)?.push(row);
  //     } else {
  //       other.set(row.unitName, [row]);
  //     }
  //   }
  // });

  // 绘图，折线图
  useEffect(() => {
    if (!lineChartEle.current) return;

    const lineChart = echarts.init(lineChartEle.current, {},  {
      // height: lineChartEle.current?.parentElement?.offsetHeight ?? 400,
      // width: (lineChartEle.current?.parentElement?.offsetWidth ?? 600) * (props.widthScale ?? 1),
      width: 800,
      height: 350,
    });

    const markLine = props.markLine ? [{
      type: 'line',
      markLine: {
        silent: true,
        data: [
          {
            name: '达标线',
            yAxis: props.markLine ?? 0,
          }
        ],
        label: {

        },
        lineStyle: {
          width: 2
        },
      }
    }] : [];

    const option: ECOption = {
      title: {
        text: props.title ?? '表',
        textAlign: 'center',
        left: '50%',
      },
      legend: {
        top: 30,
        formatter(key) {
          return props.dimensions.find(item => item.key === key)?.label ?? '';
        }
      },
      grid: {
        top: 80,
        bottom: 30,
      },
      // tooltip: {
      //   trigger: 'axis',
      //   showContent: false,
      // },
      xAxis: {
        type: 'category',
      },
      yAxis: {
        type: 'value',
      },
      dataset: {
        dimensions: props.dimensions.map(item => item.key),
        source: props.data,
      },
      series: [
        ...Array(props.dimensions.length - 1).fill({
          type: 'line',
          label: {
            show: true,
            position: 'top',
            formatter: (params: { value: any; seriesName: string; }) =>
              params.value[params.seriesName] ? (+params.value[params.seriesName]).toFixed(2) : '',
          }
        }),
        ...markLine,
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