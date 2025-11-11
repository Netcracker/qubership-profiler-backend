import React, { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';

type StoreValue<T> = [T, Dispatch<SetStateAction<Partial<T>>>];

export function createStoreContext<T extends Record<string, any>>(initialState: T) {
    const StoreContext = createContext<StoreValue<T> | undefined>(undefined);

    const Provider = ({ children }: { children: ReactNode }) => {
        const [state, setState] = useState<T>(initialState);

        const setter: Dispatch<SetStateAction<Partial<T>>> = (action) => {
            if (typeof action === 'function') {
                setState((prev) => ({ ...prev, ...action(prev) }));
            } else {
                setState((prev) => ({ ...prev, ...action }));
            }
        };

        return <StoreContext.Provider value={[state, setter]}>{children}</StoreContext.Provider>;
    };

    const useStore = <R = T>(selector: (state: T) => R): [R, Dispatch<SetStateAction<Partial<T>>>] => {
        const context = useContext(StoreContext);
        if (context === undefined) {
            throw new Error('useStore must be used within a StoreProvider');
        }
        const [state, setState] = context;
        return [selector(state), setState];
    };

    const useStoreSelector = <R,>(selector: (state: T) => R): R => {
        const context = useContext(StoreContext);
        if (context === undefined) {
            throw new Error('useStoreSelector must be used within a StoreProvider');
        }
        const [state] = context;
        return selector(state);
    };

    return { Provider, useStore, useStoreSelector };
}
