import Bluez from "./bluez";
import ObjectManager from "./objectManager";
import type { FindCondition } from "@sblendid/types/adapter";
import type { PeripheralJSON } from "@sblendid/types/adapter";
import type { Adapter } from "./bluez";

export default class Scanner {
  private adapter?: Adapter;

  async startScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StartDiscovery();
  }

  async stopScanning(): Promise<void> {
    const adapter = await this.getAdapter();
    await adapter.StopDiscovery();
  }

  async find(findCondition: FindCondition): Promise<PeripheralJSON> {
    const watcher = this.getWatcher(findCondition);
    await this.startScanning();
    const peripheral = await watcher.resolved();
    await this.stopScanning();
    return peripheral;
  }

  private getWatcher(findCondition: FindCondition) {
    const condition = this.getDiscoverCondition(findCondition);
    return new Watcher(ObjectManager, "device1", condition);
  }

  private async getAdapter(): Promise<Adapter> {
    if (!this.adapter) this.adapter = await Bluez.getAdapter();
    return this.adapter;
  }
}