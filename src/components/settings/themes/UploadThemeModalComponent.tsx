import "./uploadThemeModal.css";

import { useSettings } from "@api/settings";
import { ButtonSecondary, React } from "@webpack/common";
import FileSelectComponent from "components/FileSelectComponent";
import CSSIcon from "components/icons/CSSIcon";
import JavaScriptIcon from "components/icons/JavaScriptIcon";
import { ModalComponent } from "components/modal/ModalComponent";
import ModalFooterComponent from "components/modal/ModalFooterComponent";

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    setThemeChanged?: React.Dispatch<React.SetStateAction<boolean>>;
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

export default (props: Props) => {
    const settings = useSettings();
    const [fileUploadOpen, setFileUploadOpen] = React.useState(false);

    return (
        <>
            <FileSelectComponent
                isOpen={fileUploadOpen}
                onChange={async (e) => {
                    if (await checkCss(e.content)) {
                        settings.theme.files.css = e.content;
                        props.setThemeChanged?.(true);
                    }
                    setFileUploadOpen(false);
                }}
                onCancel={() => setFileUploadOpen(false)}
                onError={() => setFileUploadOpen(false)}
            />
            <ModalComponent
                isOpen={props.isOpen}
                onClose={() => props.onClose?.()}
                animationMs={100}
                title="Upload Theme"
            >
                <div className="ext-upload-theme-modal-layout">
                    <div className="ext-upload-theme-modal-option">
                        <CSSIcon />
                        <ButtonSecondary
                            onClick={() => setFileUploadOpen(true)}
                        >
                            Upload CSS
                        </ButtonSecondary>
                    </div>
                    <div className="ext-upload-theme-modal-option">
                        <JavaScriptIcon />
                        <ButtonSecondary
                            onClick={() => setFileUploadOpen(true)}
                        >
                            Upload JS
                        </ButtonSecondary>
                    </div>
                </div>
                <ModalFooterComponent
                    onConfirm={() => {
                        props.setThemeChanged?.(true);
                        props.onClose?.();
                    }}
                    onCancel={() => props.onClose?.()}
                />
            </ModalComponent>
        </>
    );
};
