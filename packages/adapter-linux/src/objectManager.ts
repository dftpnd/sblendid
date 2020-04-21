import { EventEmitter } from "events";
import Bluez from "./bluez";

import type { Adapter1Events } from "dbus";

export default class ObjectManager {
  private emitter = new EventEmitter();
  private eventsAreSetUp = false;
  private devices: Record<string, BluezDevice> = {};
  private services: Record<string, BluezService> = {};
  private characteristics: Record<string, BluezCharacteristic> = {};
  private interface?: ObjectManagerInterface;

  async on<K extends keyof Adapter1Events>(
    event: K,
    listener: (value: Adapter1Events[K]) => void
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.on(event, listener);
    this.emitManagedObjects();
  }

  async off<K extends keyof Adapter1Events>(
    event: K,
    listener: (value: Adapter1Events[K]) => void
  ): Promise<void> {
    await this.setupEvents();
    this.emitter.off(event, listener);
  }

  private onInterfacesAdded(path: string, interfaces: BluezInterfaces): void {
    const { device, service, characteristic } = this.getInterfaces(interfaces);
    if (device) this.handleDevice(path, device);
    if (service) this.handleService(path, service);
    if (characteristic) this.handleCharacteristic(path, characteristic);
  }

  private handleDevice(path: string, device1: BluezDevice): void {
    this.devices[path] = device1;
    this.emitter.emit("device1", device1);
  }

  private handleService(path: string, gattService1: BluezService): void {
    this.services[path] = gattService1;
    this.emitter.emit("gattService1", gattService1);
  }

  private handleCharacteristic(
    path: string,
    gattCharacteristic1: BluezCharacteristic
  ): void {
    this.characteristics[path] = gattCharacteristic1;
    this.emitter.emit("gattCharacteristic1", gattCharacteristic1);
  }

  private async setupEvents(): Promise<void> {
    if (this.eventsAreSetUp) return;
    this.eventsAreSetUp = true;
    const iface = await this.getInterface();
    iface.on("InterfacesAdded", this.onInterfacesAdded.bind(this));
  }

  private getInterfaces(interfaces: BluezInterfaces) {
    const device = interfaces["org.bluez.Device1"];
    const service = interfaces["org.bluez.GattService1"];
    const characteristic = interfaces["org.bluez.GattCharacteristic1"];
    return { device, service, characteristic };
  }

  private async emitManagedObjects(): Promise<void> {
    const managedObjects = await this.getManagedObjects();
    const entries = Object.entries(managedObjects);
    for (const [path, interfaces] of entries) {
      this.onInterfacesAdded(path, interfaces);
    }
  }

  private async getManagedObjects(): Promise<ManagedObjects> {
    const iface = await this.getInterface();
    return await iface.GetManagedObjects();
  }

  private async getInterface(): Promise<ObjectManagerInterface> {
    if (!this.interface) this.interface = await Bluez.getObjectManager();
    return this.interface;
  }
}