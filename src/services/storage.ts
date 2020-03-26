export async function queryStorage(): Promise<globalThis.StorageEstimate> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    return await navigator.storage.estimate();
  }
  return Promise.resolve({});
}
