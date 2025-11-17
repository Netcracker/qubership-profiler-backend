import type { CallInfo } from '@app/store/cdt-openapi';
import { type Key } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type CallsStoreModel = {
    graphCollapsed: boolean;
    durationFrom: number;
    columnsOrder: Key[];
    hiddenColumns: Key[];
    selectedCalls?: CallInfo[];
};

type CallsStoreActions = {
    setGraphCollapsed: (collapsed: boolean) => void;
    setDurationFrom: (duration: number) => void;
    setColumnsOrder: (order: Key[]) => void;
    setHiddenColumns: (columns: Key[]) => void;
    setSelectedCalls: (calls: CallInfo[] | undefined) => void;
    // Generic setter for partial updates
    set: (partial: Partial<CallsStoreModel>) => void;
};

type CallsStore = CallsStoreModel & CallsStoreActions;

export const useCallsStoreBase = create<CallsStore>()(
    devtools(
        (set) => ({
            // Initial state
            graphCollapsed: true,
            durationFrom: 10,
            columnsOrder: [],
            hiddenColumns: ['suspend', 'queue-wait-time', 'tx', 'mem'],
            selectedCalls: [],

            // Actions
            setGraphCollapsed: (collapsed) => set({ graphCollapsed: collapsed }),
            setDurationFrom: (duration) => set({ durationFrom: duration }),
            setColumnsOrder: (order) => set({ columnsOrder: order }),
            setHiddenColumns: (columns) => set({ hiddenColumns: columns }),
            setSelectedCalls: (calls) => set({ selectedCalls: calls }),
            set: (partial) => set(partial),
        }),
        { name: 'CallsStore' }
    )
);

/**
 * Hook compatible with old createStoreContext API
 * Returns [value, setter] tuple
 */
export function useCallsStore<R>(selector: (state: CallsStoreModel) => R): [R, (update: Partial<CallsStoreModel>) => void] {
    const value = useCallsStoreBase(selector);
    const set = useCallsStoreBase((state) => state.set);
    return [value, set];
}

/**
 * Hook for read-only access (compatible with old API)
 */
export function useCallsStoreSelector<R>(selector: (state: CallsStoreModel) => R): R {
    return useCallsStoreBase(selector);
}

// No longer needed with zustand, but keeping for backward compatibility during migration
export const CallsStoreProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// No longer needed with zustand, components can use the store directly
export const withCallsStore = <P extends object>(Component: React.ComponentType<P>) => {
    return (props: P) => <Component {...props} />;
};
