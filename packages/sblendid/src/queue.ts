export type PromiseFn = () => Promise<any> | any;
type Resolver = (value?: unknown) => void;
type Rejector = (reason?: any) => void;

export default class Queue {
  private items: PromiseFn[];
  private finalFn: PromiseFn;
  private working: boolean;

  constructor(finalFn: PromiseFn = () => {}) {
    this.finalFn = finalFn;
    this.items = [];
    this.working = false;
  }

  // todo is the return value properly typed?
  public async add(item: PromiseFn): Promise<ReturnType<PromiseFn>> {
    return new Promise((resolve, reject) => {
      this.items.push(this.getItem(item, resolve, reject));
      this.work();
    });
  }

  public async end(): Promise<any> {
    this.items = [];
    return await this.finalFn();
  }

  private async work(): Promise<void> {
    if (this.working) return;
    this.working = true;
    while (this.items.length) {
      await this.items.shift()!();
    }
    this.working = false;
  }

  private getItem(item: PromiseFn, resolve: Resolver, reject: Rejector) {
    return () =>
      item()
        .then(resolve)
        .catch(reject);
  }
}
