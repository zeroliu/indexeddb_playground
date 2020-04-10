import {generateString, fakeGithubResponse} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';
import {logError} from 'services/logger';

function benchmarkWrite(iteration: number, blob: string | object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      logError('Error opening idb', 'idb_write');
      reject('Error opening idb');
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < iteration; ++i) {
        store.add({key: `doc_${i}`, blob});
      }
      transaction.onerror = () => {
        logError('Error adding items to idb', 'idb_write');
        reject('Error adding items to idb');
      };
      transaction.oncomplete = () => {
        const end = performance.now();
        db.close();
        const request = indexedDB.deleteDatabase('idb-playground-benchmark');
        request.onerror = () => {
          logError('Error deleting idb', 'idb_write');
          reject('Error deleting idb');
        };
        request.onsuccess = () => {
          resolve(end - start);
        };
      };
    };
  });
}

const baseCase = {
  // idb tests are really slow. Only run 100 iterations.
  iteration: 100,
};

const write1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MB',
  label: 'idb write 1MB',
  benchmark: () => benchmarkWrite(1, generateString(1024)),
};

const write1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1KB',
  label: 'idb write 1KB',
  benchmark: () => benchmarkWrite(1, generateString(1)),
};

const writeJSON: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWriteJSON',
  label: 'idb write 70KB JSON',
  benchmark: () => benchmarkWrite(1, fakeGithubResponse),
};

const write1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1024x100B',
  label: 'idb write 1024x100B',
  benchmark: () => benchmarkWrite(1024, generateString(100 / 1024)),
};

const write100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x1KB',
  label: 'idb write 100x1KB',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

export const idbWriteTestCases = [
  write1MB,
  write1KB,
  write1024x100B,
  write100x1KB,
  writeJSON,
];
