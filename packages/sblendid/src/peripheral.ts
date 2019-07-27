import { Advertisement, EventParameters } from "sblendid-bindings-macos";
import Adapter from "./adapter";
import Service from "./service";

export default class Peripheral {
  public adapter: Adapter;
  public uuid: string;
  public name?: string;
  public address?: string;
  public addressType?: string;
  public connectable?: boolean;
  public advertisement: Advertisement = {};
  public state: PeripheralState = "disconnected";
  private serviceUuids?: SUUID[];

  public static fromDiscover(
    adapter: Adapter,
    params: EventParameters<"discover">
  ): Peripheral {
    const peripheral = new Peripheral(adapter, params[0]);
    peripheral.address = params[1];
    peripheral.addressType = params[2];
    peripheral.connectable = params[3];
    peripheral.advertisement = params[4] || {};
    peripheral.name = peripheral.advertisement.localName;
    return peripheral;
  }

  constructor(adapter: Adapter, uuid: string) {
    this.adapter = adapter;
    this.uuid = uuid;
  }

  public async connect(): Promise<void> {
    this.state = "connecting";
    await this.dispatchConnect();
    this.state = "connected";
  }

  public async disconnect(): Promise<void> {
    this.state = "disconnecting";
    await this.dispatchDisconnect();
    this.state = "disconnected";
  }

  public async getService(
    uuid: SUUID,
    converters: Converter<any>[]
  ): Promise<Service> {
    return new Service(this, uuid, converters);
  }

  public async getServices(
    converterMap: ConverterMap<any> = {}
  ): Promise<Service[]> {
    if (this.state === "disconnected") await this.connect();
    if (!this.serviceUuids) this.serviceUuids = await this.fetchServices();
    return this.serviceUuids.map(
      uuid => new Service(this, uuid, converterMap[uuid])
    );
  }

  public async hasService(uuid: SUUID): Promise<boolean> {
    const services = await this.getServices();
    return services.some(s => s.uuid === uuid);
  }

  public async getRssi(): Promise<number> {
    if (this.state === "disconnected") await this.connect();
    return await this.fetchRssi();
  }

  private async fetchServices(): Promise<SUUID[]> {
    return await this.adapter.run<"servicesDiscover", SUUID[]>(
      () => this.adapter.discoverServices(this.uuid, []),
      () => this.adapter.when("servicesDiscover", uuid => uuid === this.uuid),
      ([, serviceUuids]) => serviceUuids
    );
  }

  private async fetchRssi(): Promise<number> {
    return await this.adapter.run<"rssiUpdate", number>(
      () => this.adapter.updateRssi(this.uuid),
      () => this.adapter.when("rssiUpdate", uuid => uuid === this.uuid),
      ([, rssi]) => rssi
    );
  }

  private async dispatchConnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.connect(this.uuid),
      () => this.adapter.when("connect", uuid => uuid === this.uuid)
    );
  }

  private async dispatchDisconnect(): Promise<void> {
    await this.adapter.run(
      () => this.adapter.disconnect(this.uuid),
      () => this.adapter.when("disconnect", uuid => uuid === this.uuid)
    );
  }
}
