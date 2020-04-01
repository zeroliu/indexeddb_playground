import React, {useState} from 'react';

import {FreeSpaceLogger} from 'components/free_space_logger/FreeSpaceLogger';
import {getAllTestCases, getTestCase, runTest} from 'services/performance';

import './performance.css';
import {log} from 'services/logger';

/** Sub panel to test performance. */
export function Performance() {
  const [selectedName, setSelectedName] = useState(getAllTestCases()[0].name);
  const testCases = getAllTestCases();
  const selectedTestCase = getTestCase(selectedName);

  function selectTestCase(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedName(e.target.value);
  }

  async function handleClick() {
    const {ci, mean, median} = await runTest(selectedTestCase);
    log(
      `${selectedTestCase.label} - ${mean.toFixed(2)}(mean) ${median.toFixed(
        2
      )}(median) [${ci[0].toFixed(2)}, ${ci[1].toFixed(2)}]`,
      'performance'
    );
  }

  return (
    <div className="performance">
      <FreeSpaceLogger />
      <div className="performance-description">
        {selectedTestCase.description}
      </div>
      <select
        className="performance-select"
        value={selectedTestCase.name}
        onChange={selectTestCase}>
        {testCases.map(testCase => (
          <option key={testCase.name} value={testCase.name}>
            {testCase.label}
          </option>
        ))}
      </select>
      <button className="performance-btn" onClick={handleClick}>
        Start
      </button>
    </div>
  );
}
