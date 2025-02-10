import { PluginOptionSelect } from "@utils/types";
import { ISettingElementProps, textToTitle } from ".";
import { React, Text } from "@webpack/common";
import SelectComponent from "components/SelectComponent";

export default (props: ISettingElementProps<PluginOptionSelect>) => {
    const [state, setState] = React.useState(props.pluginSettings[props.id] ?? props.setting.options?.find(o => o.default)?.value ?? null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => props.onError(error !== null), [error]);

    const onChange = (v: any) => {
        const isValid = props.setting.isValid?.call(props.definedSettings, v) ?? true;
        if (typeof isValid === "string") {
            setError(isValid);
        } else if (!isValid) {
            setError("Invalid input provided.");
        } else {
            setError(null);
        }

        setState(v);
        props.onChange(v);
    }

    return (
        <div className="ext-plugin-setting-container">
            <div className="ext-plugin-setting-metadata">
                <Text as="span" semanticColor="textBase" variant="bodyMediumBold">{textToTitle(props.id)}</Text>
                <Text as="span" semanticColor="textSubdued" variant="bodyMedium">{props.setting.description}</Text>
            </div>
            <SelectComponent id={props.id} options={props.setting.options.map(v => ({
                value: v.value,
                label: v.label
            }))} />
            {error && <Text as="span" semanticColor="textNegative">{error}</Text>}
        </div>
    );
}