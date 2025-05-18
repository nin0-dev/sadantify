import { Devs } from "@utils/constants";
import { isPlayingLocally } from "@utils/spotify";
import { StartAt, definePlugin } from "@utils/types";
import { player } from "@webpack/common";

export default definePlugin({
    name: "Platform",
    description: "Expose Spotify's APIs",
    authors: [Devs.elia],
    required: true,
    patches: [
        {
            find: "const{createPlatformDesktop:",
            replacement: {
                match: /(;const .=)(await async function\(\){.*?}}\(\))/,
                replace: (_, prefix, call) => {
                    return `${prefix}Extendify.Webpack.Common._loadPlatform(${call})`;
                }
            }
        }
    ],
    events: {
        /**
         * Sometimes Spotify keeps buffering when the next song starts playing and I have no idea why.
         * I hope this is a temporary solution.
         */
        onSongChange: () => {
            if (isPlayingLocally()) {
                player.seekTo(0);
            }
        }
    },
    startAt: StartAt.Init
});
