import "./select.css";

type Props = {
    options: {
        value: any;
        label: string;
    }[];
    id: string;
}

export default (props: Props) => {
    return (
        <div className="ext-select-container">
            <span>
                <select id={props.id} className="ext-select-select">
                    {props.options.map(v => (
                        <option value={v.value}>{v.label}</option>
                    ))}
                </select>
            </span>
        </div>
    );
};
