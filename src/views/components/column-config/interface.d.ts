export interface ConfigOption {
  value: string;
  formatEnable?: boolean;
  separator?: string;
  index?: number;
}
export interface Config {
  name?: string;
  phone?: string;
  unitName?: string;
  station?: string;
}

// 初始状态类型
export type ConfigProp = Record<keyof Config, ConfigOption | string>;

// 组件状态类型
export type ConfigState = Record<keyof Config, ConfigOption>;