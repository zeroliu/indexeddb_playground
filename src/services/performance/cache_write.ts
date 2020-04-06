import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';

const CACHE_PERFORMANCE_KEY = 'cache-performance';

async function prep() {
  await caches.open(CACHE_PERFORMANCE_KEY);
}

async function cleanup() {
  await caches.delete(CACHE_PERFORMANCE_KEY);
}

async function benchmarkWrite(iteration: number, blob: string) {
  const start = performance.now();
  const cache = await caches.open(CACHE_PERFORMANCE_KEY);
  for (let i = 0; i < iteration; ++i) {
    cache.put(`doc_${i}`, new Response(blob));
  }
  const end = performance.now();
  return end - start;
}

const baseCase = {
  iteration: 100,
  prep,
  cleanup,
};

const write1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheWrite1MB',
  label: 'cache write 1MB',
  benchmark: () => benchmarkWrite(1, generateString(1024)),
};

const write1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheWrite1KB',
  label: 'cache write 1KB',
  benchmark: () => benchmarkWrite(1, generateString(1)),
};

const write1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheWrite1024x100B',
  label: 'cache write 1024x100B',
  benchmark: () => benchmarkWrite(1024, generateString(100 / 1024)),
};

const write100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheWrite100x1KB',
  label: 'cache write 100x1KB',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

export const cacheWriteTestCases = [
  write1MB,
  write1KB,
  write1024x100B,
  write100x1KB,
];
