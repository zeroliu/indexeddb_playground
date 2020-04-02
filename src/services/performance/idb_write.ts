import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance';
import {logError} from 'services/logger';

function benchmarkWrite(iteration: number, blob: string) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      logError('Error opening idb', 'idb_write');
      reject('Error opening idb');
    };
    request.onupgradeneeded = e => {
      const db = (e.target as any).result as IDBDatabase;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = e => {
      const db = (e.target as any).result as IDBDatabase;
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

const write10x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite10x100B',
  label: 'idb write 10x100B',
  benchmark: () => benchmarkWrite(10, generateString(0.1)),
};

const write100x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x100B',
  label: 'idb write 100x100B',
  benchmark: () => benchmarkWrite(100, generateString(0.1)),
};

const write1000x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1000x100B',
  label: 'idb write 1000x100B',
  benchmark: () => benchmarkWrite(1000, generateString(0.1)),
};

const write100x500B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x500B',
  label: 'idb write 100x500B',
  benchmark: () => benchmarkWrite(100, generateString(0.5)),
};

const write100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x1KB',
  label: 'idb write 100x1KB',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

const write100x5KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x5KB',
  label: 'idb write 100x5KB',
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
