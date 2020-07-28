interface WorkQueueItem {
  resolve: (val: any) => void;
  reject: (e: DOMException|null) => void;
  request: () => IDBRequest;
}

export class CustomIdbDatabase {
  constructor(private readonly wrapped: IDBDatabase) {}

  withTransaction(
      stores: string[], mode: 'readonly'|'readwrite',
      callback: (tx: CustomIdbTransaction) => Promise<void>) {
    const tx = new CustomIdbTransaction(
        this.wrapped.transaction(stores, mode), callback);
    return tx.commit();
  };

  close() {
    this.wrapped.close();
  }
}

class CustomIdbTransaction {
  private resolved = false;
  private workQueue: WorkQueueItem[] = [];
  private debugCount = 0;

  constructor(
      private readonly wrapped: IDBTransaction,
      private readonly callback: (tx: CustomIdbTransaction) => Promise<void>) {}

  commit() {
    return new Promise((resolve, reject) => {
      let currentTask: WorkQueueItem|undefined;
      let request: IDBRequest;
      const keepAlive = () => {
        if (this.resolved) {
          return;
        }
        if (this.workQueue.length > 0) {
          currentTask = this.workQueue.shift()!;
          request = currentTask.request();
        } else {
          this.debugCount++;
          request = this.wrapped.objectStore(this.wrapped.objectStoreNames[0])
                        .get(-Infinity);
        }
        request.onsuccess = () => {
          if (currentTask) {
            currentTask.resolve(request.result);
            currentTask = undefined;
          }
          keepAlive();
        };
        request.onerror = () => {
          if (currentTask) {
            currentTask.reject(request.error);
            currentTask = undefined;
          }
          keepAlive();
        }
      };
      keepAlive();
      this.callback(this)
          .then(() => {
            this.resolved = true;
            console.log(`Internal get() count: ${this.debugCount}`);
            this.wrapped.oncomplete = () => {
              resolve();
            };
            this.wrapped.onerror = (err) => {
              reject(err);
            }
          })
          .catch(err => {
            this.resolved = true;
            reject(err);
          });
    });
  }

  objectStore(name: string) {
    return new CustomIdbObjectStore(this.wrapped.objectStore(name), this);
  }

  addTask(task: WorkQueueItem) {
    this.workQueue.push(task);
  }
}

class CustomIdbObjectStore {
  constructor(
      private readonly wrapped: IDBObjectStore,
      private readonly tx: CustomIdbTransaction) {}
  add(value: any, key?: string) {
    return new Promise((resolve, reject) => {
      this.tx.addTask({
        resolve,
        reject,
        request: () => {
          return this.wrapped.add(value, key);
        }
      });
    });
  }
}
