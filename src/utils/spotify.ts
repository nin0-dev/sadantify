import { connectDevices, platform, player } from "@webpack/common";

export const getProgress = (): number => {
    if (!player) {
        return 0;
    }
    const state = player.getState();
    if (state.isPaused) {
        return state.positionAsOfTimestamp;
    }
    return Date.now() - state.timestamp + state.positionAsOfTimestamp;
};

export const isPlayingLocally = (): boolean => {
    if (!connectDevices || !connectDevices.getActiveDevice()) {
        return true;
    }
    return connectDevices.getActiveDevice().isLocal;
};

export const redirectTo = (path: string) => {
    platform.getHistory().push(path);
};

export const findTranslation = (value: string, object = platform.getTranslations()): string[] => {
    const results: string[] = [];
    for (const key in object) {
        const translation = object[key];
        if (typeof translation === "string") {
            if (translation.toLowerCase().includes(value.toLowerCase())) {
                results.push(key);
            }
        } else if (typeof translation === "object") {
            if (findTranslation(value, translation).length) {
                results.push(key);
            }
        }
    }
    return results;
};

if (IS_DEV) {
    window["findTranslation"] = findTranslation;
}
