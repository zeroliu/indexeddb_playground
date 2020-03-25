import React from 'react';
import {logsSelector} from 'model/logs/logs_selectors';
import {useSelector} from 'react-redux';
import './logger.css';

export function Logger() {
  const logs = useSelector(logsSelector);
  return (
    <div className="idb-logger">
      {logs.map((log, index) => (
        <p key={index}>{log}</p>
      ))}
    </div>
  );
}
