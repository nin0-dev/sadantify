import "./extendifyPage.css";

import { platform, ButtonSecondary, Text } from "@webpack/common";
import { React } from "@webpack/common";
import PluginsSectionComponent from "./plugins/PluginsSectionComponent";
import ThemesSectionComponent from "./themes/ThemesSectionComponent";

export default () => {
    const [needRestart, _] = React.useState([] as string[]);
    const [themeChanged, setThemeChanged] = React.useState(false);

    const onRestartNeeded = (plugin: string) => {
        needRestart.push(plugin);
    };

    return (
        <>
            {(needRestart.length > 0 || themeChanged) && (
                <div className="ext-plugins-page-layout">
                    <div className="ext-warning-container">
                        <Text
                            as="h1"
                            variant="titleMedium"
                            semanticColor="textWarning"
                        >
                            Restart Required
                        </Text>
                        <div className="ext-warning-content">
                            <Text
                                as="span"
                                variant="bodyMedium"
                                semanticColor="textSubdued"
                            >
                                {themeChanged
                                    ? "A restart is required to apply the theme changes."
                                    : "The following plugins require you to restart Spotify for changes to take effect:"}
                            </Text>
                            {!themeChanged && (
                                <ol>
                                    {needRestart.map((v) => (
                                        <li key={v}>
                                            <Text
                                                as="span"
                                                variant="bodyMediumBold"
                                                semanticColor="textBase"
                                            >
                                                •&nbsp;{v}
                                            </Text>
                                        </li>
                                    ))}
                                </ol>
                            )}
                            <ButtonSecondary
                                className="ext-warning-restart"
                                onClick={(_: any) =>
                                    platform
                                        .getRegistry()
                                        .resolve<{
                                            applyUpdate(): any;
                                        }>(Symbol.for("UpdateAPI"))
                                        .applyUpdate()
                                }
                            >
                                Click to Restart
                            </ButtonSecondary>
                        </div>
                    </div>
                </div>
            )}
            <ThemesSectionComponent setThemeChanged={setThemeChanged} />
            <PluginsSectionComponent onRestartNeeded={onRestartNeeded} />
        </>
    );
};
