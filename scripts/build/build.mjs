#!/usr/bin/node

/**
 * Modified version of Vendicated's build.mjs
 * @link https://github.com/Vendicated/Vencord/blob/main/scripts/build/build.mjs
 */

import esbuild from "esbuild";
import {
    IS_DEV,
    IS_REPORTER,
    VERSION,
    BUILD_TIMESTAMP,
    commonOpts,
    globPlugins,
    commonRendererPlugins,
    commonMinifyOpts
} from "./common.mjs";
import { minify as minifyHtml } from "html-minifier-terser";
import { mkdir, readFile, writeFile } from "fs/promises";

const defines = {
    IS_DEV,
    IS_REPORTER,
    VERSION: JSON.stringify(VERSION),
    BUILD_TIMESTAMP
};

defines["process.platform"] = JSON.stringify(process.platform);

await Promise.all([
    esbuild.build({
        ...commonOpts,
        entryPoints: ["src/Extendify.ts"],
        outfile: "dist/extendify.js",
        format: "iife",
        target: ["esnext"],
        globalName: "Extendify",
        sourcemap: IS_DEV || IS_REPORTER ? "inline" : false,
        define: defines,
        plugins: [globPlugins, ...commonRendererPlugins]
    }),
    mkdir("dist", { recursive: true }),
    writeFile(
        "dist/index.html",
        await minifyHtml(
            await readFile("src/index.html", "utf-8"),
            commonMinifyOpts
        )
    )
]).catch((e) => {
    console.error("Build failed");
    console.error(e.message);
    if (!commonOpts.watch) {
        process.exitCode = 1;
    }
});
