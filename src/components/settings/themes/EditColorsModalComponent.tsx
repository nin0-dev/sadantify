import { ModalComponent, ModalFooterComponent } from "@components";

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
    setThemeChanged?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default (props: Props) => {
    return (
        <ModalComponent isOpen={props.isOpen} onClose={props.onClose} animationMs={100} title="Edit Colors">
            <div className="ext-edit-colors-modal-layout">
                <div className="ext-edit-colors-modal-color">
                    <div className="ext-edit-colors-modal-color-label">Primary</div>
                    <input type="color" className="ext-edit-colors-modal-color-input" value="#000000" />
                </div>
                <div className="ext-edit-colors-modal-color">
                    <div className="ext-edit-colors-modal-color-label">Secondary</div>
                    <input type="color" className="ext-edit-colors-modal-color-input" value="#000000" />
                </div>
                <div className="ext-edit-colors-modal-color">
                    <div className="ext-edit-colors-modal-color-label">Tertiary</div>
                    <input type="color" className="ext-edit-colors-modal-color-input" value="#000000" />
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
    );
};
