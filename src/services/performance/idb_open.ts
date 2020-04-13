import {PerformanceTestCase} from 'services/performance/performance';
import {handleError} from 'services/error';
import {fakeGithubResponse} from 'services/mock_data';

const CONTEXT = 'idb_open';
const IDB_NAME = 'idb-playground-open-benchmark';

function prep() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1);
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
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < 1000; ++i) {
        store.add({key: `doc_${i}`, blob: fakeGithubResponse});
      }
      transaction.onerror = () => {
        handleError(transaction.error!, CONTEXT, reject);
      };
      transaction.oncomplete = () => {
        db.close();
        requestAnimationFrame(() => {
          setTimeout(() => resolve(), 0);
        });
      };
    };
  });
}

function cleanup() {
  return new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(IDB_NAME);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onsuccess = () => {
      resolve();
    };
  });
}

function benchmark() {
  return new Promise<number>((resolve, reject) => {
    const start = performance.now();
    const request = indexedDB.open(IDB_NAME, 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onsuccess = () => {
      const end = performance.now();
      const db = request.result;
      db.close();
      requestAnimationFrame(() => {
        setTimeout(() => resolve(end - start), 0);
      });
    };
  });
}

const idbOpen: PerformanceTestCase = {
  iteration: 100,
  name: 'idbOpen',
  label: 'idb open',
  benchmark,
  prep,
  cleanup,
};

export const idbOpenTestCases = [idbOpen];
