import "./uploadThemeModal.css";

import { useSettings } from "@api/settings";
import { Renderable } from "@utils/types";
import { ButtonSecondary, React } from "@webpack/common";
import FileSelectComponent, {
    FileSelectResult
} from "components/FileSelectComponent";
import CSSIcon from "components/icons/CSSIcon";
import JavaScriptIcon from "components/icons/JavaScriptIcon";
import { ModalComponent } from "components/modal/ModalComponent";
import ModalFooterComponent from "components/modal/ModalFooterComponent";

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    setThemeChanged?: React.Dispatch<React.SetStateAction<boolean>>;
};

type OptionProps = {
    label?: string;
    icon?: Renderable;
    selectedFile?: FileSelectResult;
    onUpload?: (v: FileSelectResult) => void;
};

const checkCss = (content: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.style.width = iframe.style.height = "0";
        document.body.appendChild(iframe);

        const style = iframe.contentDocument?.createElement("style");
        if (!style || !iframe.contentDocument) {
            resolve(false);
            return;
        }
        style.onerror = () => {
            resolve(false);
        };
        style.onload = () => {
            console.dir(style);
            if (style.sheet && style.sheet.cssRules.length > 0) {
                console.log("RESOLVED");
                resolve(true);
            }
            iframe.remove();
        };
        style.innerText = content;
        iframe.contentDocument.head.appendChild(style);
    });
};

const checkJs = (content: string): Promise<boolean> => {
    return Promise.resolve(true);
};

const Option = (props: OptionProps) => {
    const [fileUploadOpen, setFileUploadOpen] = React.useState(false);
    const [selectedFile, setSelectedFile] =
        React.useState<FileSelectResult | null>(props.selectedFile ?? null);

    const Icon = props.icon;

    return (
        <div className="ext-upload-theme-modal-option">
            <FileSelectComponent
                isOpen={fileUploadOpen}
                onChange={(v) => {
                    props.onUpload?.(v);
                    setSelectedFile(v);
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
                    onClick={() => setSelectedFile(null)}
                >
                    Remove
                </ButtonSecondary>
            )}
        </div>
    );
};

export default (props: Props) => {
    const settings = useSettings();
    const [tempSettings, _] = React.useState<Record<string, any>>({
        files: {}
    });

    return (
        <>
            <ModalComponent
                isOpen={props.isOpen}
                onClose={() => props.onClose?.()}
                animationMs={100}
                title="Upload Theme"
            >
                <div className="ext-upload-theme-modal-layout">
                    <Option
                        label="Upload CSS"
                        icon={CSSIcon}
                        selectedFile={settings.theme.files.css}
                        onUpload={async (v) => {
                            if (await checkCss(v.content)) {
                                tempSettings.css = v;
                            }
                        }}
                    />
                    <Option
                        label="Upload JS"
                        icon={JavaScriptIcon}
                        selectedFile={settings.theme.files.js}
                        onUpload={async (v) => {
                            if (await checkJs(v.content)) {
                                tempSettings.js = v;
                            }
                        }}
                    />
                </div>
                <ModalFooterComponent
                    onConfirm={() => {
                        settings.theme.files = tempSettings;
                        props.setThemeChanged?.(true);
                        props.onClose?.();
                    }}
                    onCancel={() => props.onClose?.()}
                />
            </ModalComponent>
        </>
    );
};
