import {log} from './logger';

interface KaiOSDeviceStorage {
  freeSpace: () => any;
}
interface KaiOSNavigator extends Navigator {
  getDeviceStorage: (type: string) => KaiOSDeviceStorage;
}

export async function queryStorage(): Promise<StorageEstimate> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return await navigator.storage.estimate();
  }

  if ('getDeviceStorage' in navigator) {
    const kaiOSNavigator = navigator as KaiOSNavigator;
    const storage = kaiOSNavigator.getDeviceStorage('videos');
    if (storage) {
      return new Promise((resolve, reject) => {
        const request = storage.freeSpace();
        request.onsuccess = function() {
          resolve({quota: this.result});
        };
        request.onerror = function() {
          reject(this.error);
        };
      });
    }
  }

  return Promise.resolve({});
}

export abstract class BaseAbuser {
  autoFillStarted = false;

  constructor(readonly name: string) {}

  abstract estimate(): Promise<StorageEstimate>;
  abstract init(): Promise<void>;
  abstract clear(): Promise<void>;
  abstract fill(sizeInKb: number, quantity: number): Promise<void>;

  async fillUntilFull(sizeInKb: number) {
    if (!this.autoFillStarted) {
      return;
    }
    try {
      await this.fill(sizeInKb, 1);
    } catch (e) {
      this.autoFillStarted = false;
      log('Auto fill completed', this.name);
    }
    this.fillUntilFull(sizeInKb);
  }

  startAutoFill(sizeInKb: number) {
    this.autoFillStarted = true;
    this.fillUntilFull(sizeInKb);
  }

  stopAutoFill() {
    this.autoFillStarted = false;
  }
}
