import util from "util";

type AnyFunction = (...args: any[]) => any;

type PromisifiedFunction<T extends AnyFunction> = T extends (
  callback: (err: Error) => void
) => void
  ? () => Promise<void>
  : never;

type Promisified<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? PromisifiedFunction<T[K]> : never;
};

type Obj = Record<string, AnyFunction>;

type Promisify = <N extends string, F extends AnyFunction>([N, F]) => [
  N,
  PromisifiedFunction<F>
];

export default function promisifyObject<T extends Obj>(obj: T): Promisified<T> {
  const promisify: Promisify = ([name, fn]) => [name, util.promisify(fn)];
  const entries = Object.entries(obj).map(promisify);
  return entries.reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {} as Promisified<T>
  );
}
