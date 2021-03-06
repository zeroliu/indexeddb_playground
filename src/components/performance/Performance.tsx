import React, {useState} from 'react';

import {FreeSpaceLogger} from 'components/free_space_logger/FreeSpaceLogger';
import {
  getAllTestCases,
  getTestCase,
  runTest,
  PerformanceTestCase,
} from 'services/performance/performance';
import {log} from 'services/logger';

import './performance.css';
import {nextFrame} from 'services/next_frame';

/** Sub panel to test performance. */
export function Performance() {
  const [selectedName, setSelectedName] = useState(getAllTestCases()[0].name);
  const [finishedTestCount, setFinishedTestCount] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const testCases = getAllTestCases();
  const selectedTestCase = getTestCase(selectedName);

  function selectTestCase(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedName(e.target.value);
  }

  async function handleStartAllBtnClick() {
    const testCases = getAllTestCases();
    for (const testCase of testCases) {
      await nextFrame(() => runTestCase(testCase));
    }
  }

  async function runTestCase(testCase: PerformanceTestCase) {
    setIsRunning(true);
    const {ci, mean, median} = await runTest(testCase, (percent) => {
      setFinishedTestCount(percent);
    });
    log(
      `${testCase.label} - ${mean.toFixed(2)}ms(mean) ${median.toFixed(
        2
      )}ms(median) [${ci[0].toFixed(2)}, ${ci[1].toFixed(2)}]`,
      'performance'
    );
    setIsRunning(false);
  }

  async function handleStartBtnClick() {
    runTestCase(selectedTestCase);
  }

  return (
    <div className="performance">
      <FreeSpaceLogger />
      <select
        className="performance-select"
        value={selectedTestCase.name}
        onChange={selectTestCase}>
        {testCases.map((testCase) => (
          <option key={testCase.name} value={testCase.name}>
            {testCase.label}
          </option>
        ))}
      </select>
      <div className="performance-bottom">
        <button
          disabled={isRunning}
          className="performance-btn"
          onClick={handleStartBtnClick}>
          {isRunning ? finishedTestCount : 'Start'}
        </button>
        <button
          disabled={isRunning}
          className="performance-btn"
          onClick={handleStartAllBtnClick}>
          Run all tests
        </button>
        <div
          style={{backgroundImage: `url('kirby.gif')`}}
          className="performance-gif"></div>
      </div>
    </div>
  );
}
