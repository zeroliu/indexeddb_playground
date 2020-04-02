import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance';
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
  benchmark: () => benchmarkReadCursor(),
};

const cursorBaseCase = {
  ...baseCase,
  benchmark: () => benchmarkReadCursor(),
};

const read1000x100BCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead1000x100BCursor',
  label: 'idb read 1000x100B with cursor',
  prep: () => prep(1000, generateString(0.1)),
};

const read10000x100BCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead10000x100BCursor',
  label: 'idb read 10000x100B with cursor',
  prep: () => prep(10000, generateString(0.1)),
};

const read100x500BCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead100x500BCursor',
  label: 'idb read 100x500B with cursor',
  prep: () => prep(100, generateString(0.5)),
};

const read100x1KBCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead100x1KBCursor',
  label: 'idb read 100x1KB with cursor',
  prep: () => prep(100, generateString(1)),
};

const read100x5KBCursor: PerformanceTestCase = {
  ...cursorBaseCase,
  name: 'idbRead100x5KBCursor',
  label: 'idb read 100x5KB with cursor',
  prep: () => prep(100, generateString(5)),
};

export const idbReadTestCases = [
  read1000x100BCursor,
  read10000x100BCursor,
  read100x500BCursor,
  read100x1KBCursor,
  read100x5KBCursor,
];
