import {generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance';

export const localStorageReadTestCase: PerformanceTestCase = {
  name: 'localStorageRead',
  label: 'localStorage read',
  description: '',
  benchmark: () => {
    localStorage.clear();
    const data = Array.from({length: 100}, () => generateString(5));
    const start = performance.now();
    for (let i = 0; i < data.length; ++i) {
      localStorage.setItem(`doc_${i}`, data[i]);
    }
    const end = performance.now();
    localStorage.clear();
    return Promise.resolve(end - start);
  },
};
