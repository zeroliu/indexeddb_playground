import React, {useState} from 'react';
import {StorageAbuser} from 'components/storage_abuser/StorageAbuser';
import {
  fillAbuser as idbFillAbuser,
  clearAbuser as idbClearAbuser,
} from 'services/idb';
import {
  fillAbuser as lsFillAbuser,
  clearAbuser as lsClearAbuser,
} from 'services/localstorage';

import './panel.css';

interface Tool {
  label: string;
  component: JSX.Element;
}

const TOOL_OPTIONS: Record<string, Tool> = {
  idbAbuser: {
    label: 'IndexedDB Abuser',
    component: (
      <StorageAbuser fillAbuser={idbFillAbuser} clearAbuser={idbClearAbuser} />
    ),
  },
  localStorageAbuser: {
    label: 'LocalStorage Abuser',
    component: (
      <StorageAbuser fillAbuser={lsFillAbuser} clearAbuser={lsClearAbuser} />
    ),
  },
};

function renderTool(key: string) {
  if (!TOOL_OPTIONS[key]) {
    throw new Error(`Error finding ${key}`);
  }
  return TOOL_OPTIONS[key].component;
}

export function Panel() {
  const [selectedTool, setSelectedTool] = useState('idbAbuser');

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
