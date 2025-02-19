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
        if (!Settings.theme) {
            return;
        }

        const style = document.createElement("style");
        style.innerText = Settings.theme.css;
        document.head.appendChild(style);
    }
});
