import {log} from 'services/logger';

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
      log('Auto fill stopped', this.name);
    }
    this.fillUntilFull(sizeInKb);
  }

  startAutoFill(sizeInKb: number) {
    if (this.autoFillStarted) {
      // auto filler already started.
      return;
    }
    this.autoFillStarted = true;
    this.fillUntilFull(sizeInKb);
  }

  stopAutoFill() {
    this.autoFillStarted = false;
  }
}
