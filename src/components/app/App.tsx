import React from 'react';
import {Logger} from 'components/logger/Logger';

import './app.css';
import {Panel} from 'components/panel/Panel';

export function App() {
  return (
    <div className="idb-app">
      <Logger />
      <Panel />
    </div>
  );
}
