import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './components/app/App';
import * as serviceWorker from './serviceWorker';
import {Provider} from 'react-redux';
import {createStore} from 'model/store';
import {log} from 'services/logger';

const appWrapperId = 'idb-app-wrapper';
let wrapper = document.getElementById(appWrapperId) as HTMLElement;
if (!wrapper) {
  wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position: absolute; z-index: 1000; top: 0; bottom: 0; left: 0; right: 0';
  wrapper.id = appWrapperId;
  document.body.appendChild(wrapper);
}

const store = createStore();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  wrapper
);

log('v0.01', 'app');

function handleKeydown(event: any) {
  switch (event.key) {
    case 'SoftRight':
      (document.activeElement as HTMLElement).blur();
      console.log('right key pressed');
  }
}
document.addEventListener('keydown', handleKeydown);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
