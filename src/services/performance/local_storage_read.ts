import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';

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

function cleanup() {
  localStorage.clear();
  return Promise.resolve();
}

const baseCase = {
  iteration: 1000,
  cleanup,
};

const read1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead1MB',
  label: 'localStorage read 1MB',
  benchmark: () => benchmarkRead(1),
  prep: () => prep(1, generateString(1024)),
};

const read1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead1KB',
  label: 'localStorage read 1KB',
  benchmark: () => benchmarkRead(1),
  prep: () => prep(10, generateString(1)),
};

const read1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead1024x100B',
  label: 'localStorage read 1024x100B',
  benchmark: () => benchmarkRead(1024),
  prep: () => prep(1024, generateString(100 / 1024)),
};

const read100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageRead100x1KB',
  label: 'localStorage read 100x1KB',
  benchmark: () => benchmarkRead(100),
  prep: () => prep(100, generateString(1)),
};

export const localStorageReadTestCases = [
  read1MB,
  read1KB,
  read1024x100B,
  read100x1KB,
];
