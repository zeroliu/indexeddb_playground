import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const appWrapperId = 'idb-app-wrapper';
let wrapper = document.getElementById(appWrapperId) as HTMLElement;
if (!wrapper) {
  wrapper = document.createElement('div');
  wrapper.id = appWrapperId;
  document.body.appendChild(wrapper);
}
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  wrapper,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
