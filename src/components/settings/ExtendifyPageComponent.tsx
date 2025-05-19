import "./settingsSection.css";

import { RestartWarningComponent } from "@components/settings";
import { PluginsSectionComponent } from "@components/settings/plugins";

import { React } from "@webpack/common";

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
                    <RestartWarningComponent needRestart={needRestart} themeChanged={themeChanged} />
                </div>
            )}
            <PluginsSectionComponent onRestartNeeded={onRestartNeeded} />
        </>
    );
};
