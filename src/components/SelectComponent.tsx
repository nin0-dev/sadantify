import "./select.css";

export type Option = {
    value: any;
    label: string;
};

type Props = {
    value?: Option;
    options: Option[];
    id: string;
    onSelect?: (option: Option) => void;
};

export default (props: Props) => {
    return (
        <div className="ext-select-container">
            <span>
                <select
                    id={props.id}
                    className="ext-select-select"
                    onChange={(e) =>
                        props.onSelect?.(props.options[e.target.selectedIndex])
                    }
                >
                    {props.options.map((v) => (
                        <option
                            selected={props.value && Object.is(v, props.value)}
                            value={v.value}
                        >
                            {v.label}
                        </option>
                    ))}
                </select>
            </span>
        </div>
    );
};
