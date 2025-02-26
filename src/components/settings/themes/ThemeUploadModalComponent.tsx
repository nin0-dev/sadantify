import { ModalComponent } from "components/ModalComponent";

type Props = {
    isOpen?: boolean;
    onClose?: () => void;
};

export default (props: Props) => {
    return (
        <ModalComponent
            isOpen={props.isOpen}
            onClose={() => props.onClose?.()}
            animationMs={100}
            title="Upload Theme"
        ></ModalComponent>
    );
};
