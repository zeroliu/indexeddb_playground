import {logError} from 'services/logger';
import {Benchmark} from 'services/benchmark';
import {v4 as uuid} from 'uuid';
import {BaseAbuser} from './base_abuser';
import {generateString} from 'services/mock_data';

export class LocalStorageAbuser extends BaseAbuser {
  constructor() {
    super('localStorage');
  }

  init(): Promise<void> {
    // LocalStorage does not need to initialize.
    return Promise.resolve();
  }

  estimate(): Promise<StorageEstimate> {
    return Promise.resolve({
      usage: new Blob([
        ...Object.values(localStorage),
        ...Object.keys(localStorage),
      ]).size,
    });
  }

  clear(): Promise<void> {
    localStorage.clear();
    return Promise.resolve();
  }

  fill(sizeInKb: number, quantity: number): Promise<void> {
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
        `Adding ${quantity} x ${sizeInKb}kb entries to localStorage`
      );
      for (let i = 0; i < quantity; ++i) {
        localStorage.setItem(uuid(), content);
      }
      benchmarkAdd.end();
      return Promise.resolve();
    } catch (e) {
      logError(e.message, 'localStorage');
      return Promise.reject();
    }
  }
}

export function fillAbuser(sizeInKb: number, quantity: number) {
  if (quantity <= 0) {
    logError('Please provide a positive number for quantity.', 'localStorage');
    return;
  }
  try {
    const content = new Array((sizeInKb * 1024) / 4 + 1).join('abcd');
    const benchmarkAdd = new Benchmark(
      `Adding ${quantity} x ${sizeInKb}kb entries to localStorage`
    );
    for (let i = 0; i < quantity; ++i) {
      localStorage.setItem(uuid(), content);
    }
    benchmarkAdd.end();
  } catch (e) {
    logError(e.message, 'localStorage');
  }
}

export function clearAbuser() {
  const benchmark = new Benchmark('Clearing localStorage');
  localStorage.clear();
  benchmark.end();
}

export function startAutoFiller() {}
export function stopAutoFiller() {}
