import { Devs } from "@utils/constants";
import { definePlugin, OptionType, StartAt } from "@utils/types";
import { ReconnectableWebSocket } from "./ws";
import { definePluginSettings } from "@api/settings";

const ws = new ReconnectableWebSocket();

import("@api/settings").then((module) => {
    console.log(Object.keys(module).includes("definePluginSettings"), module.definePluginSettings);
});

const settings = definePluginSettings({
    stringTest: {
        type: OptionType.STRING,
        description: "A test for the 'string' option type."
    },
    numberTest: {
        type: OptionType.NUMBER,
        description: "A test for the 'number' option type."
    },
    bigIntTest: {
        type: OptionType.BIGINT,
        description: "A test for the 'bigint' option type."
    },
    booleanTest: {
        type: OptionType.BOOLEAN,
        description: "A test for the 'boolean' option type."
    },
    selectTest: {
        type: OptionType.SELECT,
        description: "A test for the 'select' option type.",
        options: [
            {
                label: "Value 1",
                value: 0
            },
            {
                label: "Value 2",
                value: 1
            }
        ]
    },
    sliderTest: {
        type: OptionType.SLIDER,
        description: "A test for the 'slider' option type.",
        markers: [ 0, 100 ],
        default: 50
    }
});

export default definePlugin({
    name: "Lpdeck",
    description: "Lpdeck integration with Spotify",
    authors: [Devs.elia],
    required: false,
    startAt: StartAt.ApisLoaded,
    settings,
    events: {
        onPlay: (_) => ws.sendPlayerData(),
        onPause: (_) => ws.sendPlayerData()
    },
    start() {
        ws.connect();
        setInterval(() => ws.sendPlayerData(), 500);
    },
    stop: () => {
        ws.disconnect();
    }
});
