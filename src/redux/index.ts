import { createStore, Store, CombinedState } from 'redux';
import reducer from './reducer';
import { InitState as GlobalInitState } from './reducer/global'

export interface StoreState {
  global: GlobalInitState;
}

const store = createStore(reducer);

export default store;