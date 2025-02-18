/**
 * Modified version of Vendicated's Tracer.ts
 * @link https://github.com/Vendicated/Vencord/blob/main/src/debug/Tracer.ts
 */

import { Logger } from "@utils/logger";

if (IS_DEV || IS_REPORTER) {
    var traces = {} as Record<string, [number, any[]]>;
    var logger = new Logger("Tracer", "#ffd166");
}

const noop = () => {};

export const beginTrace = !(IS_DEV || IS_REPORTER)
    ? noop
    : (name: string, ...args: any[]) => {
          if (name in traces) {
              throw new Error(`Trace ${name} already exists!`);
          }
          traces[name] = [performance.now(), args];
      };

export const finishTrace = !(IS_DEV || IS_REPORTER)
    ? noop
    : (name: string) => {
          const end = performance.now();
          const [start, args] = traces[name];
          delete traces[name];
          logger.debug(`${name} took ${end - start}ms`, args);
      };

type Func = (...args: any[]) => any;
type TraceNameMapper<F extends Func> = (...args: Parameters<F>) => string;

const noopTracer = <F extends Func>(
    name: string,
    f: Func,
    mapper?: TraceNameMapper<F>
) => f;

export const traceFunction = !(IS_DEV || IS_REPORTER)
    ? noopTracer
    : <F extends Func>(
          name: string,
          f: Func,
          mapper?: TraceNameMapper<F>
      ): F => {
          return function (this: any, ...args: Parameters<F>) {
              const traceName = mapper?.(...args) ?? name;
              beginTrace(traceName, ...arguments);
              try {
                  return f.apply(this, args);
              } finally {
                  finishTrace(traceName);
              }
          } as F;
      };
