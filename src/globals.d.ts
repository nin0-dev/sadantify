import { WebpackInstance } from "@webpack/types";

declare global {
    export var IS_DEV: boolean;

    export var Extendify: typeof import("./Extendify");

    interface Window {
        __webpack_require__: WebpackInstance;
    }
}
