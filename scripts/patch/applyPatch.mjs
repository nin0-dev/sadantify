import { exists, getSpotifyPath, wrapSpotifyProcess } from "../utils.mjs";

import { copyFile, readFile, readdir, rm, writeFile } from "fs/promises";
import JSZip from "jszip";
import { join } from "path";

const appsPath = join(getSpotifyPath(), "Apps");

const createXpuiPatch = async () => {
    const dir = await readdir(appsPath);
    if (dir.includes("xpui")) {
        await rm(join(appsPath, "xpui"), { recursive: true });
        console.log("Deleted xpui folder (might need to run Spotify updater)");
    }

    if (dir.includes("xpui.spa")) {
        if (!(await exists(join(appsPath, "_xpui.spa")))) {
            await copyFile(join(appsPath, "xpui.spa"), join(appsPath, "_xpui.spa"));
            console.log("Created backup");
        }

        const archive = await JSZip.loadAsync(await readFile(join(appsPath, "_xpui.spa"), "binary"));
        const dist = await readdir("dist");
        for (const fileName of dist) {
            archive.file(fileName, await readFile(join("dist", fileName)));
            console.log(`Copied ${fileName}`);
        }

        // TODO: Find a proper way to access Webpack's module cache as it is not accessible in the Webpack version Spotify uses
        const find = "__webpack_require__.m=__webpack_modules__,";
        archive.file(
            "xpui.js",
            (await archive.file("xpui.js").async("string")).replace(
                find,
                find + "__webpack_require__.c=__webpack_module_cache__,"
            )
        );

        const buffer = await archive.generateAsync({ type: "uint8array" });
        await writeFile(join(appsPath, "xpui.spa"), buffer);
        console.log("Wrote new archive");
    }
};

wrapSpotifyProcess(createXpuiPatch);
