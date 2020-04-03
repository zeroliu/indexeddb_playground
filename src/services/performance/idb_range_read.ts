import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';
import {logError} from 'services/logger';

function prep() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = e => {
      const msg = (e.target as any).error.message;
      logError(msg, 'idb_range_read');
      reject(msg);
    };
    request.onupgradeneeded = e => {
      const db = (e.target as any).result as IDBDatabase;
      const store = db.createObjectStore('entries', {
        keyPath: 'key',
      });
      store.createIndex('index', 'index', {unique: true});
    };

    request.onsuccess = e => {
      const db = (e.target as any).result as IDBDatabase;
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < 1000; ++i) {
        store.add({key: `doc_${i}`, blob: generateString(0.1), index: i});
      }
      transaction.onerror = e => {
        const msg = (e.target as any).error.message;
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
    request.onerror = e => {
      const msg = (e.target as any).error.message;
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
    request.onerror = e => {
      const msg = (e.target as any).error.message;
      logError(msg, 'idb_range_read');
      reject(msg);
    };
  });
}

function benchmarkReadSingleGet(itemCount: number) {
  return new Promise<number>(resolve => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = async () => {
      const db = request.result;
      const start = performance.now();
      for (let i = 0; i < itemCount; ++i) {
        const key = `doc_${i}`;
        results[key] = await getByKey(db, key);
      }
      const end = performance.now();
      db.close();
      resolve(end - start);
    };
  });
}

function benchmarkReadRange(itemCount: number) {
  return new Promise<number>((resolve, reject) => {
    const results: Record<string, {}> = {};
    const request = indexedDB.open('idb-playground-benchmark', 1);

    request.onsuccess = async e => {
      const db = request.result;
      const start = performance.now();
      const keyRange = IDBKeyRange.bound(0, itemCount - 1);
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

const rangeReadSingleGet500: PerformanceTestCase = {
  ...baseCase,
  name: 'idb500RangeReadSingleGet',
  label: 'idb read 500x100B blob by getting each item in its own transaction',
  benchmark: () => benchmarkReadSingleGet(500),
};

const rangeReadSingleGet1000: PerformanceTestCase = {
  ...baseCase,
  name: 'idbRange1000ReadSingleGet',
  label: 'idb read 1000x100B blob by getting each item in its own transaction',
  benchmark: () => benchmarkReadSingleGet(1000),
};

const rangeReadRange: PerformanceTestCase = {
  ...baseCase,
  name: 'idbRangeReadRange',
  label: 'idb read 500x100B blob with key range.',
  benchmark: () => benchmarkReadRange(500),
};

export const idbRangeReadTestCases = [
  rangeReadSingleGet500,
  rangeReadSingleGet1000,
  rangeReadRange,
];
