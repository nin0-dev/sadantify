import "./themes.css";
import "../settingsSection.css";

import { useSettings } from "@api/settings";
import { ButtonSecondary, React, Text } from "@webpack/common";
import UploadThemeModalComponent from "./UploadThemeModalComponent";

export default (props: {
    setThemeChanged: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const settings = useSettings();

    const [uploadModalOpen, setUploadModalOpen] = React.useState(false);
    const [colorModalOpen, setColorModalOpen] = React.useState(false);

    const hasTheme = settings.theme.files.css || settings.theme.files.js;

    return (
        <div className="ext-settings-section-layout">
            <div className="ext-plugins-page-header">
                <Text as="h1" variant="titleMedium" semanticColor="textBase">
                    Themes
                </Text>
            </div>
            <div className="themes-upload-container">
                <UploadThemeModalComponent
                    isOpen={uploadModalOpen}
                    onClose={() => setUploadModalOpen(false)}
                    setThemeChanged={props.setThemeChanged}
                />
                <ButtonSecondary onClick={() => setUploadModalOpen(true)}>
                    Upload Theme
                </ButtonSecondary>
                <ButtonSecondary onClick={() => setColorModalOpen(true)}>
                    Edit Colors
                </ButtonSecondary>
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
