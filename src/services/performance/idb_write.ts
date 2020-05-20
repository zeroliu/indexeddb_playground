import {generateString, fakeGithubResponse} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';
import {handleError} from 'services/error';

const CONTEXT = 'idb_write';

function benchmarkWrite(iteration: number, blob: string | object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
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
        handleError(transaction.error!, CONTEXT, reject);
      };
      transaction.oncomplete = () => {
        const end = performance.now();
        db.close();
        const deletionRequest = indexedDB.deleteDatabase(
          'idb-playground-benchmark'
        );
        deletionRequest.onerror = () => {
          handleError(deletionRequest.error!, CONTEXT, reject);
        };
        deletionRequest.onsuccess = () => {
          resolve(end - start);
        };
      };
    };
  });
}

function benchmarkSeriallyWrite(iteration: number, blob: string | object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
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
      const queue: any[] = [];
      for (let i = 0; i < iteration; ++i) {
        queue.push({key: `doc_${i}`, blob});
      }
      transaction.onerror = () => {
        handleError(transaction.error!, CONTEXT, reject);
      };
      transaction.oncomplete = () => {
        const end = performance.now();
        db.close();
        const deletionRequest = indexedDB.deleteDatabase(
          'idb-playground-benchmark'
        );
        deletionRequest.onerror = () => {
          handleError(deletionRequest.error!, CONTEXT, reject);
        };
        deletionRequest.onsuccess = () => {
          resolve(end - start);
        };
      };
      const add = () => {
        if (queue.length > 0) {
          const data = queue.shift();
          const addRequest = store.add(data);
          addRequest.addEventListener('success', () => {
            add();
          });
        }
      };
      add();
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

const writeJSONSerially: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWriteJSONSerially',
  label: 'idb write 70KB JSON serially',
  benchmark: () => benchmarkSeriallyWrite(1, fakeGithubResponse),
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
  writeJSONSerially,
];
