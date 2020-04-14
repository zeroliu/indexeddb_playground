import React, {useState, useEffect} from 'react';
import {estimateFuncs} from 'services/storage';

import './free_space_logger.css';

function toMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)}Mb`;
}

function displayEstimate(estimate: StorageEstimate) {
  const {quota, usage} = estimate;

  if (quota === undefined && usage === undefined) {
    return 'unknown';
  }
  if (quota === undefined && usage !== undefined) {
    return `Used ${toMB(usage)}`;
  }
  if (usage === undefined && quota !== undefined) {
    return `${toMB(quota)} available`;
  }
  return `${toMB(usage!)} / ${toMB(quota!)}`;
}

export function FreeSpaceLogger() {
  const [storageTexts, setStorageTexts] = useState<string[]>([]);
  useEffect(() => {
    const id = setInterval(() => {
      Promise.all(estimateFuncs.map((estimate) => estimate())).then(
        (results) => {
          setStorageTexts(
            results
              .filter((result) => !!result)
              .map(
                (result) =>
                  `${result!.name}: ${displayEstimate(result!.estimate)}`
              )
          );
        }
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="free-space-logger">
      {storageTexts.map((text) => (
        <div key={text}>{text}</div>
      ))}
    </div>
  );
}
