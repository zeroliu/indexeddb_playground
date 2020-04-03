import React, {useState} from 'react';
import {StorageAbuser} from 'components/storage_abuser/StorageAbuser';
import {getAbuser} from 'services/abusers/abuser_registry';
import {Performance} from 'components/performance/Performance';

import './panel.css';

interface Tool {
  label: string;
  component: JSX.Element;
}

export function Panel() {
  const [selectedTool, setSelectedTool] = useState('benchmark');

  const TOOL_OPTIONS: Record<string, Tool> = {
    idbAbuser: {
      label: 'IndexedDB Abuser',
      component: <StorageAbuser abuser={getAbuser('idb')} />,
    },
    cacheAbuser: {
      label: 'Cache Abuser',
      component: <StorageAbuser abuser={getAbuser('cacheAPI')} />,
    },
    localStorageAbuser: {
      label: 'LocalStorage Abuser',
      component: <StorageAbuser abuser={getAbuser('localStorage')} />,
    },
    benchmark: {
      label: 'Performance Benchmark',
      component: <Performance />,
    },
  };

  function renderTool(key: string) {
    if (!TOOL_OPTIONS[key]) {
      throw new Error(`Error finding ${key}`);
    }
    return TOOL_OPTIONS[key].component;
  }

  return (
    <div className="panel">
      {renderTool(selectedTool)}
      <select
        className="panel-selector"
        value={selectedTool}
        onChange={event => {
          setSelectedTool(event.target.value);
        }}>
        {Object.keys(TOOL_OPTIONS).map(key => (
          <option key={key} value={key}>
            {TOOL_OPTIONS[key].label}
          </option>
        ))}
      </select>
    </div>
  );
}
