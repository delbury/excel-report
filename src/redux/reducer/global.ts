import {
  GLOBAL_SHOW_PROGRESS,
  GLOBAL_HIDE_PROGRESS,
  GLOBAL_ACTION_TYPE,
  GlobalAction,
} from '@/redux/actions/global';

export interface InitState {
  showProgress: boolean;
}

const initState: InitState = {
  showProgress: true,
};

const globalReducer = function(state: InitState = initState, action: GlobalAction): InitState {
  switch(action.type) {
    case GLOBAL_SHOW_PROGRESS:
      return {
        ...state,
        showProgress: true,
      };

    case GLOBAL_HIDE_PROGRESS:
      return {
        ...state,
        showProgress: false,
      };

    default:
      return state;
  }
};

export default globalReducer;