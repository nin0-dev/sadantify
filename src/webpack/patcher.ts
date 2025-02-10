/**
 * Modified version of Vendicated's patchWebpack.ts
 * @link https://github.com/Vendicated/Vencord/blob/main/src/webpack/patchWebpack.ts
 */

import { WEBPACK_CHUNK } from "@utils/constants";
import { Logger } from "@utils/logger";
import { canonicalizeReplacement } from "@utils/patches";
import { PatchReplacement } from "@utils/types";
import { _initWebpack, beforeInitListeners, factoryListeners, moduleListeners, shouldIgnoreModule, subscriptions, wreq } from "@webpack";
import { traceFunction } from "debug/tracer";
import { patches } from "plugins";
import { WebpackInstance } from "./types";

const logger = new Logger("WebpackInterceptor", "#8caaee");

let webpackChunk: any[];

Object.defineProperty(window, WEBPACK_CHUNK, {
    configurable: true,
    get: () => webpackChunk,
    set: v => {
        if (v?.push) {
            if (!v.push.$$extendifyOriginal) {
                logger.info(`Patching ${WEBPACK_CHUNK}.push`);
                patchPush(v);

                delete window[WEBPACK_CHUNK];
                window[WEBPACK_CHUNK] = v;
            }
        }
        webpackChunk = v;
    }
});

Object.defineProperty(Function.prototype, "m", {
    configurable: true,
    set(this: WebpackInstance, v: any) {
        Object.defineProperty(this, "m", {
            configurable: true,
            value: v,
            enumerable: true,
            writable: true
        });

        patchFactories(v);

        // Define a setter for the bundlePath property of WebpackRequire. Only the main Webpack has this property.
        // So if the setter is called, this means we can initialize the internal references to WebpackRequire.
        Object.defineProperty(this, "p", {
            configurable: true,
            set(this: WebpackInstance, bundlePath: string) {
                Object.defineProperty(this, "p", {
                    value: bundlePath,
                    configurable: true,
                    enumerable: true,
                    writable: true
                });

                clearTimeout(setterTimeout);
                if (bundlePath !== "/") {
                    return;
                }

                logger.info("Main Webpack found, initializing internal references to WebpackRequire");
                _initWebpack(this);
                
                for (const listener of beforeInitListeners) {
                    listener(this);
                }
            }
        });
        
        const setterTimeout = setTimeout(() => Reflect.deleteProperty(this, "p"), 0);
    }
});

const patchPush = (webpackGlobal: any) => {
    const handlePush = (chunk: any) => {
        try {
            patchFactories(chunk[1]);
        } catch (e) {
            logger.error("Error in handlePush", e);
        }
        return handlePush.$$extendifyOriginal.call(webpackGlobal, chunk);
    }

    handlePush.$$extendifyOriginal = webpackGlobal.push;
    handlePush.toString = handlePush.$$extendifyOriginal.toString.bind(handlePush.$$extendifyOriginal);
    handlePush.bind = (...args: unknown[]) => handlePush.$$extendifyOriginal.bind(...args);

    Object.defineProperty(webpackGlobal, "push", {
        configurable: true,
        get: () => handlePush,
        set: v => {
            handlePush.$$extendifyOriginal = v;
        }
    });
}

let webpackNotInitializedLogged = false;

const patchFactories = (factories: Record<string, (module: any, exports: any, require: WebpackInstance) => void>) => {
    for (const id in factories) {
        let mod = factories[id];

        const originalMod = mod;
        const patchedBy = new Set();

        const factory = factories[id] = function(module: any, exports: any, require: WebpackInstance) {
            if (wreq === null && IS_DEV) {
                if (!webpackNotInitializedLogged) {
                    webpackNotInitializedLogged = true;
                    logger.error("WebpackRequire was not initialized, running modules without patches instead.");
                }
                return void originalMod(module, exports, require);
            }

            try {
                mod(module, exports, require);
            } catch (e) {
                if (mod === originalMod) {
                    throw e;
                }
                logger.error("Error in patched module", e);
                return void originalMod(module, exports, require);
            }

            exports = module.exports;
            if (!exports) {
                return;
            }

            if (require.c && shouldIgnoreModule(exports)) {
                Object.defineProperty(require.c, id, {
                    value: require.c[id],
                    enumerable: false,
                    configurable: true,
                    writable: true
                });
                return;
            }

            for (const callback of moduleListeners) {
                try {
                    callback(exports, id);
                } catch (e) {
                    logger.error("Error in Webpack module listener:", e, callback);
                }
            }

            for (const [filter, callback] of subscriptions) {
                try {
                    if (exports && filter(exports)) {
                        subscriptions.delete(filter);
                        callback(exports, id);
                    }

                    if (typeof exports !== "object") {
                        continue;
                    }

                    // NOTE: Don't use `of` here. It will throw a TypeError.
                    for (const key in exports) {
                        if (exports[key] && filter(exports[key])) {
                            subscriptions.delete(filter);
                            callback(exports[key], id);
                        }
                    }
                } catch (e) {
                    logger.error("Error while firing callback for Webpack subscription:", e, filter, callback);
                }
            }
        } as any as {
            (...args: any[]): void;
            $$extendifyPatchedSource?: string;
            original: any;
            toString: () => string;
        };

        factory.toString = originalMod.toString.bind(originalMod);
        factory.original = originalMod;

        for (const factoryListener of factoryListeners) {
            try {
                factoryListener(originalMod);
            } catch (e) {
                logger.error("Error in Webpack factory listener:", e, factoryListener);
            }
        }

        let code: string = "0," + mod.toString().replaceAll("\n", "");

        for (let i = 0; i < patches.length; i++) {
            const patch = patches[i];

            const moduleMatches = typeof patch.find === "string" ? code.includes(patch.find) : patch.find.test(code);
            if (!moduleMatches) {
                continue;
            }

            patchedBy.add(patch.plugin);

            const executePatch = traceFunction(`patch by ${patch.plugin}`, (match: string | RegExp, replace: string) => code.replace(match, replace));
            const previousMod = mod;
            const previousCode = code;

            for (const replacement of patch.replacement as PatchReplacement[]) {
                const lastMod = mod;
                const lastCode = code;

                canonicalizeReplacement(replacement, patch.plugin);

                try {
                    const newCode = executePatch(replacement.match, replacement.replace as string);
                    if (newCode === code) {
                        if (!patch.noWarn) {
                            logger.warn(`Patch by ${patch.plugin} had no effect (Module id is ${id}): ${replacement.match}`);
                            if (IS_DEV) {
                                logger.debug("Function source:", code);
                            }
                        }

                        if (patch.group) {
                            logger.warn(`Undoing patch group ${patch.find} by ${patch.plugin} because replacement ${replacement.match} had no effect`);
                            mod = previousMod;
                            code = previousCode;
                            patchedBy.delete(patch.plugin);
                            break;
                        }

                        continue;
                    }

                    code = newCode;
                    mod = (0, eval)(`// Webpack Module ${id} - Patched by ${[...patchedBy].join(", ")}\n${newCode}\n//# sourceURL=https://xpui.app.spotify.com/patched/WebpackModule${id}.js`);
                } catch (e) {
                    logger.error(`Patch by ${patch.plugin} errored (Module id is ${id}): ${replacement.match}`, e);

                    if (IS_DEV) {
                        (async function() {
                            const changeSize = code.length - lastCode.length;
                            const match = lastCode.match(replacement.match)!;
    
                            // Use 200 surrounding characters of context
                            const start = Math.max(0, match.index! - 200);
                            const end = Math.min(lastCode.length, match.index! + match[0].length + 200);
                            // (changeSize may be negative)
                            const endPatched = end + changeSize;
    
                            const context = lastCode.slice(start, end);
                            const patchedContext = code.slice(start, endPatched);

                            // Inline import to avoid it bundling it in production
                            const diff = (await import("diff")).diffWordsWithSpace(context, patchedContext);
                            let fmt = "%c %s ";
                            const elements = [] as string[];
                            for (const d of diff) {
                                const color = d.removed ? "red" : d.added ? "lime" : "grey";
                                fmt += "%c%s";
                                elements.push("color:" + color, d.value);
                            }

                            logger.errorCustomFmt(...Logger.makeTitle("white", "Before"), context);
                            logger.errorCustomFmt(...Logger.makeTitle("white", "After"), patchedContext);
                            const [titleFmt, ...titleElements] = Logger.makeTitle("white", "Diff");
                            logger.errorCustomFmt(titleFmt + fmt, ...titleElements, ...elements);
                        })();
                    }

                    patchedBy.delete(patch.plugin);

                    if (patch.group) {
                        logger.warn(`Undoing patch group ${patch.find} by ${patch.plugin} because replacement ${replacement.match} errored`);
                        mod = previousMod;
                        code = previousCode;
                        break;
                    }

                    mod = lastMod;
                    code = lastCode;
                }
            }

            if (!patch.all) {
                patches.splice(i--, 1);
            }
        }

        if (IS_DEV) {
            if (mod !== originalMod) {
                factory.$$extendifyPatchedSource = String(mod);
            } else if (wreq) {
                const existingFactory = wreq.m[id];
                if (existingFactory) {
                    factory.$$extendifyPatchedSource = existingFactory.$$extendifyPatchedSource;
                }
            }
        }
    }
}
