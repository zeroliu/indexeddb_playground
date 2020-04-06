import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';
import {logError} from 'services/logger';

function prep(iteration: number, blob: string) {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = e => {
      const msg = (e.target as any).error.message;
      logError(msg, 'idb_read');
      reject(msg);
    };
    request.onupgradeneeded = e => {
      const db = (e.target as any).result as IDBDatabase;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = e => {
      const db = (e.target as any).result as IDBDatabase;
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < iteration; ++i) {
        store.add({key: `doc_${i}`, blob});
      }
      transaction.onerror = e => {
        const msg = (e.target as any).error.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    };
  });
}

function cleanup() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase('idb-playground-benchmark');
    request.onerror = e => {
      const msg = (e.target as any).error.message;
      logError(msg, 'idb_read');
      reject(msg);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}

function benchmarkReadGetOne() {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = () => {
      const results: Record<string, {}> = {};
      const db = request.result;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readonly');
      const store = transaction.objectStore('entries');
      const getRequest = store.get('doc_1');
      getRequest.onsuccess = () => {
        results['doc_1'] = getRequest.result;
        const end = performance.now();
        db.close();
        resolve(end - start);
      };
      getRequest.onerror = () => {
        const msg = getRequest.error!.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
    };
  });
}

function benchmarkReadGetAll() {
  return new Promise<number>((resolve, reject) => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = e => {
      const db = (e.target as any).result as IDBDatabase;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readonly');
      const store = transaction.objectStore('entries');
      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = e => {
        const items = (e.target as any).result;
        items.forEach((item: {key: string; blob: string}) => {
          results[item.key] = item.blob;
        });
        const end = performance.now();
        db.close();
        resolve(end - start);
      };
      getAllRequest.onerror = e => {
        const msg = (e.target as any).error.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
    };
  });
}

function benchmarkReadCursor() {
  return new Promise<number>((resolve, reject) => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = e => {
      const db = (e.target as any).result as IDBDatabase;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readonly');
      const store = transaction.objectStore('entries');
      const request = store.openCursor();
      request.onsuccess = e => {
        const cursor = (e.target as any).result;
        if (cursor) {
          results[cursor.key] = cursor.value;
          cursor.continue();
        } else {
          const end = performance.now();
          db.close();
          resolve(end - start);
        }
      };
      request.onerror = e => {
        const msg = (e.target as any).error.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
    };
  });
}

const baseCase = {
  // idb tests are really slow. Only run 100 iterations.
  iteration: 100,
  cleanup,
};

const read1MB: PerformanceTestCase = {
  ...baseCase,
  benchmark: () => benchmarkReadGetOne(),
  name: 'idbRead1MB',
  label: 'idb read 1MB',
  prep: () => prep(10, generateString(1024)),
};

const read1KB: PerformanceTestCase = {
  ...baseCase,
  benchmark: () => benchmarkReadGetOne(),
  name: 'idbRead1KB',
  label: 'idb read 1KB',
  prep: () => prep(10, generateString(1)),
};

const getAllBaseCase = {
  ...baseCase,
  benchmark: () => benchmarkReadGetAll(),
};

const read1024x100BGetAll: PerformanceTestCase = {
  ...getAllBaseCase,
  name: 'idbRead1024x100BGetAll',
  label: 'idb read 1024x100B with getAll',
  prep: () => prep(1024, generateString(100 / 1024)),
};

const read100x1KBGetAll: PerformanceTestCase = {
  ...getAllBaseCase,
  name: 'idbRead100x1KBGetAll',
  label: 'idb read 100x1KB with getAll',
  prep: () => prep(100, generateString(1)),
};

const cursorBaseCase = {
  ...baseCase,
  benchmark: () => benchmarkReadCursor(),
};

const read1024x100BCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead1024x100BCursor',
  label: 'idb read 1024x100B with cursor',
  prep: () => prep(1024, generateString(100 / 1024)),
};

const read100x1KBCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead100x1KBCursor',
  label: 'idb read 100x1KB with cursor',
  prep: () => prep(100, generateString(1)),
};

export const idbReadTestCases = [
  read1MB,
  read1KB,
  read1024x100BGetAll,
  read100x1KBGetAll,
  read1024x100BCursor,
  read100x1KBCursor,
];
