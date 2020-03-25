import {Benchmark} from './benchmark';

const DB_NAME = 'idb_playground_db';
const DB_VERSION = 1;
const ABUSER_STORE = 'abuser';

let db: IDBDatabase | null = null;

export function initIdb() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onerror = event => {
    throw new Error(
      `${(event.target as any).errorCode}: Error opening indexedDB.`
    );
  };
  request.onsuccess = event => {
    db = (event.target as any).result as IDBDatabase;
    console.log('IndexedDB initialization succeeded.');
  };
  request.onupgradeneeded = event => {
    console.log('Upgrading indexedDB.');
    const db = (event.target as any).result as IDBDatabase;
    const store = db.createObjectStore(ABUSER_STORE, {autoIncrement: true});
    store.transaction.oncomplete = () => {
      console.log('store creation completed');
    };
  };
}

export function abuseIdb(size: number, quantity: number) {
  if (!db) {
    throw new Error('DB is not initialized.');
  }
  const benchmarkAddToIdb = new Benchmark('Adding to idb');
  const benchmarkCreateObj = new Benchmark('Creating idb objects');
  const content = new Array((size * 1024) / 4 + 1).join('abcd');
  const transaction = db.transaction(ABUSER_STORE, 'readwrite');
  const store = transaction.objectStore(ABUSER_STORE);
  for (let i = 0; i < quantity; ++i) {
    const blob = new Blob([content], {type: 'text/plain'});
    store.add(blob);
  }
  benchmarkCreateObj.end();
  transaction.oncomplete = () => {
    console.log('transaction completed.');
    benchmarkAddToIdb.end();
  };
}
