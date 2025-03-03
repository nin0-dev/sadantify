import { ExtendifyPageComponent } from "@components/settings";

import { Devs } from "@utils/constants";
import { redirectTo } from "@utils/spotify";
import { definePlugin } from "@utils/types";
import { ButtonPrimary } from "@webpack/common";

export default definePlugin({
    name: "Settings",
    description: "Adds a settings UI",
    authors: [Devs.elia],
    required: true,
    components: {
        renderTopbar: () => (
            <ButtonPrimary buttonSize="sm" onClick={(_: any) => redirectTo("/extendify")}>
                Extendify
            </ButtonPrimary>
        )
    },
    pages: {
        "/extendify": () => <ExtendifyPageComponent />
    }
});
