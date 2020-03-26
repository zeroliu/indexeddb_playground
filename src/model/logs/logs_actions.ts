import {createAction, InferActionType} from 'model/types';
import {Log} from 'services/logger';

export const LOGS_ADDED = 'LOG_ADDED';
export function logsAdded(logs: Log[]) {
  return createAction({
    type: LOGS_ADDED,
    payload: logs,
  });
}

export const logsActions = {
  logsAdded,
};

export type LogsAction = InferActionType<typeof logsActions>;
