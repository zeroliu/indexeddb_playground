import {Reducer} from 'redux';
import {LogsAction, LOGS_ADDED} from './logs_actions';

export const logsReducer: Reducer<string[], LogsAction> = (
  state: string[] = [],
  action
) => {
  switch (action.type) {
    case LOGS_ADDED:
      return [...action.payload, ...state];
  }
  return state;
};
