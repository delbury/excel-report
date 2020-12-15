import {
  CONST,
  GlobalAction,
} from '@/redux/actions/global';

export interface InitState {
  showProgress: boolean;
  percent: number;
  loading: boolean;
}

const initState: InitState = {
  showProgress: false,
  percent: 0,
  loading: false,
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
    
    case CONST.GLOBAL_TOGGLE_LOADING:
      return {
        ...state,
        loading: action.payload.loading !== undefined ? action.payload.loading : !state.loading
      };

    default:
      return state;
  }
};

export default globalReducer;