import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance';

function benchmarkRead(iteration: number) {
  const res: Record<string, string> = {};
  const start = performance.now();
  for (let i = 0; i < iteration; ++i) {
    const key = `doc_${i}`;
    res[key] = localStorage.getItem(key)!;
  }
  const end = performance.now();
  return Promise.resolve(end - start);
}

function prep(iteration: number, blob: string) {
  localStorage.clear();
  for (let i = 0; i < iteration; ++i) {
    localStorage.setItem(`doc_${i}`, blob);
  }
  return Promise.resolve();
}

const baseCase = {
  iteration: 1000,
};

const read1000x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead1000x100B',
  label: 'localStorage read 1000x100B',
  benchmark: () => benchmarkRead(1000),
  prep: () => prep(1000, generateString(0.1)),
};

const read10000x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead10000x100B',
  label: 'localStorage read 10000x100B',
  benchmark: () => benchmarkRead(10000),
  prep: () => prep(10000, generateString(0.1)),
};

const read100x500B: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead100x500B',
  label: 'localStorage read 100x500B',
  benchmark: () => benchmarkRead(100),
  prep: () => prep(100, generateString(0.5)),
};

const read100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead100x1KB',
  label: 'localStorage read 100x1KB',
  benchmark: () => benchmarkRead(100),
  prep: () => prep(100, generateString(1)),
};

const read100x5KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead100x5KB',
  label: 'localStorage read 100x5KB',
  benchmark: () => benchmarkRead(100),
  prep: () => prep(100, generateString(5)),
};

export const localStorageReadTestCases = [
  read1000x100B,
  read10000x100B,
  read100x500B,
  read100x1KB,
  read100x5KB,
];
