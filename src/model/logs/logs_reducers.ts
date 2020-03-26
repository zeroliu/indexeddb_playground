import {Reducer} from 'redux';
import {LogsAction, LOGS_ADDED} from './logs_actions';
import {Log} from 'services/logger';

export const logsReducer: Reducer<Log[], LogsAction> = (
  state: Log[] = [],
  action
) => {
  switch (action.type) {
    case LOGS_ADDED:
      return [...state, ...action.payload];
  }
  return state;
};
