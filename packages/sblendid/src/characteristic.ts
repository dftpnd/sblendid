import { EventEmitter } from "events";
import Adapter, { Params } from "@sblendid/adapter-node";
import Service from "./service";

export interface Converter<T> {
  uuid: BluetoothCharacteristicUUID;
  decode: (value: Buffer) => Promise<T> | T;
  encode?: (value: T) => Promise<Buffer> | Buffer;
  values?: T | T[];
}

export interface Properties {
  readonly read?: boolean;
  readonly write?: boolean;
  readonly notify?: boolean;
}

type Listener<T> = (value: T) => Promise<void> | void;

export default class Characteristic<T = Buffer> {
  public readonly uuid: BluetoothCharacteristicUUID;
  public readonly service: Service;
  public readonly properties: Properties;
  private readonly adapter: Adapter;
  private readonly eventEmitter = new EventEmitter();
  private readonly converter?: Converter<T>;
  private isNotifying = false;

  constructor(
    service: Service,
    uuid: BluetoothCharacteristicUUID,
    converter?: Converter<T>,
    properties: Properties = {}
  ) {
    this.uuid = uuid;
    this.service = service;
    this.adapter = service.adapter;
    this.converter = converter;
    this.properties = properties;
  }

  public async read(): Promise<T> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    const buffer = await this.adapter.read(pUuid, sUuid, uuid);
    return await this.decode(buffer);
  }

  public async write(value: T, withoutResponse?: boolean): Promise<void> {
    const [pUuid, sUuid, uuid] = this.getUuids();
    const buffer = await this.encode(value);
    await this.adapter.write(pUuid, sUuid, uuid, buffer, withoutResponse);
  }

  public async on(event: "notify", listener: Listener<T>): Promise<void> {
    this.eventEmitter.on(event, listener);
    if (!this.isNotifying) await this.startNotifing();
  }

  public async off(event: "notify", listener: Listener<T>): Promise<void> {
    if (this.eventEmitter.listenerCount("notify") <= 1)
      await this.stopNotifing();
    this.eventEmitter.off(event, listener);
  }

  private async decode(buffer: Buffer): Promise<T> {
    if (!this.converter || !this.converter.decode) return buffer as any;
    return await this.converter.decode(buffer);
  }

  private async encode(value: T): Promise<Buffer> {
    if (!this.converter || !this.converter.encode) return value as any;
    return await this.converter.encode(value);
  }

  private async startNotifing(): Promise<void> {
    if (this.isNotifying) return;
    const [pUuid, sUuid, uuid] = this.getUuids();
    this.adapter.on("read", this.onNotify.bind(this));
    this.isNotifying = await this.adapter.notify(pUuid, sUuid, uuid, true);
  }

  private async stopNotifing(): Promise<void> {
    if (!this.isNotifying) return;
    const [pUuid, sUuid, uuid] = this.getUuids();
    this.adapter.off("read", this.onNotify.bind(this));
    this.isNotifying = await this.adapter.notify(pUuid, sUuid, uuid, false);
  }

  private async onNotify(...params: Params<"read">): Promise<void> {
    const [pUuid, sUuid, cUuid, data, isNfy] = params;
    if (!isNfy || !this.isThis(pUuid, sUuid, cUuid)) return;
    this.eventEmitter.emit("notify", await this.decode(data));
  }

  private isThis(
    pUuid: string,
    sUuid: BluetoothServiceUUID,
    cUuid: BluetoothCharacteristicUUID
  ): boolean {
    return this.getUuids().every((v, i) => v === [pUuid, sUuid, cUuid][i]);
  }

  private getUuids(): [
    string,
    BluetoothServiceUUID,
    BluetoothCharacteristicUUID
  ] {
    return [this.service.peripheral.uuid, this.service.uuid, this.uuid];
  }
}
