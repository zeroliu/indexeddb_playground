import debounce from 'debounce';
import {getStore} from 'model/store';
import {logsAdded} from 'model/logs/logs_actions';

let logCache: string[] = [];

function flush() {
  getStore().dispatch(logsAdded(logCache));
  logCache = [];
}

const debouncedFlush = debounce(flush, 200);

export function log(msg: string, src: string) {
  const content = `${new Date().toLocaleTimeString()} - [${src}] ${msg}`;
  logCache.unshift(content);
  console.log(content);
  debouncedFlush();
}
