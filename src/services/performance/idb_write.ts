import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance';

function benchmarkWrite(iteration: number, blob: string) {
  const start = performance.now();
  const end = performance.now();
  return Promise.resolve(end - start);
}

const write10x100B: PerformanceTestCase = {
  name: 'idbWrite10x100B',
  label: 'idb write 10x100B',
  description: '',
  benchmark: () => benchmarkWrite(10, generateString(0.1)),
};

const write100x100B: PerformanceTestCase = {
  name: 'idbWrite100x100B',
  label: 'idb write 100x100B',
  description: '',
  benchmark: () => benchmarkWrite(100, generateString(0.1)),
};

const write1000x100B: PerformanceTestCase = {
  name: 'idbWrite1000x100B',
  label: 'idb write 1000x100B',
  description: '',
  benchmark: () => benchmarkWrite(1000, generateString(0.1)),
};

const write100x500B: PerformanceTestCase = {
  name: 'idbWrite100x500B',
  label: 'idb write 100x500B',
  description: '',
  benchmark: () => benchmarkWrite(100, generateString(0.5)),
};

const write100x1KB: PerformanceTestCase = {
  name: 'idbWrite100x1KB',
  label: 'idb write 100x1KB',
  description: '',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

const write100x5KB: PerformanceTestCase = {
  name: 'idbWrite100x5KB',
  label: 'idb write 100x5KB',
  description: '',
  benchmark: () => benchmarkWrite(100, generateString(5)),
};

export const idbWriteTestCases = [
  write10x100B,
  write100x100B,
  write1000x100B,
  write100x500B,
  write100x1KB,
  write100x5KB,
];
