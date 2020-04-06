import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';
import {logError} from 'services/logger';

function prep() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      const msg = request.error!.message;
      logError(msg, 'idb_range_read');
      reject(msg);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.createObjectStore('entries', {
        keyPath: 'key',
      });
      store.createIndex('index', 'index', {unique: true});
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < 200; ++i) {
        store.add({
          key: `doc_${i}`,
          blob: generateString(100 / 1024),
          index: i,
        });
      }
      transaction.onerror = () => {
        const msg = transaction.error.message;
        logError(msg, 'idb_range_read');
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
    request.onerror = () => {
      const msg = request.error!.message;
      logError(msg, 'idb_range_read');
      reject(msg);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}

async function getByKey(db: IDBDatabase, key: string) {
  return new Promise<{}>((resolve, reject) => {
    const request = db
      .transaction('entries', 'readonly')
      .objectStore('entries')
      .get(key);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      const msg = request.error!.message;
      logError(msg, 'idb_range_read');
      reject(msg);
    };
  });
}

function benchmarkReadSingleGet() {
  return new Promise<number>(resolve => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = async () => {
      const db = request.result;
      const start = performance.now();
      for (let i = 0; i < 100; ++i) {
        const key = `doc_${i}`;
        results[key] = await getByKey(db, key);
      }
      const end = performance.now();
      db.close();
      resolve(end - start);
    };
  });
}

function benchmarkReadCursor() {
  return new Promise<number>((resolve, reject) => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readonly');
      const store = transaction.objectStore('entries');
      const storeRequest = store.openCursor();
      storeRequest.onsuccess = () => {
        const cursor = storeRequest.result;
        if (cursor && cursor.value.index < 100) {
          results[cursor.key as string] = cursor.value;
          cursor.continue();
        } else {
          const end = performance.now();
          db.close();
          resolve(end - start);
        }
      };
      storeRequest.onerror = e => {
        const msg = (e.target as any).error.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
    };
  });
}

function benchmarkReadKeyRange() {
  return new Promise<number>((resolve, reject) => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      const keyRange = IDBKeyRange.bound(0, 99);
      const transaction = db.transaction('entries', 'readonly');
      const store = transaction.objectStore('entries');
      const index = store.index('index');
      const getAllRequest = index.getAll(keyRange);
      getAllRequest.onsuccess = () => {
        const items = getAllRequest.result;
        items.forEach((item: {key: string; blob: string}) => {
          results[item.key] = item;
        });
        const end = performance.now();
        db.close();
        resolve(end - start);
      };
      getAllRequest.onerror = () => {
        const msg = getAllRequest.error!.message;
        logError(msg, 'idb_read');
        reject(msg);
      };
      const end = performance.now();
      db.close();
      resolve(end - start);
    };
  });
}

const baseCase = {
  // idb tests are really slow. Only run 100 iterations.
  iteration: 100,
  cleanup,
  prep,
};

const rangeReadSingleGet: PerformanceTestCase = {
  ...baseCase,
  name: 'idbRangeReadSingleGet',
  label: 'idb read 100x100B blob by getting each item in its own transaction',
  benchmark: () => benchmarkReadSingleGet(),
};

const rangeReadKeyRange: PerformanceTestCase = {
  ...baseCase,
  name: 'idbRangeReadRange',
  label: 'idb read 100x100B blob with key range.',
  benchmark: () => benchmarkReadKeyRange(),
};

const rangeReadCursor: PerformanceTestCase = {
  ...baseCase,
  name: 'idbRangeReadCursor',
  label: 'idb read 100x100B blob with cursor.',
  benchmark: () => benchmarkReadCursor(),
};

export const idbRangeReadTestCases = [
  rangeReadSingleGet,
  rangeReadKeyRange,
  rangeReadCursor,
];
