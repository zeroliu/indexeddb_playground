import {logError} from './logger';

export function handleError(
    err: DOMException|Error|undefined,
    context: string,
    reject?: (err?: Error) => void,
) {
  if (err) {
    console.error(`message: ${err.message}, code: ${(err as any).code}, name: ${
        err.name}`);
    logError(err.message, context);
  }
  if (reject) {
    reject(err);
  }
}
