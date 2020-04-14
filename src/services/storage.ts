import {handleError} from './error';

export type EstimateFunc = () => Promise<EstimateResult | null>;
export interface EstimateResult {
  name: string;
  estimate: StorageEstimate;
}

const estimateIdbStorage: EstimateFunc = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return {
      name: 'idb/cache',
      estimate: await navigator.storage.estimate(),
    };
  }
  return null;
};

interface KaiOSDeviceStorage {
  freeSpace: () => any;
}
interface KaiOSNavigator extends Navigator {
  getDeviceStorage: (type: string) => KaiOSDeviceStorage;
}

const estimateKaiosStorage: EstimateFunc = async () => {
  if (!('getDeviceStorage' in navigator)) {
    return null;
  }
  const kaiOSNavigator = navigator as KaiOSNavigator;
  const storage = kaiOSNavigator.getDeviceStorage('apps');
  if (!storage) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const request = storage.freeSpace();
    request.onsuccess = () => {
      resolve({name: 'kaios', estimate: {quota: request.result}});
    };
    request.onerror = () => {
      handleError(request.error, 'kaiosStorage', reject);
    };
  });
};

const estimateLocalStorage: EstimateFunc = async () => {
  return Promise.resolve({
    name: 'localStorage',
    estimate: {
      usage: new Blob([
        ...Object.values(localStorage),
        ...Object.keys(localStorage),
      ]).size,
    },
  });
};

export const estimateFuncs = [
  estimateIdbStorage,
  estimateKaiosStorage,
  estimateLocalStorage,
];
