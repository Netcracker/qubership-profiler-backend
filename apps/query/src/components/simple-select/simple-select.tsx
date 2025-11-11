import type { UxInputWrapper } from '@app/utils/ux-input-wrapper';
import { Select } from 'antd';
import type { SelectProps } from 'antd';
import { type Key, memo, useCallback, useMemo, type FC } from 'react';

export type SimpleSelectValueChange = string | number | boolean | Key[];

type SelectValue = { value: string | number; label: string | number };

export interface SimpleSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
    value?: string | Key[];

    onChange?: (v?: SimpleSelectValueChange) => void;
}
const SimpleSelectComponent: FC<SimpleSelectProps> = memo(({ value, onChange, options, ...selectProps }) => {
    const selectValue = useMemo(() => {
        const foundOption = options?.find(it => {
            const option = it as SelectValue;
            return option.value === value;
        }) as SelectValue;
        if (!foundOption && !Array.isArray(value)) {
            if (value) {
                return { value: value, label: value } as SelectValue;
            }
        }
        if (!foundOption && Array.isArray(value)) {
            return value.map(it => ({ value: it, label: it }));
        }

        return foundOption;
    }, [options, value]);

    const handleChange = useCallback(
        (opt: any) => {
            if (Array.isArray(opt)) {
                onChange?.(opt.map(it => it.value));
            } else {
                onChange?.(opt?.value);
            }
        },
        [onChange]
    );

    return <Select value={selectValue} onChange={handleChange} options={options} {...selectProps}></Select>;
});

SimpleSelectComponent.displayName = 'SimpleSelect';

const SimpleSelect = SimpleSelectComponent as UxInputWrapper<SimpleSelectProps>;
SimpleSelect.__UX_INPUT = true;

export default SimpleSelect;
