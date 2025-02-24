import { Settings } from "@api/settings";
import { Devs } from "@utils/constants";
import { definePlugin, StartAt } from "@utils/types";

export default definePlugin({
    name: "Themes",
    description: "Custom themes for Spotify",
    authors: [Devs.elia],
    required: true,
    startAt: StartAt.DOMContentLoaded,
    start: () => {
        if (Settings.theme.files.css) {
            const style = document.createElement("style");
            style.innerText = Settings.theme.files.css;
            document.head.appendChild(style);
        }

        if (Settings.theme.files.js) {
            const script = document.createElement("script");
            script.innerText = Settings.theme.files.js;
            document.head.appendChild(script);
        }
    }
});
