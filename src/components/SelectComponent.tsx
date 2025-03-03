import "./select.css";

export type SelectOption = {
    value: any;
    label: string;
};

type Props = {
    value?: SelectOption;
    options: SelectOption[];
    id: string;
    onSelect?: (option: SelectOption) => void;
};

export default (props: Props) => {
    return (
        <div className="ext-select-container">
            <span>
                <select
                    id={props.id}
                    className="ext-select-select"
                    onChange={(e) => props.onSelect?.(props.options[e.target.selectedIndex])}
                >
                    {props.options.map((v) => (
                        <option selected={props.value && Object.is(v, props.value)} value={v.value}>
                            {v.label}
                        </option>
                    ))}
                </select>
            </span>
        </div>
    );
};
