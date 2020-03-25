import React from 'react';
import {Abuser} from 'components/abuser/Abuser';
import './app.css';
import {Logger} from 'components/logger/Logger';

export function App() {
  return (
    <div className="idb-app">
      <Logger />
      <Abuser />
    </div>
  );
}
