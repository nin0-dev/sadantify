import { proxyLazy } from "@utils/lazy";
import { StartAt } from "@utils/types";
import {
    ConnectDevicesAPI,
    Platform,
    PlaybackAPI,
    PlayerAPI
} from "@webpack/types";
import { createEventListeners, startAllPlugins } from "plugins";

const findApiLazy = <T>(name: string): T => {
    const proxy = proxyLazy(
        (): T => {
            if (!platform) {
                return null as T;
            }
            return platform.getRegistry().resolve(Symbol.for(name)) as T;
        },
        5,
        false
    );
    if (IS_DEV) {
        window[name] = proxy;
    }
    return proxy;
};

export let platform: Platform;
export let player = findApiLazy<PlayerAPI>("PlayerAPI");
export let playback = findApiLazy<PlaybackAPI>("PlaybackAPI");
export let connectDevices = findApiLazy<ConnectDevicesAPI>("ConnectDevicesAPI");

export const _loadPlatform = (value: Platform): Platform => {
    platform = value;
    if (IS_DEV) {
        window["platform"] = platform;
    }

    startAllPlugins(StartAt.ApisLoaded);
    createEventListeners();

    return platform;
};
