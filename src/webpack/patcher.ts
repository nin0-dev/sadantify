/**
 * Modified version of Vendicated's patchWebpack.ts
 * @link https://github.com/Vendicated/Vencord/blob/main/src/webpack/patchWebpack.ts
 */
import { Settings } from "@api/settings";
import { Logger } from "@utils/logger";
import { Patch, PatchReplacement } from "@utils/types";
import {
    _blacklistBadModules,
    _initWebpack,
    factoryListeners,
    moduleListeners,
    waitForSubscriptions,
    wreq
} from "@webpack";
import {
    AnyModuleFactory,
    AnyWebpackRequire,
    MaybePatchedModuleFactory,
    PatchedModuleFactory,
    WebpackRequire
} from "@webpack/types";

import { patches } from "plugins";

export const SYM_IS_PROXIED_FACTORY = Symbol("WebpackPatcher.isProxiedFactory");
export const SYM_ORIGINAL_FACTORY = Symbol("WebpackPatcher.originalFactory");
export const SYM_PATCHED_SOURCE = Symbol("WebpackPatcher.patchedSource");
export const SYM_PATCHED_BY = Symbol("WebpackPatcher.patchedBy");
export const allWebpackInstances = new Set<AnyWebpackRequire>();
export const patchTimings = [] as Array<
    [plugin: string, moduleId: PropertyKey, match: PatchReplacement["match"], totalTime: number]
>;

const logger = new Logger("WebpackInterceptor", "#8caaee");
let wreqFallbackApplied = false;

const define: typeof Reflect.defineProperty = (target, p, attributes) => {
    if (Object.hasOwn(attributes, "value")) {
        attributes.writable = true;
    }

    return Reflect.defineProperty(target, p, {
        configurable: true,
        enumerable: true,
        ...attributes
    });
};

define(Function.prototype, "m", {
    enumerable: false,
    set(this: AnyWebpackRequire, originalModules: AnyWebpackRequire["m"]) {
        define(this, "m", { value: originalModules });

        const fileName = new Error().stack?.match(/https:\/\/(.+?\.js)/)?.[0];

        // Define a setter for the bundlePath property of WebpackRequire. Only the main Webpack has this property.
        // So if the setter is called, this means we can initialize the internal references to WebpackRequire.
        define(this, "p", {
            enumerable: false,
            set(this: AnyWebpackRequire, bundlePath: NonNullable<AnyWebpackRequire["p"]>) {
                define(this, "p", { value: bundlePath });
                clearTimeout(bundlePathTimeout);

                if (bundlePath !== "/") {
                    return;
                }

                if (wreq === null && this.c) {
                    logger.info(
                        `Main Webpack found in ${fileName}, initializing internal references to WebpackRequire`
                    );
                    _initWebpack(this as WebpackRequire);
                }

                patchInstance();
            }
        });

        define(this, "O", {
            enumerable: false,
            set(this: AnyWebpackRequire, onChunksLoaded: AnyWebpackRequire["O"]) {
                define(this, "O", { value: onChunksLoaded });
                clearTimeout(onChunksLoadedTimeout);

                const wreq = this;
                define(onChunksLoaded!, "j", {
                    enumerable: false,
                    set(this: NonNullable<AnyWebpackRequire["O"]>, j: NonNullable<AnyWebpackRequire["O"]>["j"]) {
                        define(this, "j", { value: j });
                        if (wreq.p === null) {
                            patchInstance();
                        }
                    }
                });
            }
        });

        const bundlePathTimeout = setTimeout(() => Reflect.deleteProperty(this, "p"), 0);
        const onChunksLoadedTimeout = setTimeout(() => Reflect.deleteProperty(this, "O"), 0);

        const patchInstance = () => {
            logger.info(`Found Webpack module factories in ${fileName}`);

            for (const moduleId in originalModules) {
                updateExistingOrProxyFactory(
                    originalModules,
                    moduleId,
                    originalModules[moduleId],
                    originalModules,
                    true
                );
            }

            define(originalModules, Symbol.toStringTag, {
                value: "ModuleFactories",
                enumerable: false
            });

            const proxiedModuleFactories = new Proxy(originalModules, moduleFactoriesHandler);
            define(this, "m", { value: proxiedModuleFactories });

            this.d = function (exports, definition) {
                for (const key in definition) {
                    if (Object.hasOwn(definition, key) && !Object.hasOwn(exports, key)) {
                        Object.defineProperty(exports, key, {
                            enumerable: true,
                            configurable: true,
                            get: definition[key]
                        });
                    }
                }
            };
        };
    }
});

const moduleFactoriesHandler: ProxyHandler<AnyWebpackRequire["m"]> = {
    set: updateExistingOrProxyFactory
};

const moduleFactoryHandler: ProxyHandler<MaybePatchedModuleFactory> = {
    apply(target, thisArg: unknown, argArray: Parameters<AnyModuleFactory>) {
        if (target[SYM_ORIGINAL_FACTORY] !== null) {
            return runFactoryWithWrap(target as PatchedModuleFactory, thisArg, argArray);
        }

        const moduleId: string = target.name;
        return runFactoryWithWrap(patchFactory(moduleId, target), thisArg, argArray);
    },
    get(target, p, receiver) {
        if (p === SYM_IS_PROXIED_FACTORY) {
            return true;
        }

        const originalFactory: AnyModuleFactory = target[SYM_ORIGINAL_FACTORY] ?? target;

        if (p === "toString" || p === SYM_PATCHED_SOURCE || p === SYM_PATCHED_BY) {
            const v = Reflect.get(originalFactory, p, originalFactory);
            return p === "toString" ? v.bind(originalFactory) : v;
        }

        return Reflect.get(target, p, receiver);
    }
};

function updateExistingOrProxyFactory(
    moduleFactories: AnyWebpackRequire["m"],
    moduleId: PropertyKey,
    newFactory: AnyModuleFactory,
    receiver: any,
    ignoreExistingInTarget = false
) {
    if (updateExistingFactory(moduleFactories, moduleId, newFactory, receiver, ignoreExistingInTarget)) {
        return true;
    }

    notifyFactoryListeners(moduleId, newFactory);

    const proxiedFactory = new Proxy(
        Settings.eagerPatches ? patchFactory(moduleId, newFactory) : newFactory,
        moduleFactoryHandler
    );
    return Reflect.set(moduleFactories, moduleId, proxiedFactory, receiver);
}

/**
 * Update a duplicated factory that exists in any of the Webpack instances we track with a new original factory.
 *
 * @param moduleFactories The module factories where this new original factory is being set
 * @param moduleId The id of the module
 * @param newFactory The new original factory
 * @param receiver The receiver of the factory
 * @param ignoreExistingInTarget Whether to ignore checking if the factory already exists in the moduleFactories where it is being set
 * @returns Whether the original factory was updated, or false if it doesn't exist in any of the tracked Webpack instances
 */
function updateExistingFactory(
    moduleFactories: AnyWebpackRequire["m"],
    moduleId: PropertyKey,
    newFactory: AnyModuleFactory,
    receiver: any,
    ignoreExistingInTarget: boolean
) {
    let existingFactory: AnyModuleFactory | undefined;
    let moduleFactoriesWithFactory: AnyWebpackRequire["m"] | undefined;
    for (const wreq of allWebpackInstances) {
        if (ignoreExistingInTarget && wreq.m === moduleFactories) {
            continue;
        }

        if (Object.hasOwn(wreq.m, moduleId)) {
            existingFactory = wreq.m[moduleId];
            moduleFactoriesWithFactory = wreq.m;
            break;
        }
    }

    if (existingFactory != null) {
        // If existingFactory exists in any of the Webpack instances we track, it's either wrapped in our proxy, or it has already been required.
        // In the case it is wrapped in our proxy, and the instance we are setting does not already have it, we need to make sure the instance contains our proxy too.
        if (moduleFactoriesWithFactory !== moduleFactories && existingFactory[SYM_IS_PROXIED_FACTORY]) {
            Reflect.set(moduleFactories, moduleId, existingFactory, receiver);
        }
        // Else, if it is not wrapped in our proxy, set this new original factory in all the instances
        else {
            defineInWebpackInstances(moduleId, newFactory);
        }

        // Update existingFactory with the new original, if it does have a current original factory
        if (existingFactory[SYM_ORIGINAL_FACTORY] != null) {
            existingFactory[SYM_ORIGINAL_FACTORY] = newFactory;
        }

        // Persist patched source and patched by in the new original factory
        if (IS_DEV) {
            newFactory[SYM_PATCHED_SOURCE] = existingFactory[SYM_PATCHED_SOURCE];
            newFactory[SYM_PATCHED_BY] = existingFactory[SYM_PATCHED_BY];
        }

        return true;
    }

    return false;
}

/**
 * Define a module factory in all the Webpack instances we track.
 *
 * @param moduleId The id of the module
 * @param factory The factory
 */
function defineInWebpackInstances(moduleId: PropertyKey, factory: AnyModuleFactory) {
    for (const wreq of allWebpackInstances) {
        define(wreq.m, moduleId, { value: factory });
    }
}

/**
 * Notify all factory listeners.
 *
 * @param moduleId The id of the module
 * @param factory The original factory to notify for
 */
function notifyFactoryListeners(moduleId: PropertyKey, factory: AnyModuleFactory) {
    for (const factoryListener of factoryListeners) {
        try {
            factoryListener(factory, moduleId);
        } catch (err) {
            logger.error("Error in Webpack factory listener:\n", err, factoryListener);
        }
    }
}

/**
 * Run a (possibly) patched module factory with a wrapper which notifies our listeners.
 *
 * @param patchedFactory The (possibly) patched module factory
 * @param thisArg The `value` of the call to the factory
 * @param argArray The arguments of the call to the factory
 */
function runFactoryWithWrap(
    patchedFactory: PatchedModuleFactory,
    thisArg: unknown,
    argArray: Parameters<MaybePatchedModuleFactory>
) {
    const originalFactory = patchedFactory[SYM_ORIGINAL_FACTORY];

    if (patchedFactory === originalFactory) {
        // @ts-expect-error Clear up ORIGINAL_FACTORY if the factory did not have any patch applied
        delete patchedFactory[SYM_ORIGINAL_FACTORY];
    }

    let [module, exports, require] = argArray;

    // Restore the original factory in all the module factories objects, discarding our proxy and allowing it to be garbage collected
    defineInWebpackInstances(module.id, originalFactory);

    if (wreq == null) {
        if (!wreqFallbackApplied) {
            wreqFallbackApplied = true;

            // Make sure the require argument is actually the WebpackRequire function
            if (typeof require === "function" && require.m != null && require.c != null) {
                const { stack } = new Error();
                const webpackInstanceFileName = stack?.match(/\/assets\/(.+?\.js)/)?.[1];

                logger.warn(
                    `WebpackRequire was not initialized, falling back to WebpackRequire passed to the first called wrapped module factory (id: ${String(module.id)}, WebpackInstance origin: ${webpackInstanceFileName})`
                );

                // Could technically be wrong, but it's better than nothing
                _initWebpack(require as WebpackRequire);
            } else if (IS_DEV) {
                logger.error("WebpackRequire was not initialized, running modules without patches instead.");
                return originalFactory.apply(thisArg, argArray);
            }
        } else if (IS_DEV) {
            return originalFactory.apply(thisArg, argArray);
        }
    }

    let factoryReturn: unknown;
    try {
        factoryReturn = patchedFactory.apply(thisArg, argArray);
    } catch (err) {
        if (patchedFactory === originalFactory) {
            throw err;
        }

        logger.error("Error in patched module factory:\n", err);
        return originalFactory.apply(thisArg, argArray);
    }

    exports = module.exports;

    if (typeof require === "function" && require.c) {
        if (_blacklistBadModules(require.c, exports, module.id)) {
            return factoryReturn;
        }
    }

    if (exports == null) {
        return factoryReturn;
    }

    for (const callback of moduleListeners) {
        try {
            callback(exports, module.id);
        } catch (err) {
            logger.error("Error in Webpack module listener:\n", err, callback);
        }
    }

    for (const [filter, callback] of waitForSubscriptions) {
        try {
            if (filter(exports)) {
                waitForSubscriptions.delete(filter);
                callback(exports, module.id);
                continue;
            }

            if (typeof exports !== "object") {
                continue;
            }

            for (const exportKey in exports) {
                const exportValue = exports[exportKey];

                if (exportValue != null && filter(exportValue)) {
                    waitForSubscriptions.delete(filter);
                    callback(exportValue, module.id);
                    break;
                }
            }
        } catch (err) {
            logger.error("Error while firing callback for Webpack waitFor subscription:\n", err, filter, callback);
        }
    }

    return factoryReturn;
}

/**
 * Patches a module factory.
 *
 * @param moduleId The id of the module
 * @param originalFactory The original module factory
 * @returns The patched module factory
 */
function patchFactory(moduleId: PropertyKey, originalFactory: AnyModuleFactory): PatchedModuleFactory {
    // 0, prefix to turn it into an expression: 0,function(){} would be invalid syntax without the 0,
    let code: string = "0," + String(originalFactory);
    let patchedSource = code;
    let patchedFactory = originalFactory;

    const patchedBy = new Set<string>();

    for (let i = 0; i < patches.length; i++) {
        const patch = patches[i];

        const moduleMatches =
            typeof patch.find === "string"
                ? code.includes(patch.find)
                : (patch.find.global && (patch.find.lastIndex = 0), patch.find.test(code));

        if (!moduleMatches) {
            continue;
        }

        const executePatch = (match: string | RegExp, replace: string) => {
            if (typeof match !== "string" && match.global) {
                match.lastIndex = 0;
            }

            return code.replace(match, replace);
        };

        const previousCode = code;
        const previousFactory = originalFactory;
        let markedAsPatched = false;

        // We change all patch.replacement to array in plugins/index
        for (const replacement of patch.replacement as PatchReplacement[]) {
            const lastCode = code;
            const lastFactory = originalFactory;

            try {
                const [newCode, totalTime] = executePatch(replacement.match, replacement.replace as string);

                if (newCode === code) {
                    if (!(patch.noWarn || replacement.noWarn)) {
                        logger.warn(
                            `Patch by ${patch.plugin} had no effect (Module id is ${String(moduleId)}): ${replacement.match}`
                        );
                        if (IS_DEV) {
                            logger.debug("Function Source:\n", code);
                        }
                    }

                    if (patch.group) {
                        logger.warn(
                            `Undoing patch group ${patch.find} by ${patch.plugin} because replacement ${replacement.match} had no effect`
                        );
                        code = previousCode;
                        patchedFactory = previousFactory;

                        if (markedAsPatched) {
                            patchedBy.delete(patch.plugin);
                        }

                        break;
                    }

                    continue;
                }

                const pluginsList = [...patchedBy];
                if (!patchedBy.has(patch.plugin)) {
                    pluginsList.push(patch.plugin);
                }

                code = newCode;
                patchedSource = `// Webpack Module ${String(moduleId)} - Patched by ${pluginsList.join(", ")}\n${newCode}\n//# sourceURL=WebpackModule${String(moduleId)}`;
                patchedFactory = (0, eval)(patchedSource);

                if (!patchedBy.has(patch.plugin)) {
                    patchedBy.add(patch.plugin);
                    markedAsPatched = true;
                }
            } catch (err) {
                logger.error(
                    `Patch by ${patch.plugin} errored (Module id is ${String(moduleId)}): ${replacement.match}\n`,
                    err
                );

                if (IS_DEV) {
                    diffErroredPatch(code, lastCode, lastCode.match(replacement.match)!);
                }

                if (markedAsPatched) {
                    patchedBy.delete(patch.plugin);
                }

                if (patch.group) {
                    logger.warn(
                        `Undoing patch group ${patch.find} by ${patch.plugin} because replacement ${replacement.match} errored`
                    );
                    code = previousCode;
                    patchedFactory = previousFactory;
                    break;
                }

                code = lastCode;
                patchedFactory = lastFactory;
            }
        }

        if (!patch.all) {
            patches.splice(i--, 1);
        }
    }

    patchedFactory[SYM_ORIGINAL_FACTORY] = originalFactory;

    if (IS_DEV && patchedFactory !== originalFactory) {
        originalFactory[SYM_PATCHED_SOURCE] = patchedSource;
        originalFactory[SYM_PATCHED_BY] = patchedBy;
    }

    return patchedFactory as PatchedModuleFactory;
}

function diffErroredPatch(code: string, lastCode: string, match: RegExpMatchArray) {
    const changeSize = code.length - lastCode.length;

    // Use 200 surrounding characters of context
    const start = Math.max(0, match.index! - 200);
    const end = Math.min(lastCode.length, match.index! + match[0].length + 200);
    // (changeSize may be negative)
    const endPatched = end + changeSize;

    const context = lastCode.slice(start, end);
    const patchedContext = code.slice(start, endPatched);

    // Inline require to avoid including it in !IS_DEV builds
    const diff = (require("diff") as typeof import("diff")).diffWordsWithSpace(context, patchedContext);
    let fmt = "%c %s ";
    const elements: string[] = [];
    for (const d of diff) {
        const color = d.removed ? "red" : d.added ? "lime" : "grey";
        fmt += "%c%s";
        elements.push("color:" + color, d.value);
    }

    logger.errorCustomFmt(...Logger.makeTitle("white", "Before"), context);
    logger.errorCustomFmt(...Logger.makeTitle("white", "After"), patchedContext);
    const [titleFmt, ...titleElements] = Logger.makeTitle("white", "Diff");
    logger.errorCustomFmt(titleFmt + fmt, ...titleElements, ...elements);
}
