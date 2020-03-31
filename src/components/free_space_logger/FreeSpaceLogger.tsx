import React, {useState, useEffect} from 'react';
import {getAllAbusers} from 'services/abuser_registry';

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

export function FreeSpaceLogger() {
  const [storageTexts, setStorageTexts] = useState<string[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      Promise.all(
        getAllAbusers().map(async abuser => {
          const estimate = await abuser.estimate();
          return {
            name: abuser.name,
            estimate,
          };
        })
      ).then(results => {
        setStorageTexts(
          results.map(
            result => `${result.name}: ${displayEstimate(result.estimate)}`
          )
        );
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="free-space-logger">
      {storageTexts.map(text => (
        <div key={text}>{text}</div>
      ))}
    </div>
  );
}
