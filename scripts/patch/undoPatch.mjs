import { execFileSync, execSync } from "child_process";
import { readdir, rename, rm } from "fs/promises";
import { join } from "path";
import { getSpotifyPath, wrapSpotifyProcess } from "../utils.mjs";

const appsPath = join(getSpotifyPath(), "Apps");

const removeXpuiPatch = async () => {
    const dir = await readdir(appsPath);
    if (dir.includes("_xpui.spa")) {
        await rm(join(appsPath, "xpui.spa"), { recursive: true });
        await rename(join(appsPath, "_xpui.spa"), join(appsPath, "xpui.spa"));
    }
};

wrapSpotifyProcess(removeXpuiPatch);
