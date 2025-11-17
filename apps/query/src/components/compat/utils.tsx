import { notification } from 'antd';
import React from 'react';

export const downloadFile = (url: string, filename?: string) => {
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
        link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const uxNotificationHelper = {
    success: (message: string, description?: string) => {
        notification.success({ message, description });
    },
    error: (message: string, description?: string) => {
        notification.error({ message, description });
    },
    warning: (message: string, description?: string) => {
        notification.warning({ message, description });
    },
    info: (message: string, description?: string) => {
        notification.info({ message, description });
    },
};

export const usePopupVisibleState = (initialValue = false) => {
    const [visible, setVisible] = React.useState(initialValue);

    return {
        visible,
        open: () => setVisible(true),
        close: () => setVisible(false),
        toggle: () => setVisible(!visible),
    };
};
