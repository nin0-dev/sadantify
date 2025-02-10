import { execFileSync, execSync } from "child_process";
import { readdir, rename, rm } from "fs/promises";
import { join } from "path";

const spotifyPath = join(process.env.AppData, "Spotify");
const appsPath = join(spotifyPath, "Apps");

const removeXpuiPatch = async () => {
    const dir = await readdir(appsPath);
    if (dir.includes("_xpui.spa")) {
        await rm(join(appsPath, "xpui.spa"), { recursive: true });
        await rename(join(appsPath, "_xpui.spa"), join(appsPath, "xpui.spa"));
    }
}

(async () => {
    try { execSync("taskkill /F /IM Spotify.exe /T"); }
    catch {}
    await removeXpuiPatch();
    execFileSync(join(spotifyPath, "Spotify.exe"));
})();
