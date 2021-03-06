/// <reference path="./types/global.d.ts" />
import Bindings from "./bindings";
import Adapter from "./adapter";
import Scanner, { FindCondition } from "./scanner";
import Peripheral from "./peripheral";
import Service from "./service";
import Characteristic, { CharacteristicData } from "./characteristic";
import { Event, Params, Listener } from "./types/bindings";

export { Event, Params, Listener } from "./types/bindings";
export { FindCondition } from "./scanner";
export { AddressType, Advertisement } from "./peripheral";
export { CharacteristicData } from "./characteristic";

export default class SblendidNodeAdapter {
  private bindings = Bindings.getInstance();
  private scanner = new Scanner();
  private peripheral = new Peripheral();
  private service = new Service();
  private characteristic = new Characteristic();

  public static powerOn(): Promise<void> {
    return Adapter.powerOn();
  }

  public static powerOff(): Promise<void> {
    return Adapter.powerOff();
  }

  public startScanning(): void {
    return this.bindings.startScanning();
  }

  public stopScanning(): void {
    return this.bindings.stopScanning();
  }

  public find(condition: FindCondition): Promise<Params<"discover">> {
    return this.scanner.find(condition);
  }

  public connect(pUUID: PUUID): Promise<void> {
    return this.peripheral.connect(pUUID);
  }

  public disconnect(pUUID: PUUID): Promise<void> {
    return this.peripheral.disconnect(pUUID);
  }

  public getServices(pUUID: PUUID): Promise<SUUID[]> {
    return this.peripheral.getServices(pUUID);
  }

  public getRssi(pUUID: PUUID): Promise<number> {
    return this.peripheral.getRssi(pUUID);
  }

  public on<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.on(event, listener);
  }

  public off<E extends Event>(event: E, listener: Listener<E>): void {
    this.bindings.off(event, listener);
  }

  public getCharacteristics(
    pUUID: PUUID,
    sUUID: SUUID
  ): Promise<CharacteristicData[]> {
    return this.service.getCharacteristics(pUUID, sUUID);
  }

  public read(pUUID: PUUID, sUUID: SUUID, cUUID: CUUID): Promise<Buffer> {
    return this.characteristic.read(pUUID, sUUID, cUUID);
  }

  public write(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    value: Buffer,
    withoutResponse = false
  ): Promise<void> {
    return this.characteristic.write(
      pUUID,
      sUUID,
      cUUID,
      value,
      withoutResponse
    );
  }

  public notify(
    pUUID: PUUID,
    sUUID: SUUID,
    cUUID: CUUID,
    notify: boolean
  ): Promise<boolean> {
    return this.characteristic.notify(pUUID, sUUID, cUUID, notify);
  }
}
