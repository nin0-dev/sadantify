import { Devs } from "@utils/constants";
import { StartAt, definePlugin } from "@utils/types";
import { platform } from "@webpack/common";

export default definePlugin({
    name: "Adblock",
    description: "Block ads on Spotify",
    authors: [Devs.elia],
    required: false,
    startAt: StartAt.ApisLoaded,
    start: async () => {
        const adManagers = platform.getAdManagers();

        await adManagers.audio.disable();
        // TODO
        // https://github.com/Daksh777/SpotifyNoPremium/blob/main/adblock.js
    }
});
