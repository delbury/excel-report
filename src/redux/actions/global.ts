import { Action, AnyAction } from 'redux';

export type GLOBAL_ACTION_TYPE = string;
export const GLOBAL_TOGGLE_PROGRESS: GLOBAL_ACTION_TYPE = 'toggle-progress';
export const GLOBAL_SET_PERCENT: GLOBAL_ACTION_TYPE = 'set-percent';
export const GLOBAL_TOGGLE_LOADING: GLOBAL_ACTION_TYPE = 'toggle-loading';

export const CONST = {
  GLOBAL_TOGGLE_PROGRESS,
  GLOBAL_SET_PERCENT,
  GLOBAL_TOGGLE_LOADING,
};

export interface GlobalAction extends Action<GLOBAL_ACTION_TYPE> {
  payload: {
    show?: boolean;
    percent?: number;
    loading?: boolean;
  };
};

// 显示/隐藏进度条
export const toggleGlobalProgress = (status?: boolean): GlobalAction => ({
  type: GLOBAL_TOGGLE_PROGRESS,
  payload: {
    show: status,
  },
});

// 设置进度
export const setGlobalProgressPercent = (percent: number): GlobalAction => ({
  type: GLOBAL_SET_PERCENT,
  payload: {
    percent,
  },
});

// 显示/隐藏loading图标
export const toggleGlobalLoading = (status?: boolean): GlobalAction => ({
  type: GLOBAL_TOGGLE_LOADING,
  payload: {
    loading: status,
  },
});

export const actions = {
  toggleGlobalProgress,
  setGlobalProgressPercent,
  toggleGlobalLoading,
};