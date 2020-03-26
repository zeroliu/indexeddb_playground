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

function flush() {
  getStore().dispatch(logsAdded(logCache));
  logCache = [];
}

const debouncedFlush = debounce(flush, 200);

export function log(msg: string, src: string, type: LogType = LogType.INFO) {
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
