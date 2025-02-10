import "./plugins.css";

import { ButtonSecondary, FilterProvider, platform, SearchBar, Text } from "@webpack/common";
import { plugins } from "plugins";
import { useRef, React } from "@webpack/common";
import PluginComponent from "./PluginComponent";

export default () => {
    const outerRef: React.RefObject<HTMLDivElement | null> = useRef(null);
    const [needRestart, _] = React.useState([] as string[]);
    const [searchQuery, setSearchQuery] = React.useState("");

    const onRestartNeeded = (plugin: string) => {
        needRestart.push(plugin);
    };

    return (
        <>
            <div className="ext-plugins-page-layout" ref={outerRef}>
                <div className="ext-plugins-page-header">
                    <Text as="h1" variant="titleMedium" semanticColor="textBase">Plugins</Text>
                    <div>
                        <FilterProvider>
                            <SearchBar
                                placeholder="Search Plugins..."
                                alwaysExpanded={false}
                                debounceFilterChangeTimeout={0}
                                onFilter={v => setSearchQuery(v)}
                                clearOnEscapeInElementRef={outerRef}
                            />
                        </FilterProvider>
                    </div>
                </div>
                {needRestart.length > 0 ? <div className="ext-warning-container">
                    <Text as="h1" variant="titleMedium" semanticColor="textWarning">
                        Restart Required
                    </Text>
                    <div className="ext-warning-content">
                        <Text as="span" variant="bodyMedium" semanticColor="textSubdued">
                            The following plugins require you to restart Spotify for changes to take effect:
                        </Text>
                        <ol>
                            {needRestart.map(v => (
                                <li key={v}>
                                    <Text as="span" variant="bodyMediumBold" semanticColor="textBase">•&nbsp;{v}</Text>
                                </li>
                            ))}
                        </ol>
                        <ButtonSecondary className="ext-warning-restart" onClick={(_: any) => platform.getRegistry().resolve<{ applyUpdate(): any; }>(Symbol.for("UpdateAPI")).applyUpdate()}>Click to Restart</ButtonSecondary>
                    </div>
                </div> : <></>}
                <Text as="span" variant="bodyMediumBold" semanticColor="textSubdued">Plugins</Text>
                <div className="ext-plugins-grid">
                    {
                        Object.values(plugins)
                            .filter(v => searchQuery === "" || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.description.toLowerCase().includes(searchQuery.toLowerCase()))
                            .filter(v => !v.required && !v.hidden)
                            .map(v => <PluginComponent onRestartNeeded={onRestartNeeded} plugin={v} />)
                    }
                </div>
                <Text as="span" variant="bodyMediumBold" semanticColor="textSubdued">Required</Text>
                <div className="ext-plugins-grid">
                    {
                        Object.values(plugins)
                            .filter(v => searchQuery === "" || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.description.toLowerCase().includes(searchQuery.toLowerCase()))
                            .filter(v => v.required && !v.hidden)
                            .map(v => <PluginComponent onRestartNeeded={onRestartNeeded} plugin={v} />)
                    }
                </div>
            </div>
        </>
    );
}
