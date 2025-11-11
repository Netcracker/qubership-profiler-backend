import { useState, useCallback } from 'react';

export function usePopupVisibleState(initialValue = false): [boolean, () => void, () => void, () => void] {
    const [visible, setVisible] = useState(initialValue);

    const show = useCallback(() => {
        setVisible(true);
    }, []);

    const hide = useCallback(() => {
        setVisible(false);
    }, []);

    const toggle = useCallback(() => {
        setVisible((prev) => !prev);
    }, []);

    return [visible, show, hide, toggle];
}
