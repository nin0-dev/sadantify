import "./uploadThemeModal.css";

import { FileSelectComponent, FileSelectResult, ModalComponent, ModalFooterComponent } from "@components";
import { CSSIcon, JavaScriptIcon } from "@components/icons";

import { PlainSettings, useSettings } from "@api/settings";
import { Renderable } from "@utils/types";
import { ButtonSecondary, React } from "@webpack/common";

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    setThemeChanged?: React.Dispatch<React.SetStateAction<boolean>>;
};

type OptionProps = {
    label?: string;
    icon?: Renderable;
    selectedFile?: FileSelectResult;
    check?: (content: string) => Promise<boolean>;
    onUpload?: (v: FileSelectResult | null) => void;
};

const checkCss = (content: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const style = iframe.contentDocument?.createElement("style");
        if (!style || !iframe.contentDocument) {
            resolve(false);
            iframe.remove();
            return;
        }
        style.onerror = () => {
            resolve(false);
            iframe.remove();
        };
        style.onload = () => {
            if (style.sheet && style.sheet.cssRules.length > 0) {
                resolve(true);
            }
            iframe.remove();
        };
        style.innerText = content;
        iframe.contentDocument.head.appendChild(style);
    });
};

// TODO: Implement checking if JS (and possibly TS) is valid
const checkJs = (content: string): Promise<boolean> => {
    return Promise.resolve(true);
};

const Option = (props: OptionProps) => {
    const [fileUploadOpen, setFileUploadOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<FileSelectResult | null>(props.selectedFile ?? null);

    const Icon = props.icon;

    return (
        <div className="ext-upload-theme-modal-option">
            <FileSelectComponent
                isOpen={fileUploadOpen}
                onChange={async (v) => {
                    if (!props.check || (await props.check(v.content))) {
                        props.onUpload?.(v);
                        setSelectedFile(v);
                    }
                    setFileUploadOpen(false);
                }}
                onCancel={() => setFileUploadOpen(false)}
                onError={() => setFileUploadOpen(false)}
            />
            {Icon && <Icon />}
            <ButtonSecondary
                className="ext-upload-theme-modal-option-select"
                onClick={() => setFileUploadOpen(true)}
                disabled={!!selectedFile}
            >
                {selectedFile ? selectedFile.fileName : props.label}
            </ButtonSecondary>
            {selectedFile && (
                <ButtonSecondary
                    className="ext-upload-theme-modal-option-remove"
                    onClick={() => {
                        setSelectedFile(null);
                        props.onUpload?.(null);
                    }}
                >
                    Remove
                </ButtonSecondary>
            )}
        </div>
    );
};

export default (props: Props) => {
    const settings = useSettings();
    const [tempSettings, _] = React.useState<Record<string, any>>(PlainSettings.theme.files);

    return (
        <ModalComponent isOpen={props.isOpen} onClose={() => props.onClose?.()} animationMs={100} title="Upload Theme">
            <div className="ext-upload-theme-modal-layout">
                <Option
                    label="Upload CSS"
                    icon={CSSIcon}
                    selectedFile={settings.theme.files.css}
                    check={checkCss}
                    onUpload={(v) => (tempSettings.css = v)}
                />
                <Option
                    label="Upload JS"
                    icon={JavaScriptIcon}
                    selectedFile={settings.theme.files.js}
                    check={checkJs}
                    onUpload={(v) => (tempSettings.js = v)}
                />
            </div>
            <ModalFooterComponent
                onConfirm={() => {
                    console.log(tempSettings);
                    console.log(settings.theme.files);
                    settings.theme.files = tempSettings;
                    props.onClose?.();
                }}
                onCancel={() => props.onClose?.()}
            />
        </ModalComponent>
    );
};
