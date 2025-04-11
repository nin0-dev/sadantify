import { proxyLazy } from "@utils/lazy";
import { StartAt } from "@utils/types";
import { findByCodeLazy } from "@webpack";
import { ConnectDevicesAPI, CosmosAPI, Platform, PlaybackAPI, PlayerAPI } from "@webpack/types";

import { createEventListeners, startAllPlugins } from "plugins";

export const findApiLazy = <T>(name: string): T => {
    const proxy = proxyLazy(
        (): T => {
            if (!platform) {
                return null as T;
            }
            const api = platform.getRegistry().resolve(Symbol.for(name)) as T;
            if (IS_DEV) {
                window[name] = api;
            }
            return api;
        },
        5,
        false
    );
    return proxy;
};

export const findServiceLazy = <T>(id: string): T => {
    return findByCodeLazy(`SERVICE_ID=${id}`) as T;
};

export let platform: Platform;
export let player = findApiLazy<PlayerAPI>("PlayerAPI");
export let playback = findApiLazy<PlaybackAPI>("PlaybackAPI");
export let connectDevices = findApiLazy<ConnectDevicesAPI>("ConnectDevicesAPI");
export let cosmos = findApiLazy<CosmosAPI>("Cosmos");

export const _loadPlatform = (value: Platform): Platform => {
    platform = value;

    if (IS_DEV) {
        window.platform = platform;
    }

    startAllPlugins(StartAt.ApisLoaded);
    createEventListeners();

    return platform;
};
