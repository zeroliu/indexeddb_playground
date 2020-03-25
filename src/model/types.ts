export type InferActionType<T> = T extends {
  [key: string]: (...args: any[]) => infer R;
}
  ? R
  : never;

export function createAction<T extends string>({type}: {type: T}): {type: T};
export function createAction<T extends string, P>({
  type,
  payload,
}: {
  type: T;
  payload: P;
}): {type: T; payload: P};
export function createAction<T extends string, P>({
  type,
  payload,
}: {
  type: T;
  payload?: P;
}) {
  const action: {type: T; payload?: P} = {type};
  if (payload) {
    action.payload = payload;
  }
  return action;
}
