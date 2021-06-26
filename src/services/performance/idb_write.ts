import {handleError} from 'services/error';
import {CustomIdbDatabase} from 'services/idb';
import {fakeGithubResponse, generateString} from 'services/mock_data';
import {PerformanceTestCase} from 'services/performance/performance';

const CONTEXT = 'idb_write';

function benchmarkWriteMultiTx(iteration: number, blob: string|object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      let completedTx = 0;
      for (let i = 0; i < iteration; ++i) {
        const transaction = db.transaction('entries', 'readwrite');
        const store = transaction.objectStore('entries');
        store.add({key: `doc_${i}`, blob});
        transaction.onerror = () => {
          handleError(transaction.error!, CONTEXT, reject);
        };
        // We intentionally modify completedTx outside of the loop.
        // eslint-disable-next-line
        transaction.oncomplete = () => {
          completedTx++;
          if (completedTx >= iteration) {
            const end = performance.now();
            db.close();
            const deletionRequest =
                indexedDB.deleteDatabase('idb-playground-benchmark');
            deletionRequest.onerror = () => {
              handleError(deletionRequest.error!, CONTEXT, reject);
            };
            deletionRequest.onsuccess = () => {
              resolve(end - start);
            };
          }
        };
      }
    };
  });
}

function benchmarkWrite(iteration: number, blob: string|object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      for (let i = 0; i < iteration; ++i) {
        store.add({key: `doc_${i}`, blob});
      }
      transaction.onerror = () => {
        handleError(transaction.error!, CONTEXT, reject);
      };
      transaction.oncomplete = () => {
        const end = performance.now();
        db.close();
        const deletionRequest =
            indexedDB.deleteDatabase('idb-playground-benchmark');
        deletionRequest.onerror = () => {
          handleError(deletionRequest.error!, CONTEXT, reject);
        };
        deletionRequest.onsuccess = () => {
          resolve(end - start);
        };
      };
    };
  });
}

function benchmarkWriteWithContention(contentionCount: number) {
  return new Promise<number>((resolve, reject) => {
    let completed = 0;
    let end = 0;
    let start = 0;
    const blob1M = generateString(1024);
    const blob10K = generateString(10);

    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = () => {
      const request2 = indexedDB.open('idb-playground-benchmark-2', 1);
      request2.onerror = () => {
        handleError(request2.error!, CONTEXT, reject);
      };
      request2.onupgradeneeded = () => {
        const db = request2.result;
        db.createObjectStore('entries', {
          keyPath: 'key',
        });
      };
      request2.onsuccess = () => {
        start = performance.now();
        {
          const db = request2.result;
          const transaction = db.transaction('entries', 'readwrite');
          const store = transaction.objectStore('entries');
          for (let i = 0; i < contentionCount; ++i) {
            store.put({key: `doc_0`, blob10K});
          }
          transaction.onerror = () => {
            handleError(transaction.error!, CONTEXT, reject);
          };
          transaction.oncomplete = () => {
            db.close();
            const deletionRequest =
                indexedDB.deleteDatabase('idb-playground-benchmark-2');
            deletionRequest.onerror = () => {
              handleError(deletionRequest.error!, CONTEXT, reject);
            };
            deletionRequest.onsuccess = () => {
              completed++;
              if (completed === 2) {
                resolve(end - start);
              }
            };
          };
        }
        {
          const db = request.result;
          const transaction = db.transaction('entries', 'readwrite');
          const store = transaction.objectStore('entries');
          for (let i = 0; i < 100; ++i) {
            store.add({key: `doc_${i}`, blob1M});
          }
          transaction.onerror = () => {
            handleError(transaction.error!, CONTEXT, reject);
          };
          transaction.oncomplete = () => {
            end = performance.now();
            db.close();
            const deletionRequest =
                indexedDB.deleteDatabase('idb-playground-benchmark');
            deletionRequest.onerror = () => {
              handleError(deletionRequest.error!, CONTEXT, reject);
            };
            deletionRequest.onsuccess = () => {
              completed++;
              if (completed === 2) {
                resolve(end - start);
              }
            };
          };
        }
      };
    };
  });
}

function benchmarkSeriallyWrite(iteration: number, blob: string|object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = () => {
      const db = request.result;
      const start = performance.now();
      const transaction = db.transaction('entries', 'readwrite');
      const store = transaction.objectStore('entries');
      const queue: any[] = [];
      for (let i = 0; i < iteration; ++i) {
        queue.push({key: `doc_${i}`, blob});
      }
      transaction.onerror = () => {
        handleError(transaction.error!, CONTEXT, reject);
      };
      transaction.oncomplete = () => {
        const end = performance.now();
        db.close();
        const deletionRequest =
            indexedDB.deleteDatabase('idb-playground-benchmark');
        deletionRequest.onerror = () => {
          handleError(deletionRequest.error!, CONTEXT, reject);
        };
        deletionRequest.onsuccess = () => {
          resolve(end - start);
        };
      };
      const add = () => {
        if (queue.length > 0) {
          const data = queue.shift();
          const addRequest = store.add(data);
          addRequest.addEventListener('success', () => {
            add();
          });
        }
      };
      add();
    };
  });
}

function benchmarkLongTransactionWrite(iteration: number, blob: string|object) {
  return new Promise<number>((resolve, reject) => {
    const request = indexedDB.open('idb-playground-benchmark', 1);
    request.onerror = () => {
      handleError(request.error!, CONTEXT, reject);
    };
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('entries', {
        keyPath: 'key',
      });
    };

    request.onsuccess = async () => {
      const db = new CustomIdbDatabase(request.result);
      const start = performance.now();
      try {
        await db.withTransaction(['entries'], 'readwrite', async (tx) => {
          const store = tx.objectStore('entries');
          for (let i = 0; i < iteration; ++i) {
            await store.add({key: `doc_${i}`, blob});
          }
        });
      } catch (e) {
        handleError(e, CONTEXT, reject);
      }
      const end = performance.now();
      db.close();
      const deletionRequest =
          indexedDB.deleteDatabase('idb-playground-benchmark');
      deletionRequest.onerror = () => {
        handleError(deletionRequest.error!, CONTEXT, reject);
      };
      deletionRequest.onsuccess = () => {
        resolve(end - start);
      };
    };
  });
}

const baseCase = {
  // idb tests are really slow. Only run 100 iterations.
  iteration: 100,
};

const write1MBx100WithContention1000x10KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MBWithContention1000x10KB',
  label: 'idb write 100x1MB with contention (1000x10KB)',
  benchmark: () => benchmarkWriteWithContention(1000),
}

const write1MBx100WithContention100x10KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MBWithContention100x10KB',
  label: 'idb write 100x1MB with contention (100x10KB)',
  benchmark: () => benchmarkWriteWithContention(100),
}

const write1MB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MB',
  label: 'idb write 1MB',
  benchmark: () => benchmarkWrite(1, generateString(1024)),
};
const write1MBx100: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MBx100',
  label: 'idb write 100x1MB',
  benchmark: () => benchmarkWrite(100, generateString(1024)),
};
const write1MBx100MultiTx: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1MBx100MultiTx',
  label: 'idb write 100x1MB in multiple transactions',
  benchmark: () => benchmarkWriteMultiTx(100, generateString(1024)),
};

const write1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1KB',
  label: 'idb write 1KB',
  benchmark: () => benchmarkWrite(1, generateString(1)),
};

const writeJSON: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWriteJSON',
  label: 'idb write 10x70KB JSON',
  benchmark: () => benchmarkWrite(10, fakeGithubResponse),
};

const writeJSONSerially: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWriteJSONSerially',
  label: 'idb write 10x70KB JSON serially',
  benchmark: () => benchmarkSeriallyWrite(10, fakeGithubResponse),
};

const writeJSONWithLongTransaction: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWriteJSONSeriallyWithLongTransaction',
  label: 'idb write 10x70KB JSON serially with long transaction',
  benchmark: () => benchmarkLongTransactionWrite(10, fakeGithubResponse),
};

const write1024x100B: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite1024x100B',
  label: 'idb write 1024x100B',
  benchmark: () => benchmarkWrite(1024, generateString(100 / 1024)),
};

const write100x1KB: PerformanceTestCase = {
  ...baseCase,
  name: 'idbWrite100x1KB',
  label: 'idb write 100x1KB',
  benchmark: () => benchmarkWrite(100, generateString(1)),
};

export const idbWriteTestCases = [
  write1MBx100WithContention100x10KB,
  write1MBx100WithContention1000x10KB,
  write1MB,
  write1KB,
  write1024x100B,
  write100x1KB,
  writeJSON,
  writeJSONSerially,
  writeJSONWithLongTransaction,
  write1MBx100,
  write1MBx100MultiTx,
];
