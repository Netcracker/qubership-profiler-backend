import type { ComponentType } from 'react';

export type UxInputWrapper<P = any> = ComponentType<P> & {
    __UX_INPUT?: boolean;
};
