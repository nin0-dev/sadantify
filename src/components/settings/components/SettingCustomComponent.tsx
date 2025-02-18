import { PluginOptionComponent } from "@utils/types";
import { ISettingCustomElementProps } from ".";

export default (props: ISettingCustomElementProps<PluginOptionComponent>) => {
    return props.setting.component({
        setValue: props.onChange,
        setError: props.onError,
        setting: props.setting
    });
};
