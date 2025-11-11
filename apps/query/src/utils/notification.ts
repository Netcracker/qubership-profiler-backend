import { notification } from 'antd';
import type { ArgsProps } from 'antd/es/notification';

interface NotificationOptions {
    title?: string;
    description?: string;
    message?: string;
    time?: string;
    key?: string;
    duration?: number;
}

export const uxNotificationHelper = {
    error: ({ title, description, message, time, key, duration }: NotificationOptions) => {
        const desc = description || message;
        const content = time ? `${desc}\n${time}` : desc;

        notification.error({
            message: title || 'Error',
            description: content,
            key,
            duration: duration ?? 4.5,
        });
    },
    success: ({ title, description, message, time, key, duration }: NotificationOptions) => {
        const desc = description || message;
        const content = time ? `${desc}\n${time}` : desc;

        notification.success({
            message: title || 'Success',
            description: content,
            key,
            duration: duration ?? 4.5,
        });
    },
    warning: ({ title, description, message, time, key, duration }: NotificationOptions) => {
        const desc = description || message;
        const content = time ? `${desc}\n${time}` : desc;

        notification.warning({
            message: title || 'Warning',
            description: content,
            key,
            duration: duration ?? 4.5,
        });
    },
    info: ({ title, description, message, time, key, duration }: NotificationOptions) => {
        const desc = description || message;
        const content = time ? `${desc}\n${time}` : desc;

        notification.info({
            message: title || 'Info',
            description: content,
            key,
            duration: duration ?? 4.5,
        });
    },
};
