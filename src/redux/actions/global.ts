import { Action, AnyAction } from 'redux';

export type GLOBAL_ACTION_TYPE = string;
export const GLOBAL_SHOW_PROGRESS: string = 'show-progress';
export const GLOBAL_HIDE_PROGRESS: string = 'hide-progress';

export interface GlobalAction extends Action<GLOBAL_ACTION_TYPE> {
  //
};

export const showGlobalProgress = (): GlobalAction => ({
  type: GLOBAL_SHOW_PROGRESS,
});

export const hideGlobalProgress = (): GlobalAction => ({
  type: GLOBAL_HIDE_PROGRESS,
});