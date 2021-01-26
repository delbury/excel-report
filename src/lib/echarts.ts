// import { EChartsFullOption } from 'echarts/lib/option';
// import 'echarts/lib/chart/line';
// import 'echarts/lib/component/title';
// import 'echarts/lib/component/legend';
// import 'echarts/lib/component/tooltip';
// import 'echarts/lib/component/markLine';
// import 'echarts/lib/component/grid'; // 5.0.1 修复，需要添加此项
// import 'echarts/lib/coord/cartesian/Grid'; // 5.0.1 修复，移除此项
// import 'echarts/lib/coord/cartesian/Axis2D'; // 5.0.1 修复，移除此项

import * as echarts from 'echarts/core';

import {
  BarChart,
  BarSeriesOption,
  LineChart,
  LineSeriesOption,
} from 'echarts/charts';

import {
  DatasetComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  MarkLineComponent,
  GridComponent,
  DatasetComponentOption,
  TitleComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
  MarkLineComponentOption,
  GridComponentOption,
} from 'echarts/components';

import {
  CanvasRenderer
} from 'echarts/renderers';

echarts.use([
  DatasetComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  MarkLineComponent,
  GridComponent,
  BarChart,
  LineChart,
  CanvasRenderer
]);
/* eslint-disable */
export type ECOption = echarts.ComposeOption<
  LineSeriesOption | TitleComponentOption | LegendComponentOption |
  TooltipComponentOption | MarkLineComponentOption | GridComponentOption |
  DatasetComponentOption | BarSeriesOption
>;
/* eslint-enable */

export { echarts };