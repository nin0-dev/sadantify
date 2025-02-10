/**
 * Modified version of Vendicated's runReporter.ts
 * @link https://github.com/Vendicated/Vencord/blob/main/src/debug/runReporter.ts
 */

import { Logger } from "@utils/logger";
import * as Webpack from "@webpack";
import { loadLazyChunks } from "./loadLazyChunks";
import { patches } from "plugins";

const logger = new Logger("Reporter");

export const runReporter = async () => {
    try {
        logger.log("Starting test...");

        let loadLazyChunksResolve: (value: void | PromiseLike<void>) => void;
        const loadLazyChunksDone = new Promise<void>(r => loadLazyChunksResolve = r);
        
        Webpack.beforeInitListeners.add(() => loadLazyChunks().then((loadLazyChunksResolve)));
        await loadLazyChunksDone;

        for (const patch of patches) {
            if (!patch.all) {
                new Logger("WebpackInterceptor").warn(`Patch by ${patch.plugin} found no module (Module id is-): ${patch.find}`);
            }
        }

        for (const [searchType, args] of Webpack.lazyWebpackSearchHistory) {
            let method = searchType;

            switch (searchType) {
                case "findComponent":
                    method = "find";
                    break;
                case "findExportedComponent":
                    method = "findByProps";
                    break;
                case "waitFor":
                case "waitForComponent":
                    if (typeof args[0] === "string") {
                        method = "findByProps";
                    } else {
                        method = "find";
                    }
                    break;
                default:
                    method = searchType;
                    break;
            }

            let result: any;
            try {
                if (method === "proxyLazyWebpack" || method === "LazyComponentWebpack") {
                    const [factory] = args;
                    result = factory();
                } else if (method === "extractAndLoadChunks") {
                    const [code, matcher] = args;
                    result = await Webpack.extractAndLoadChunks(code, matcher);
                } else if (method === "mapMangledModule") {
                    const [code, mapper] = args;
                    result = Webpack.mapMangledModule(code, mapper);
                    if (Object.keys(result).length !== Object.keys(mapper).length) {
                        throw new Error("Webpack find fail");
                    }
                } else {
                    result = Webpack[method](...args);
                }

                if (result === null || (result.$$extendifyInternal !== null && result.$$extendifyInternal() === null)) {
                    throw new Error("Webpack find fail");
                }
            } catch (e) {
                let logMessage = searchType;
                if (method === "find" || method === "proxyLazyWebpack" || method === "LazyComponentWebpack") {
                    if (args[0].$$extendifyProps !== null) {
                        logMessage += `(${args[0].$$extendifyProps.map(arg => `"${arg}"`).join(", ")})`;
                    } else {
                        logMessage += `(${args[0].toString().slice(0, 147)}...)`;
                    }
                } else if (method === "extractAndLoadChunks") {
                    logMessage += `([${args[0].map(arg => `"${arg}"`).join(", ")}])`;
                } else if (method === "mapMangledModule") {
                    const failedMappings = Object.keys(args[1]).filter(key => result?.key === null);
                    logMessage += `("${args[0]}", {\n${failedMappings.map(mapping => `\t${mapping}: ${args[1][mapping].toString().slice(0, 147)}...`).join(",\n")}\n})`;
                } else {
                    logMessage += `${args.map(arg => `"${arg}"`).join(", ")}`;
                }

                logger.log("Webpack find fail:", logMessage);
            }
        }

        logger.log("Finished test");
    } catch (e) {
        logger.log("A fatal error occured:", e);
    }
}
