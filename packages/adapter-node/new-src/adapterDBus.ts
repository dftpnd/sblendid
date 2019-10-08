import { EventEmitter } from "events";
import { promisify } from "util";
import DBus from "dbus";
import Adapter, { FindCondition, Characteristic } from "./adapter";
import { Event, Params, Listener } from "./types/nobleAdapter";
import { NotInitializedError } from "./errors";

const bus = DBus.getBus("system");
const getInterface = promisify(bus.getInterface.bind(bus));

export interface BlueZAdapter {
  StartDiscovery: (callback: (error: Error) => void) => void;
  StopDiscovery: (callback: (error: Error) => void) => void;
}
export interface ObjectManager {}

export default class DBusAdapter extends Adapter {
  private startDiscovery?: () => Promise<void>;
  private stopDiscovery?: () => Promise<void>;
  private events = new EventEmitter();

  public async init(): Promise<void> {
    const bluez = await this.getAdapter();
    const objectManager = await this.getObjectManager();
    this.startDiscovery = promisify(bluez.StartDiscovery.bind(bluez));
    this.stopDiscovery = promisify(bluez.StopDiscovery.bind(bluez));
    objectManager.on("InterfacesAdded", (path: any, interfaces: any) => {
      if ("org.bluez.Device1" in interfaces) {
        this.events.emit("discover", interfaces["org.bluez.Device1"]);
      }
    });
  }

  public async startScanning(): Promise<void> {
    if (!this.startDiscovery) throw new NotInitializedError("startScanning");
    await this.startDiscovery();
  }

  public async stopScanning(): Promise<void> {
    if (!this.stopDiscovery) throw new NotInitializedError("stopScanning");
    await this.stopDiscovery();
  }

  public async find(condition: FindCondition): Promise<Params<"discover">> {
    throw new Error("Not implemented yet (find)");
  }

  public async connect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet (connect)");
  }

  public async disconnect(pUUID: PUUID): Promise<void> {
    throw new Error("Not implemented yet (disconnect)");
  }

  public async getRssi(pUUID: PUUID): Promise<number> {
    throw new Error("Not implemented yet (getRssi)");
  }

  public async getServices(pUUID: PUUID): Promise<SUUID[]> {
    throw new Error("Not implemented yet (getServices)");
  }

  public async getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<Characteristic[]> {
    throw new Error("Not implemented yet (getCharacteristics)");
  }

  public async read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    throw new Error("Not implemented yet (read)");
  }

  public async write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse: boolean
  ): Promise<void> {
    throw new Error("Not implemented yet (write)");
  }

  public async notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    throw new Error("Not implemented yet (notify)");
  }

  public async on<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    if (!this.events) throw new NotInitializedError("on");
    this.events.on(event, listener);
  }

  public async off<E extends Event>(
    event: E,
    listener: Listener<E>
  ): Promise<void> {
    if (!this.events) throw new NotInitializedError("off");
    this.events.off(event, listener);
  }

  private async getAdapter(): Promise<BlueZAdapter> {
    return (await getInterface(
      "org.bluez",
      "/org/bluez/hci0",
      "org.bluez.Adapter1"
    )) as any;
  }

  private async getObjectManager(): Promise<DBus.DBusInterface> {
    return await getInterface(
      "org.bluez",
      "/",
      "org.freedesktop.DBus.ObjectManager"
    );
  }
}
