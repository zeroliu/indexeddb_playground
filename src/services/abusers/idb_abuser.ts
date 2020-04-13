import {Benchmark} from 'services/benchmark';
import {log} from 'services/logger';
import {BaseAbuser} from './base_abuser';
import {generateString} from 'services/mock_data';
import {handleError} from 'services/error';

const DB_NAME = 'idb_playground_db';
const DB_VERSION = 1;
const ABUSER_STORE = 'abuser';

interface KaiOSDeviceStorage {
  freeSpace: () => any;
}
interface KaiOSNavigator extends Navigator {
  getDeviceStorage: (type: string) => KaiOSDeviceStorage;
}

export class IdbAbuser extends BaseAbuser {
  db: IDBDatabase | null = null;

  constructor() {
    super('idb');
  }

  init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => {
        handleError(request.error!, this.name, reject);
      };
      request.onsuccess = () => {
        this.db = request.result;
        log('indexedDB successfully opened', this.name);
        resolve();
      };
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore(ABUSER_STORE, {
          autoIncrement: true,
        });
        store.transaction.oncomplete = () => {};
        store.transaction.onerror = () => {
          handleError(store.transaction.error!, this.name);
        };
      };
    });
  }

  checkIdb() {
    if (!this.db) {
      const err = new Error('DB is not initialized');
      handleError(err, this.name);
      throw err;
    }
  }

  estimate(): Promise<StorageEstimate> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate();
    }

    if ('getDeviceStorage' in navigator) {
      const kaiOSNavigator = navigator as KaiOSNavigator;
      const storage = kaiOSNavigator.getDeviceStorage('apps');
      if (storage) {
        return new Promise((resolve, reject) => {
          const request = storage.freeSpace();
          request.onsuccess = () => {
            resolve({quota: request.result});
          };
          request.onerror = () => {
            handleError(request.error, this.name, reject);
          };
        });
      }
    }

    return Promise.resolve({});
  }

  clear(): Promise<void> {
    this.checkIdb();
    const transaction = this.db!.transaction(ABUSER_STORE, 'readwrite');
    const store = transaction.objectStore(ABUSER_STORE);
    store.clear();
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        log('Successfully cleared idb.', this.name);
        resolve();
      };
      transaction.onerror = () => {
        handleError(transaction.error, this.name, reject);
      };
    });
  }

  fill(sizeInKb: number, quantity: number): Promise<void> {
    this.checkIdb();
    if (quantity <= 0) {
      const err = new Error('quantity not provided');
      handleError(err, this.name);
      return Promise.reject(err);
    }
    const content = generateString(sizeInKb);
    const benchmarkCreateObj = new Benchmark('Creating idb objects');
    const benchmarkAddToIdb = new Benchmark(
      `Adding ${quantity} x ${sizeInKb}kb entries to idb`
    );
    const transaction = this.db!.transaction(ABUSER_STORE, 'readwrite');
    const store = transaction.objectStore(ABUSER_STORE);
    for (let i = 0; i < quantity; ++i) {
      const blob = new Blob([content], {type: 'text/plain'});
      const request = store.add(blob);
      request.onerror = () => {
        handleError(request.error!, this.name);
      };
    }
    benchmarkCreateObj.end();
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        benchmarkAddToIdb.end();
        resolve();
      };
      transaction.onerror = () => {
        benchmarkAddToIdb.end();
        handleError(transaction.error!, this.name, reject);
      };
      transaction.onabort = () => {
        benchmarkAddToIdb.end();
        handleError(transaction.error!, this.name, reject);
      };
    });
  }
}
