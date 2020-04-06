import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';

function benchmarkWrite(iteration: number, blob: string) {
  localStorage.clear();
  const start = performance.now();
  for (let i = 0; i < iteration; ++i) {
    localStorage.setItem(`doc_${i}`, blob);
  }
  const end = performance.now();
  localStorage.clear();
  return Promise.resolve(end - start);
}

const baseCase = {
  iteration: 1000,
};

const write1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageWrite1MB',
  label: 'localStorage write 1MB',
  benchmark: () => benchmarkWrite(1, generateString(1024)),
};

const write1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageWrite1KB',
  label: 'localStorage write 1KB',
  benchmark: () => benchmarkWrite(1, generateString(1)),
};

const write1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageWrite1024x100B',
  label: 'localStorage write 1024x100B',
  benchmark: () => benchmarkWrite(1024, generateString(100 / 1024)),
};

const write100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'localStorageWrite100x1KB',
  label: 'localStorage write 100x1KB',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

export const localStorageWriteTestCases = [
  write1MB,
  write1KB,
  write1024x100B,
  write100x1KB,
];
