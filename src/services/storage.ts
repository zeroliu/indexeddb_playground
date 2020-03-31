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
