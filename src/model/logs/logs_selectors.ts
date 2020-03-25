import {AppState} from 'model/store';

export function logsSelector(state: AppState) {
  return state.logs;
}
