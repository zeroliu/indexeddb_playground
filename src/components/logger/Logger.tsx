import React, {useEffect, useRef, useState} from 'react';
import {logsSelector} from 'model/logs/logs_selectors';
import {useSelector} from 'react-redux';
import './logger.css';
import {LogType, getEnabledStatus, setEnabledStatus} from 'services/logger';

const LOG_CLASS = {
  [LogType.ERROR]: 'logger-error',
  [LogType.INFO]: 'logger-info',
};

export function Logger() {
  const [enabled, setEnabled] = useState(getEnabledStatus());
  const logs = useSelector(logsSelector);
  const divRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    divRef.current?.scrollIntoView();
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEnabledStatus(e.target.checked);
    setEnabled(getEnabledStatus());
  }

  return (
    <div className="logger">
      <label className="logger-toggle">
        Enable logs:
        <input
          type="checkbox"
          checked={enabled}
          onChange={handleChange}></input>
      </label>
      {logs.map((log, index) => (
        <p key={index} className={LOG_CLASS[log.type]}>
          {log.text}
        </p>
      ))}
      <span ref={divRef}></span>
    </div>
  );
}
