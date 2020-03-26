import React, {useEffect, useRef} from 'react';
import {logsSelector} from 'model/logs/logs_selectors';
import {useSelector} from 'react-redux';
import './logger.css';
import {LogType} from 'services/logger';

const LOG_CLASS = {
  [LogType.ERROR]: 'idb-logger-error',
  [LogType.INFO]: 'idb-logger-info',
};

export function Logger() {
  const logs = useSelector(logsSelector);
  const divRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    divRef.current?.scrollIntoView();
  });

  return (
    <div className="idb-logger">
      {logs.map((log, index) => (
        <p key={index} className={LOG_CLASS[log.type]}>
          {log.text}
        </p>
      ))}
      <span ref={divRef}></span>
    </div>
  );
}
