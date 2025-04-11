import { Platform, WebpackInstance } from "@webpack/types";

declare global {
    export var IS_DEV: boolean;

    export var Extendify: typeof import("./Extendify");

    interface Window {
        wreq: WebpackInstance;
        platform: Platform;
    }
}
