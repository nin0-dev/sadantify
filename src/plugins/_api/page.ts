import { Devs } from "@utils/constants";
import { definePlugin } from "@utils/types";

export default definePlugin({
    name: "PageAPI",
    description: "API to add pages",
    authors: [Devs.elia],
    required: true,
    patches: [
        {
            find: "createHref({pathname:",
            replacement: [
                {
                    // return b(V(t),n)
                    match: /(return .\(.\()(.)(\),.\))/,
                    replace: (_, prefix, children, suffix) => {
                        return `${prefix}Extendify.Api.Page._injectPages(${children})${suffix}`;
                    }
                }
                // {
                //     // This removes the <header> top bar element on custom pages.
                //     // There's probably a way to remove this properly, because the settings page doesn't have it.
                //     // Hopefully this is temporary.
                //     match: /({value:"top-bar",children:)(.*?}\))(}\),\(0,)/,
                //     replace: (_, prefix, children, suffix) => {
                //         return `${prefix}[!Extendify.Api.Page.isCustomPage() ? ${children} : null]${suffix}`;
                //     }
                // }
            ]
        }
    ]
});
