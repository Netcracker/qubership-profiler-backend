import { Modal } from 'antd';
import type { ModalFuncProps } from 'antd';

export function confirmApiFactory() {
    const confirm = (props: ModalFuncProps) => {
        return Modal.confirm(props);
    };

    const confirmDelete = (props: ModalFuncProps) => {
        return Modal.confirm({
            title: 'Delete Confirmation',
            okText: 'Delete',
            okType: 'danger',
            ...props,
        });
    };

    const asyncConfirm = async (props: ModalFuncProps): Promise<boolean> => {
        return new Promise((resolve) => {
            Modal.confirm({
                ...props,
                onOk: () => {
                    resolve(true);
                },
                onCancel: () => {
                    resolve(false);
                },
            });
        });
    };

    const destroyConfirm = () => {
        Modal.destroyAll();
    };

    const updateConfirm = (props: ModalFuncProps) => {
        // Ant Design v5 doesn't have a direct update method for Modal.confirm
        // We'll just show a new modal
        return confirm(props);
    };

    const ConfirmMountPoint = () => null;

    return {
        ConfirmMountPoint,
        confirm,
        confirmDelete,
        destroyConfirm,
        updateConfirm,
        asyncConfirm,
    };
}
