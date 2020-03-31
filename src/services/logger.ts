import debounce from 'debounce';
import {getStore} from 'model/store';
import {logsAdded} from 'model/logs/logs_actions';

export enum LogType {
  ERROR,
  INFO,
}
export interface Log {
  type: LogType;
  text: string;
}

let logCache: Log[] = [];
let enabled = true;

function flush() {
  getStore().dispatch(logsAdded(logCache));
  logCache = [];
}

const debouncedFlush = debounce(flush, 200);

export function log(msg: string, src: string, type: LogType = LogType.INFO) {
  if (!enabled) {
    return;
  }
  const text = `${new Date().toLocaleTimeString()} - [${src}] ${msg}`;
  logCache.push({
    type,
    text,
  });
  console.log(text);
  debouncedFlush();
}

export function logError(msg: string, src: string) {
  log(msg, src, LogType.ERROR);
}

export function setEnabledStatus(isEnabled: boolean) {
  enabled = isEnabled;
}

export function getEnabledStatus() {
  return enabled;
}
