import "./settingsSection.css";

import { React } from "@webpack/common";
import PluginsSectionComponent from "./plugins/PluginsSectionComponent";
import ThemesSectionComponent from "./themes/ThemesSectionComponent";
import RestartWarningComponent from "./RestartWarningComponent";

export default () => {
    const [needRestart, _] = React.useState([] as string[]);
    const [themeChanged, setThemeChanged] = React.useState(false);

    const onRestartNeeded = (plugin: string) => {
        needRestart.push(plugin);
    };

    return (
        <>
            {(needRestart.length > 0 || themeChanged) && (
                <div className="ext-settings-section-layout">
                    <RestartWarningComponent
                        needRestart={needRestart}
                        themeChanged={themeChanged}
                    />
                </div>
            )}
            <ThemesSectionComponent setThemeChanged={setThemeChanged} />
            <PluginsSectionComponent onRestartNeeded={onRestartNeeded} />
        </>
    );
};
