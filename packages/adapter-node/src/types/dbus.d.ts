declare module "dbus" {
  export type busType = "session" | "system";

  export function getBus(type: busType): DBusConnection;

  export interface DBusConnection {
    getInterface(
      serviceName: string,
      objectPath: string,
      interfaceName: string,
      callback: (err: Error, iface: DBusInterface) => void
    ): void;
    disconnect(): void;
  }

  type Props = Record<string, any>;
  type Methods = Record<string, (...args: any[]) => Promise<any>>;
  type Events = Record<string, any[]>;

  type EventMethod<E extends Events> = <K extends keyof E>(
    event: K,
    listener: (...args: E[K]) => Promish<void>
  ) => void;

  export type DBusInterface<
    P extends Props = {},
    M extends Methods = {},
    E extends Events = {}
  > = {
    getProperty<K extends keyof P>(
      name: K,
      callback: (err: Error, name: P[K]) => void
    ): void;
    setProperty<K extends keyof P>(
      name: K,
      value: P[K],
      callback: (err: Error) => void
    ): void;
    getProperties(callback: (err: Error, properties: P) => void): void;
    object: {
      method: Record<keyof M, unknown>;
    };
    on: EventMethod<E>;
    off: EventMethod<E>;
  } & M;
}
