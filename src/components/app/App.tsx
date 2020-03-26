import React from 'react';
import {Abuser} from 'components/abuser/Abuser';
import {FreeSpaceLogger} from 'components/free_space_logger/FreeSpaceLogger';
import {Logger} from 'components/logger/Logger';

import './app.css';

export function App() {
  return (
    <div className="idb-app">
      <Logger />
      <FreeSpaceLogger />
      <Abuser />
    </div>
  );
}
