import type { CallInfo } from '@app/store/cdt-openapi';
import { createStoreContext } from '@app/utils/create-store-context';
import { type FC, type Key } from 'react';

type CallsStoreModel = {
    graphCollapsed: boolean;

    durationFrom: number;

    columnsOrder: Key[];

    hiddenColumns: Key[];

    selectedCalls?: CallInfo[];
};
const storeContext = createStoreContext<CallsStoreModel>({
    graphCollapsed: true,
    durationFrom: 10,

    columnsOrder: [],
    hiddenColumns: ['suspend', 'queue-wait-time', 'tx', 'mem'],
    selectedCalls: [],
});

export const CallsStoreProvider = storeContext.Provider;
export const useCallsStore = storeContext.useStore;
export const useCallsStoreSelector = storeContext.useStoreSelector;
// eslint-disable-next-line react/display-name
export const withCallsStore = (Component: FC) => () => {
    return (
        <CallsStoreProvider>
            <Component />
        </CallsStoreProvider>
    );
};
