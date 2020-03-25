export class Benchmark {
  private startInMs = 0;
  private endInMs = 0;

  constructor(private readonly name: string) {
    this.start();
  }

  start() {
    this.log(`${this.name} start`);
    this.startInMs = performance.now();
  }

  end() {
    this.log(`${this.name} end`);
    this.endInMs = performance.now();
    this.logTime();
  }

  logTime() {
    const durationInSec = (this.endInMs - this.startInMs) / 1000;
    this.log(`${this.name} took ${durationInSec.toFixed(2)}s`);
  }

  log(msg: string) {
    console.log(`[Benchmark] ${msg}`);
  }
}
