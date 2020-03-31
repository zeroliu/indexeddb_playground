import {logError} from './logger';
import {Benchmark} from './benchmark';
import {v4 as uuid} from 'uuid';

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
