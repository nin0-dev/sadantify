import { execFileSync, execSync } from "child_process";
import { copyFile, readdir, readFile, rm, writeFile } from "fs/promises";
import JSZip from "jszip";
import { join } from "path";
import { exists } from "../utils.mjs";

const spotifyPath = join(process.env.AppData, "Spotify");
const appsPath = join(spotifyPath, "Apps");

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
        archive.file("xpui.js", (await archive.file("xpui.js").async("string")).replace("l.m=a,", "l.m=a,l.c=o,"));
        
        const buffer = await archive.generateAsync({ type: "uint8array" });
        await writeFile(join(appsPath, "xpui.spa"), buffer);
        console.log("Wrote new archive");
    }
}

(async () => {
    try { execSync("taskkill /F /IM Spotify.exe /T"); }
    catch {}
    await createXpuiPatch();
    execFileSync(join(spotifyPath, "Spotify.exe"));
})();
