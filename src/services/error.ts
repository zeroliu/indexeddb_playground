import {logError} from './logger';

export function handleError(
    err: DOMException|Error|undefined|null,
    context: string,
    reject?: (err?: Error|null) => void,
) {
  if (err) {
    const errMsg = `message: "${err.message}", name: "${err.name}"`;
    console.error(errMsg);
    logError(errMsg, context);
  }
  if (reject) {
    reject(err);
  }
}
