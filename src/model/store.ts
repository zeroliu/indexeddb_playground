import {
  createStore as reduxCreateStore,
  compose as reduxCompose,
  Store,
} from 'redux';

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

export function createStore() {
  const rootReducer = (state: any) => state;
  let compose = reduxCompose;
  if (
    isReduxExtensionInstalled(window) &&
    process.env.NODE_ENV === 'development'
  ) {
    compose = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
  }
  store = reduxCreateStore(rootReducer, compose());
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
