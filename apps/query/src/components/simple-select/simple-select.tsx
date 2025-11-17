import { Select, type SelectProps } from 'antd';
import { type Key, memo, useCallback, useMemo } from 'react';

export type SimpleSelectValueChange = string | number | boolean | Key[];

export interface SimpleSelectProps extends Omit<SelectProps, 'value' | 'onChange'> {
    value?: string | Key[];

    onChange?: (v?: SimpleSelectValueChange) => void;
}
const SimpleSelect = memo<SimpleSelectProps>(({ value, onChange, options, ...selectProps }) => {
    const selectValue = useMemo(() => {
        const foundOption = options?.find((it: any) => {
            return it.value === value;
        });
        if (!foundOption && !Array.isArray(value)) {
            if (value) {
                return { value: value, label: value };
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
                onChange?.(opt.map((it: any) => it.value));
            } else {
                onChange?.(opt?.value);
            }
        },
        [onChange]
    );

    return <Select value={selectValue} onChange={handleChange} options={options} {...selectProps}></Select>;
});

SimpleSelect.displayName = 'SimpleSelect';

export default SimpleSelect;
