# S*ble*ndid

&nbsp;🦋 Lightweight, no Dependencies<br>
&nbsp;💍 Promise-Based API<br>
&nbsp;🥳 100％ TypeScript and Native Code (C++ / Objective C)<br>
&nbsp;💯 100% Test Coverage<br>

## Basic Bluetooth knowledge

## Usage

Install `@sblendid/sblendid` and `@sblendid/adapter-node` with npm or yarn

```bash
npm install @sblendid/sblendid @sblendid/adapter-node
```

In the future, Sblendid should support multiple platforms including React Native and WebBluetooth.
Hence, there is a separate package for for using Sblendid with Node so you can swap adapters for
using it on another platform.

## API

Sblendid has 4 main classes

| Class            | Desciption                                                                                                                                                                                                                                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sblendid`       | Lets you find and connect to peripherals                                                                                                                                                                                                                                                                               |
| `Peripheral`     | Lets you connect to peripherals and read its services and RSSI                                                                                                                                                                                                                                                         |
| `Service`        | Lets you read, write and subscribe to updates on values (characteristics) of a service as well as                                                                                                                                                                                                                      | fetching all available characteristics |
| `Characteristic` | A representation of a single characteristic of a service that lets you read, write and subscribe to updates of a specific value. Usually you will not need to use this class as everything you can do with this on a single characteristic, you can already do with the service class on all available characteristics |

### `Sblendid`

#### `static async powerOn(): Promise<Sblendid>`

Before you can use BLE on your machine you need to turn on
your BLE adapter. This static method will turn on the adapter
and return an instance of sblendid that you can then use to
find and connect to peripherals

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = await Sblendid.powerOn();
sblendid.startScanning();
```

#### `static async connect(condition: Condition): Promise<Peripheral>`

Often times you have a specific peripheral in mind you want to
connect to. You would usually

1. turn on your BLE adapter
1. start scanning
1. check each peripheral if it is what you are looking for
1. stop scanning
1. connect to the peripheral

There is a shortcut for that. You can call `Sblendid.connect` to do all that.
Pass either a peripheral name, uuid, address or callback function as an argument
and you will get a connected peripheral as return value once the peripheral has
been found.

The callback function will receive an instance of a `Peripheral` that represents any
peripheral found while scanning. The callback function can be sync or async
(i.e. return a Promise) and must always return aór resolve to a Boolean signaling
of the given peripheral is the one you were looking for. If true, `Sblendid.connect`
will stop scanning, connect to that peripheral and return it.

```ts
import Sblendid from "@sblendid/sblendid";

// By Name
const peripheral = await Sblendid.connect("My Peripheral");

// By UUID
const peripheral = await Sblendid.connect("3A62F159");

// By Address
const peripheral = await Sblendid.connect("00-14-22-01-23-45");

// With a callback
const peripheral = await Sblendid.connect(periperal =>
  Boolean(periperal.connectable)
);

// With an async callback
const peripheral = await Sblendid.connect(
  async periperal => await isPeripheralIAmLookingFor(periperal)
);
```

> ##### Timeouts
>
> It is important to know that no function in this libary has a timeout. `Sblendid.connect`
> will scan indefinitely unless you make sure it doesn't. At some point in the future
> timeouts will be built in but it is not a scope of version 1.0.0

#### `new Sblendid()` (Constructor)

You can instantiate Sblendid like any other class. It has no parameters. You will have to
turn it on before using it though.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = new Sblendid();
```

#### `async powerOn(): Promise<void>`

If you instantiate Sblendid in your own, this method lets you turn on your BLE adapter.
It returns a promise that resolves (with no value) when the adater ist powered on.

Note that you can also use `const sblendid = await Sblendid.powerOn();` to achieve the
same thing.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = new Sblendid();
await sblendid.powerOn();
```

#### `async find(condition: Condition): Promise<Peripheral>`

Will scan for a peripheral and return it once it's found. Unlike `Sblendid.connect`
`find` will not automatically connect to the peripheral. `find` will accept the same
parameters as `Sblendid.connect` to find a a peripheral.

Note that this is an instance method, so you will have to instantiate and turn on
Sblendid first.

```ts
import Sblendid from "@sblendid/sblendid";

const sblendid = await Sblendid.powerOn();
const peripheral = await sblendid.find("My Peripheral");
```

#### `startScanning(listener?: PeripheralListener): void`

Will start scanning for peripherals. Instead of finding a specific peripheral
and returning it, this method will just scan your surroundings and call a
callback for every peripheral it finds. It will do so indefinitely until you
call `sblendid.stopScanning()`. This method has no return value and is not
asynchronous.

The callback function will receive a single argument which is an instance of
`Peripheral`.

> Note that when you call `sblendid.startScanning` multiple times with different
> listeners only the last listener will be used and all others will be discarded.

```ts
import Sblendid from "@sblendid/sblendid";

function listener(peripheral) {
  console.log("Found peripheral with uuid", peripheral.uuid);
}

const sblendid = await Sblendid.powerOn();
sblendid.startScanning(listener);
```

#### `stopScanning(): void`

Will tell sblendid to stop scanning. The listener you may have provided in
`sblendid.startScanning` will be discarded and not be called anymore.

```ts
import Sblendid from "@sblendid/sblendid";

function listener(peripheral) {
  console.log("Found peripheral with uuid", peripheral.uuid);
}

const sblendid = await Sblendid.powerOn();
sblendid.startScanning(listener);

await new Promise(resolve => setTimeout(resolve, 1000));

sblendid.stopScanning();
```
