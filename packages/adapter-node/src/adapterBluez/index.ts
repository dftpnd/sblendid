import BluezAdapter from "./adapter";
import ObjectManager from "./objectManager";
import Events from "./events";
import { Event, Listener } from "../types/noble";

export class Bluez {
  private adapter = new BluezAdapter();
  private events = new Events();

  public async init(): Promise<void> {}

  public async startScanning(): Promise<void> {
    await this.adapter.startDiscovery();
  }

  public async stopScanning(): Promise<void> {
    await this.adapter.stopDiscovery();
  }

  public async on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    this.events.on(event, listener as any); // todo unlawful any
  }

  public async off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    this.events.off(event, listener as any); // todo unlawful any
  }
}