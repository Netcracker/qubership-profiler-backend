import { Modal } from 'antd';
import type { ModalFuncProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React from 'react';

let confirmInstance: ReturnType<typeof Modal.confirm> | null = null;

export interface ConfirmOptions extends ModalFuncProps {
    title?: React.ReactNode;
    content?: React.ReactNode;
    onOk?: () => void | Promise<void>;
    onCancel?: () => void;
}

export function confirmApiFactory() {
    const confirm = (options: ConfirmOptions) => {
        confirmInstance = Modal.confirm(options);
        return confirmInstance;
    };

    const confirmDelete = (options: ConfirmOptions) => {
        return confirm({
            title: 'Are you sure you want to delete this item?',
            icon: <ExclamationCircleOutlined />,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            ...options,
        });
    };

    const destroyConfirm = () => {
        if (confirmInstance) {
            confirmInstance.destroy();
            confirmInstance = null;
        }
    };

    const updateConfirm = (options: ConfirmOptions) => {
        if (confirmInstance) {
            confirmInstance.update(options);
        }
    };

    const asyncConfirm = async (options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            confirm({
                ...options,
                onOk: async () => {
                    if (options.onOk) {
                        await options.onOk();
                    }
                    resolve(true);
                },
                onCancel: () => {
                    if (options.onCancel) {
                        options.onCancel();
                    }
                    resolve(false);
                },
            });
        });
    };

    const ConfirmMountPoint = () => null;

    return { ConfirmMountPoint, confirm, confirmDelete, destroyConfirm, updateConfirm, asyncConfirm };
}
