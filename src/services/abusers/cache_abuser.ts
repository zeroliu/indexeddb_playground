import {logError} from 'services/logger';
import {Benchmark} from 'services/benchmark';
import {BaseAbuser} from './base_abuser';
import {generateString} from 'services/mock_data';
import {v4 as uuid} from 'uuid';

const CACHE_ABUSER_KEY = 'cache-abuser';

export class CacheAbuser extends BaseAbuser {
  constructor() {
    super('cacheAPI');
  }

  init(): Promise<void> {
    if (!('caches' in window)) {
      logError('Cache is not supported', 'cacheAbuser');
    }
    // CacheAPI does not need to initialize.
    return Promise.resolve();
  }

  estimate(): Promise<StorageEstimate> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate();
    }
    return Promise.resolve({});
  }

  async clear(): Promise<void> {
    await caches.delete(CACHE_ABUSER_KEY);
    return Promise.resolve();
  }

  async fill(sizeInKb: number, quantity: number): Promise<void> {
    if (quantity <= 0) {
      logError(
        'Please provide a positive number for quantity.',
        'localStorage'
      );
      return Promise.reject();
    }
    try {
      const content = generateString(sizeInKb);
      const benchmarkAdd = new Benchmark(
        `Adding ${quantity} x ${sizeInKb}kb entries to cache.`
      );
      const cache = await caches.open(CACHE_ABUSER_KEY);
      for (let i = 0; i < quantity; ++i) {
        await cache.put(`${uuid()}`, new Response(content));
      }
      benchmarkAdd.end();
      return Promise.resolve();
    } catch (e) {
      logError(e.message, 'cacheAbuser');
      return Promise.reject();
    }
  }
}
