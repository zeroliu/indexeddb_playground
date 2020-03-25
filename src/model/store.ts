import {
  createStore as reduxCreateStore,
  compose as reduxCompose,
  Store,
  combineReducers,
} from 'redux';
import {logsReducer} from './logs/logs_reducers';

/** Window interface with redux devtools compose function. */
export interface WindowWithExtension extends Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof reduxCompose;
}

function isReduxExtensionInstalled(
  window: Window | WindowWithExtension
): window is WindowWithExtension {
  return !!(window as WindowWithExtension).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
}

let store: Store;
const rootReducer = combineReducers({
  logs: logsReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export function createStore() {
  let compose = reduxCompose;
  if (
    isReduxExtensionInstalled(window) &&
    process.env.NODE_ENV === 'development'
  ) {
    compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
  store = reduxCreateStore<AppState, any, unknown, unknown>(
    rootReducer,
    compose()
  );
  return store;
}

export function getStore() {
  if (!store) {
    throw new Error(
      'store has not been created. Make sure to call `createStore` first'
    );
  }
  return store;
}
