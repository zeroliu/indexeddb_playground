import {ci, median, mean} from './stats';
import {localStorageReadTestCase} from './performance/local_storage_read';
import {localStorageWriteTestCase} from './performance/local_storage_write';

export interface PerformanceTestCase {
  name: string;
  label: string;
  description: string;
  benchmark: () => Promise<number>;
}

interface PerformanceReport {
  ci: [number, number];
  median: number;
  mean: number;
}

let testCases: Record<string, PerformanceTestCase> = {};

function addTestCase(testCase: PerformanceTestCase) {
  testCases[testCase.name] = testCase;
}

export function getTestCase(name: string) {
  if (!testCases[name]) {
    throw new Error(`Test case ${name} does not exist`);
  }
  return testCases[name];
}

export function getAllTestCases() {
  return Object.keys(testCases).map(key => testCases[key]);
}

export async function runTest(
  testCase: PerformanceTestCase
): Promise<PerformanceReport> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(async () => {
        const iteration = 1000;
        const results = [];
        for (let i = 0; i < iteration; ++i) {
          results.push(await testCase.benchmark());
        }
        resolve({
          ci: ci(results),
          median: median(results),
          mean: mean(results),
        });
      });
    });
  });
}

addTestCase(localStorageReadTestCase);
addTestCase(localStorageWriteTestCase);
