import { DatePicker } from 'antd';
import type { DatePickerProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import React from 'react';

export interface IsoDatePickerProps extends Omit<DatePickerProps, 'value' | 'onChange'> {
    label?: string;
    value?: string;
    time?: boolean;
    onChange?: (value?: string) => void;
    format?: (value: Moment) => string;
    disabledDate?: (current: Moment) => boolean;
}

export const IsoDatePicker: React.FC<IsoDatePickerProps> = ({
    label,
    value,
    time,
    onChange,
    format,
    ...props
}) => {
    const momentValue = value ? moment(value) : undefined;

    const handleChange = (date: Moment | null) => {
        if (onChange) {
            onChange(date ? date.toISOString() : undefined);
        }
    };

    return (
        <div className="iso-date-picker">
            {label && <label className="iso-date-picker-label">{label}</label>}
            <DatePicker
                {...props}
                value={momentValue}
                onChange={handleChange}
                showTime={time}
                format={format ? (value) => format(value as Moment) : undefined}
            />
        </div>
    );
};
