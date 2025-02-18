import { Devs } from "@utils/constants";
import { definePlugin } from "@utils/types";

export default definePlugin({
    name: "Topbar",
    description: "API to add elements to the global top navbar",
    authors: [Devs.elia],
    required: true,
    patches: [
        {
            find: '"data-testid":"top-bar-back-button"',
            replacement: {
                match: /(globalNavBarHistoryButtonsContainer\),children:)(\[.*?\])(}\))/,
                replace: (_, prefix, children, suffix) => {
                    return `${prefix}Extendify.Api.Topbar._injectTopbarElements(${children})${suffix}`;
                }
            }
        }
    ]
});
