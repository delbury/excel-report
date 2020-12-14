import {
  CONST,
  GlobalAction,
} from '@/redux/actions/global';

export interface InitState {
  showProgress: boolean;
  percent: number;
}

const initState: InitState = {
  showProgress: false,
  percent: 0,
};

const globalReducer = function(state: InitState = initState, action: GlobalAction): InitState {
  switch(action.type) {
    case CONST.GLOBAL_TOGGLE_PROGRESS:
      return {
        ...state,
        showProgress: action.payload.show !== undefined ? action.payload.show : !state.showProgress
      };

    case CONST.GLOBAL_SET_PERCENT:
      let percent = action.payload.percent ?? 0;
      percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;
      return {
        ...state,
        percent,
      };

    default:
      return state;
  }
};

export default globalReducer;