import {generateString, fakeGithubResponse} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';

const CACHE_PERFORMANCE_KEY = 'cache-performance';

async function prep(iteration: number, blob: string, isJSON = false) {
  const cache = await caches.open(CACHE_PERFORMANCE_KEY);
  const option = isJSON ? {headers: {'Content-Type': 'application/json'}} : {};
  for (let i = 0; i < iteration; ++i) {
    cache.put(`doc_${i}`, new Response(blob, option));
  }
}

async function cleanup() {
  await caches.delete(CACHE_PERFORMANCE_KEY);
}

async function benchmarkRead(iteration: number, isJSON = false) {
  const results: Record<string, any> = {};
  const start = performance.now();
  const cache = await caches.open(CACHE_PERFORMANCE_KEY);
  for (let i = 0; i < iteration; ++i) {
    const response = await cache.match(`doc_${i}`);
    if (isJSON) {
      results[`doc_${i}`] = await response?.json();
    } else {
      results[`doc_${i}`] = await response?.text();
    }
  }
  const end = performance.now();
  return end - start;
}

const baseCase = {
  iteration: 100,
  cleanup,
};

const read1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheRead1MB',
  label: 'cache read 1MB',
  prep: () => prep(10, generateString(1024)),
  benchmark: () => benchmarkRead(1),
};

const read1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheRead1KB',
  label: 'cache read 1KB',
  prep: () => prep(10, generateString(1)),
  benchmark: () => benchmarkRead(1),
};

const readJSON: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheReadJSON',
  label: 'cache read 70KB JSON',
  prep: () => prep(10, JSON.stringify(fakeGithubResponse), true),
  benchmark: () => benchmarkRead(1, true),
};

const read1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheRead1024x100B',
  label: 'cache read 1024x100B',
  prep: () => prep(1024, generateString(100 / 1024)),
  benchmark: () => benchmarkRead(1024),
};

const read100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'cacheRead100x1KB',
  label: 'cache read 100x1KB',
  prep: () => prep(100, generateString(1)),
  benchmark: () => benchmarkRead(100),
};

export const cacheReadTestCases = [
  read1MB,
  read1KB,
  read100x1KB,
  read1024x100B,
  readJSON,
];
