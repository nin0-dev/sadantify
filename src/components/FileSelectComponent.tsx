import { React } from "@webpack/common";

export type FileSelectResult = { fileName: string; content: string };

type Props = {
    isOpen: boolean;
    onChange: (e: FileSelectResult) => void;
    onCancel?: () => void;
    onError?: (message: string) => void;
};

export default (props: Props) => {
    const ref = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (ref.current && props.isOpen) {
            ref.current.click();
        }
    }, [ref, props.isOpen]);

    return (
        <>
            <input
                ref={ref}
                className="wcftliF4QjZKB1CYgEON"
                type="file"
                onChange={(e) => {
                    if (!e.target.files || e.target.files.length === 0) {
                        return props.onCancel?.();
                    }

                    const reader = new FileReader();
                    reader.onload = () => {
                        props.onChange({
                            fileName: e.target.files![0].name,
                            content: reader.result?.toString() ?? ""
                        });
                    };
                    reader.onerror = () => props.onCancel?.();
                    reader.readAsText(e.target.files[0]);
                }}
            />
        </>
    );
};
