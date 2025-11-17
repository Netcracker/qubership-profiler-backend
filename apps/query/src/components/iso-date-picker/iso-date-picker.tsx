import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React from 'react';

export interface IsoDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
    label?: string;
    value?: string;
    time?: boolean;
    onChange?: (value?: string) => void;
    format?: (value: Dayjs) => string;
    disabledDate?: (current: Dayjs) => boolean;
}

export const IsoDatePicker: React.FC<IsoDatePickerProps> = ({
    label,
    value,
    time,
    onChange,
    format,
    ...props
}) => {
    const dayjsValue = value ? dayjs(value) : undefined;

    const handleChange = (date: Dayjs | null) => {
        if (onChange) {
            onChange(date ? date.toISOString() : undefined);
        }
    };

    return (
        <div className="iso-date-picker">
            {label && <label className="iso-date-picker-label">{label}</label>}
            <DatePicker
                {...props}
                value={dayjsValue}
                onChange={handleChange}
                showTime={time}
                format={format ? (value) => format(value as Dayjs) : undefined}
            />
        </div>
    );
};
