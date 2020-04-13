import {logError} from './logger';

export function handleError(
  err: DOMException | Error,
  context: string,
  reject?: (err: Error) => void
) {
  logError(err.message, context);
  console.error(err);
  if (reject) {
    reject(err);
  }
}
