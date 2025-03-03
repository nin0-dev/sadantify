import "../settingsSection.css";
import "./plugins.css";

import { PluginComponent } from "@components/settings/plugins";

import { FilterProvider, React, SearchBar, Text, useRef } from "@webpack/common";

import { plugins } from "plugins";

export default (props: { onRestartNeeded: (plugin: string) => void }) => {
    const outerRef: React.RefObject<HTMLDivElement | null> = useRef(null);
    const [searchQuery, setSearchQuery] = React.useState("");

    return (
        <div className="ext-settings-section-layout" ref={outerRef}>
            <div className="ext-settings-section-header">
                <Text as="h1" variant="titleMedium" semanticColor="textBase">
                    Plugins
                </Text>
                <div>
                    <FilterProvider>
                        <SearchBar
                            placeholder="Search Plugins..."
                            alwaysExpanded={false}
                            debounceFilterChangeTimeout={0}
                            onFilter={(v) => setSearchQuery(v)}
                            clearOnEscapeInElementRef={outerRef}
                        />
                    </FilterProvider>
                </div>
            </div>
            <Text as="span" variant="bodyMediumBold" semanticColor="textSubdued">
                Plugins
            </Text>
            <div className="ext-plugins-grid">
                {Object.values(plugins)
                    .filter(
                        (v) =>
                            searchQuery === "" ||
                            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .filter((v) => !v.required && !v.hidden)
                    .map((v) => (
                        <PluginComponent onRestartNeeded={props.onRestartNeeded} plugin={v} />
                    ))}
            </div>
            <Text as="span" variant="bodyMediumBold" semanticColor="textSubdued">
                Required
            </Text>
            <div className="ext-plugins-grid">
                {Object.values(plugins)
                    .filter(
                        (v) =>
                            searchQuery === "" ||
                            v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            v.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .filter((v) => v.required && !v.hidden)
                    .map((v) => (
                        <PluginComponent onRestartNeeded={props.onRestartNeeded} plugin={v} />
                    ))}
            </div>
        </div>
    );
};
