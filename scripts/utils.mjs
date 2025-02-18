import { access } from "fs/promises";
import { constants } from "fs";
import { join } from "path";
import { execFileSync, execSync } from "child_process";

export async function exists(path) {
    return await access(path, constants.F_OK)
        .then(() => true)
        .catch(() => false);
}

export function getSpotifyPath() {
    switch (process.platform) {
        case "linux":
            return join(
                process.env.HOME,
                ".local/share/spotify-launcher/install/usr/share/spotify"
            );
        case "win32":
            return join(process.env.AppData, "Spotify");
        default:
            throw new Error(`Platform not implemented: ${process.platform}`);
    }
}

export function getCachePath() {
    switch (process.platform) {
        case "linux":
            return join(process.env.HOME, ".cache/spotify");
        case "win32":
            return join(process.env.LocalAppData, "Spotify");
        default:
            throw new Error(`Platform not implemented: ${process.platform}`);
    }
}

export function killSpotify() {
    switch (process.platform) {
        case "linux":
            return execSync("killall spotify");
        case "win32":
            return execSync("taskkill /F /IM Spotify.exe /T");
        default:
            throw new Error(`Platform not implemented: ${process.platform}`);
    }
}

export function launchSpotify() {
    switch (process.platform) {
        case "linux":
            return execSync("spotify-launcher");
        case "win32":
            return execFileSync(join(getSpotifyPath(), "Spotify.exe"));
        default:
            throw new Error(`Platform not implemented: ${process.platform}`);
    }
}

export async function wrapSpotifyProcess(func) {
    try {
        killSpotify();
    } catch {}
    await func();
    launchSpotify();
}
