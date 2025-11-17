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

export const highlight = (text: string, search: string): React.ReactNode => {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, index) =>
        part.toLowerCase() === search.toLowerCase() ? (
            <mark key={index} className="mark-text">
                {part}
            </mark>
        ) : (
            part
        )
    );
};

export const createStoreContext = <T extends Record<string, any>>(defaultValue: T) => {
    const StateContext = React.createContext<T>(defaultValue);
    const SetStateContext = React.createContext<React.Dispatch<React.SetStateAction<T>>>(() => {});

    const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        const [state, setState] = React.useState<T>(defaultValue);
        return (
            <StateContext.Provider value={state}>
                <SetStateContext.Provider value={setState}>
                    {children}
                </SetStateContext.Provider>
            </StateContext.Provider>
        );
    };

    const useStore = <R,>(selector: (state: T) => R): [R, (update: Partial<T>) => void] => {
        const state = React.useContext(StateContext);
        const setState = React.useContext(SetStateContext);

        const selectedValue = selector(state);
        const setPartialState = React.useCallback((update: Partial<T>) => {
            setState(prev => ({ ...prev, ...update }));
        }, [setState]);

        return [selectedValue, setPartialState];
    };

    const useStoreSelector = <R,>(selector: (state: T) => R): R => {
        const state = React.useContext(StateContext);
        return selector(state);
    };

    return {
        Provider,
        useStore,
        useStoreSelector,
    };
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
