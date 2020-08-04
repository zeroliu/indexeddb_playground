import {logError} from './logger';

export function handleError(
    err: DOMException|Error|undefined,
    context: string,
    reject?: (err?: Error) => void,
) {
  if (err) {
    if ('message' in err) {
      logError(err.message, context);
      console.error(err.message);
    }
    if ('code' in err) {
      console.error(err.code);
    }
    if ('name' in err) {
      console.error(err.name);
    }
  }
  if (reject) {
    reject(err);
  }
}
