import React, {useState, useEffect} from 'react';
import {queryStorage} from 'services/storage';

import './free_space_logger.css';

function toMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)}Mb`;
}

function displayEstimate(estimate: StorageEstimate) {
  const {quota, usage} = estimate;

  if (!quota && !usage) {
    return 'unknown';
  }
  if (!quota && usage) {
    return `Used ${toMB(usage)}`;
  }
  if (!usage && quota) {
    return `${toMB(quota)} available`;
  }
  return `${toMB(usage!)} / ${toMB(quota!)}`;
}

function calculateLocalStorageUsage() {
  return new Blob([
    ...Object.values(localStorage),
    ...Object.keys(localStorage),
  ]).size;
}

export function FreeSpaceLogger() {
  const [estimate, setEstimate] = useState({});
  const [localStorageEstimate, setLocalStorageEstimate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      queryStorage().then(estimate => {
        setEstimate(estimate);
      });
      setLocalStorageEstimate(calculateLocalStorageUsage());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="free-space-logger">
      <div>Total: {displayEstimate(estimate)}</div>
      <div>LocalStorage: {toMB(localStorageEstimate)}</div>
    </div>
  );
}
