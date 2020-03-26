import React, {useEffect, useRef} from 'react';
import {logsSelector} from 'model/logs/logs_selectors';
import {useSelector} from 'react-redux';
import './logger.css';

export function Logger() {
  const logs = useSelector(logsSelector);
  const divRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    divRef.current?.scrollIntoView();
  });

  return (
    <div className="idb-logger">
      {logs.map((log, index) => (
        <p key={index}>{log}</p>
      ))}
      <span ref={divRef}></span>
    </div>
  );
}
