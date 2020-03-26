import {Benchmark} from './benchmark';

const DB_NAME = 'idb_playground_db';
const DB_VERSION = 1;
const ABUSER_STORE = 'abuser';

let db: IDBDatabase;

export function initIdb() {
  const benchmark = new Benchmark('initializing idb');
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = event => {
    throw new Error(
      `${(event.target as any).errorCode}: Error opening indexedDB.`
    );
  };
  request.onsuccess = event => {
    db = (event.target as any).result as IDBDatabase;
    benchmark.end();
  };
  request.onupgradeneeded = event => {
    const benchmark = new Benchmark('upgrading idb');
    const db = (event.target as any).result as IDBDatabase;
    const store = db.createObjectStore(ABUSER_STORE, {autoIncrement: true});
    store.transaction.oncomplete = () => {
      benchmark.end();
    };
  };
}

function checkIdb() {
  if (!db) {
    throw new Error('DB is not initialized.');
  }
}

export function clearAbuser() {
  checkIdb();
  const benchmark = new Benchmark('Clearing abuser store');
  const transaction = db.transaction(ABUSER_STORE, 'readwrite');
  const store = transaction.objectStore(ABUSER_STORE);
  store.clear();
  transaction.oncomplete = () => {
    benchmark.end();
  };
}

export function fillAbuser(sizeInKb: number, quantity: number) {
  checkIdb();
  const benchmarkAddToIdb = new Benchmark(
    `Adding ${quantity} x ${sizeInKb}kb entries`
  );
  const benchmarkCreateObj = new Benchmark('Creating idb objects');
  const content = new Array((sizeInKb * 1024) / 4 + 1).join('abcd');
  const transaction = db.transaction(ABUSER_STORE, 'readwrite');
  const store = transaction.objectStore(ABUSER_STORE);
  for (let i = 0; i < quantity; ++i) {
    const blob = new Blob([content], {type: 'text/plain'});
    store.add(blob);
  }
  benchmarkCreateObj.end();
  transaction.oncomplete = () => {
    benchmarkAddToIdb.end();
  };
}
