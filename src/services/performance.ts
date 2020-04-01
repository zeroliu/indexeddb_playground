import {ci, median, mean} from './stats';
import {localStorageWriteTestCases} from './performance/local_storage_write';
import {localStorageReadTestCases} from './performance/local_storage_read';

export interface PerformanceTestCase {
  name: string;
  label: string;
  description: string;
  benchmark: () => Promise<number>;
  prep?: () => Promise<void>;
}

interface PerformanceReport {
  ci: [number, number];
  median: number;
  mean: number;
}

let testCases: Record<string, PerformanceTestCase> = {};

function addTestCases(inputs: PerformanceTestCase[]) {
  for (let testCase of inputs) {
    testCases[testCase.name] = testCase;
  }
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

function nextFrame<T>(callback: () => T): Promise<T> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        resolve(callback());
      }, 0);
    });
  });
}

function runBenchmark(benchmark: () => Promise<number>): Promise<number> {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        resolve(benchmark());
      }, 0);
    });
  });
}

export async function runTest(
  testCase: PerformanceTestCase
): Promise<PerformanceReport> {
  return new Promise(async resolve => {
    const iteration = 1000;
    const results = [];
    if (testCase.prep) {
      await testCase.prep();
    }
    for (let i = 0; i < iteration; ++i) {
      results.push(await nextFrame(testCase.benchmark));
    }
    resolve({
      ci: ci(results),
      median: median(results),
      mean: mean(results),
    });
  });
}

addTestCases(localStorageWriteTestCases);
addTestCases(localStorageReadTestCases);
