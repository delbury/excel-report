import { ExternalParamsMap } from './columns-types';
import { ConfigProp } from '@/views/components/column-config/interface';

export const thirdUnitConfig: ConfigProp = {
  unitName: {
    value: 'A',
    formatEnable: true,
    separator: '-',
    index: 0
  },
  name: {
    value: 'A',
    formatEnable: true,
    separator: '-',
    index: 1
  },
  phone: 'G',
  station: 'D',
};

export const sheetFieldMap: Map<string, ExternalParamsMap> = new Map([
  // ['车间', {
  //   unitName: 'A',
  //   name: 'B',
  //   phone: 'C',
  //   station: 'D',
  // }],
  ['车间', {
    unitName: 'E',
    name: 'A',
    phone: 'G',
    station: 'D',
  }],
  ['委外', {
    unitName: 'A',
    name: 'A',
    phone: 'G',
    station: 'D',
  }],
  ['十二局', {
    unitName: 'C',
    name: 'D',
    phone: 'J',
    station: 'H',
  }],
  ['正立', {
    unitName: 'B',
    name: 'C',
    phone: 'J',
    station: 'E',
  }],
  ['上海三菱', {
    unitName: 'B',
    name: 'C',
    phone: 'I',
    station: 'E',
  }],
  ['奥的斯', {
    unitName: 'B',
    name: 'C',
    phone: 'I',
    station: 'E',
  }],
  ['迅达', {
    unitName: 'B',
    name: 'C',
    phone: 'I',
    station: 'E',
  }],
  ['今创', {
    unitName: 'B',
    name: 'C',
    phone: 'H',
    station: 'D',
  }],
  ['惠民', {
    unitName: 'B',
    name: 'C',
    phone: 'I',
    station: 'E',
  }],
  ['维创', {
    unitName: 'B',
    name: 'C',
    phone: 'I',
    station: 'E',
  }],
]);