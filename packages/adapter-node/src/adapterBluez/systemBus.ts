import { promisify } from "util";
import DBus, { DBusInterface } from "dbus";

export interface InterfaceParams {
  service: string;
  path: string;
  name: string;
}

interface DBusInterfaceObject {
  object: {
    method: Record<string, any>;
  };
}

type FixedDBusInterface = DBusInterface & DBusInterfaceObject;
type PromiseFn = (...args: any[]) => Promise<any>;
type MethodTuple = [string, PromiseFn];

type FetchInterface = (
  service: string,
  path: string,
  name: string
) => Promise<FixedDBusInterface>;

interface X {
  methods?: Record<string, PromiseFn>;
  events?: Record<string, any>;
}

export default class SystemBus {
  private static bus = DBus.getBus("system");
  private fetchInterface: FetchInterface;

  constructor() {
    const getInterface = SystemBus.bus.getInterface.bind(SystemBus.bus);
    this.fetchInterface = promisify(getInterface) as FetchInterface;
  }

  public async getInterface<I extends X>(
    params: InterfaceParams
  ): Promise<I["methods"]> {
    const { service, path, name } = params;
    const iface = await this.fetchInterface(service, path, name);
    const methods = this.getMethods(iface);
    return methods.reduce<I["methods"]>(
      (api, [n, m]) => ({ ...api, [n]: m }),
      {} as I["methods"]
    );
  }

  private getMethods(iface: FixedDBusInterface): MethodTuple[] {
    const methodNames = Object.keys(iface.object.method);
    return methodNames.map(n => [n, promisify(iface.n.bind(iface))]);
  }
}
