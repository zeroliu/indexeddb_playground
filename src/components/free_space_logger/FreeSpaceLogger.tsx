import React, {useState, useEffect} from 'react';
import {queryStorage} from 'services/storage';

import './free_space_logger.css';

function toMB(bits: number): string {
  return `${(bits / 1024 / 1024).toFixed(2)}Mb`;
}

function displayMessage(estimate: StorageEstimate) {
  const {quota, usage} = estimate;

  if (!quota && !usage) {
    return 'Unable to get storage data';
  }
  if (!quota && usage) {
    return `Used ${toMB(usage)}`;
  }
  if (!usage && quota) {
    return `${toMB(quota)} available`;
  }
  return `Storage: ${toMB(usage!)} / ${toMB(quota!)}`;
}

export function FreeSpaceLogger() {
  const [estimate, setEstimate] = useState({});
  useEffect(() => {
    queryStorage().then(estimate => {
      setEstimate(estimate);
    });
  });

  return (
    <div className="idb-free-space-logger">{displayMessage(estimate)}</div>
  );
}
