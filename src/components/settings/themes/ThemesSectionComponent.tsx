import "./themes.css";
import "../settingsSection.css";

import { useSettings } from "@api/settings";
import { ButtonSecondary, React, Text } from "@webpack/common";
import FileSelectComponent from "components/FileSelectComponent";

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

export default (props: {
    setThemeChanged: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const settings = useSettings();
    const [fileUploadOpen, setFileUploadOpen] = React.useState(false);

    const hasTheme = settings.theme.files.css || settings.theme.files.js;

    return (
        <div className="ext-settings-section-layout">
            <div className="ext-plugins-page-header">
                <Text as="h1" variant="titleMedium" semanticColor="textBase">
                    Themes
                </Text>
            </div>
            <div className="themes-upload-container">
                <FileSelectComponent
                    isOpen={fileUploadOpen}
                    onChange={async (e) => {
                        if (await checkCss(e.content)) {
                            settings.theme.files.css = e.content;
                            props.setThemeChanged(true);
                        }
                        setFileUploadOpen(false);
                    }}
                    onCancel={() => setFileUploadOpen(false)}
                    onError={() => setFileUploadOpen(false)}
                />
                <ButtonSecondary onClick={() => setFileUploadOpen(true)}>
                    Upload Theme
                </ButtonSecondary>
                <ButtonSecondary>Edit Colors</ButtonSecondary>
            </div>
            <ButtonSecondary disabled={!hasTheme}>Edit Theme</ButtonSecondary>
            <ButtonSecondary
                disabled={!hasTheme}
                onClick={() => {
                    settings.theme.files.css = settings.theme.files.js =
                        undefined;
                    props.setThemeChanged(true);
                }}
            >
                <Text
                    as="span"
                    variant="bodyMediumBold"
                    semanticColor="textNegative"
                >
                    Remove Theme
                </Text>
            </ButtonSecondary>
        </div>
    );
};
