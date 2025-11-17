import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { FC } from 'react';

export interface IsoDatePickerProps {
    label?: string;
    value?: string;
    onChange?: (value?: string) => void;
    time?: boolean;
    disabledDate?: (date: Dayjs) => boolean;
    format?: (date: Dayjs) => string;
}

export const IsoDatePicker: FC<IsoDatePickerProps> = ({
    label,
    value,
    onChange,
    time,
    disabledDate,
    format,
}) => {
    const dayjsValue = value ? dayjs(value) : undefined;

    const handleChange = (date: Dayjs | null) => {
        if (onChange) {
            onChange(date ? date.toISOString() : undefined);
        }
    };

    return (
        <div>
            {label && <div style={{ marginBottom: 8, fontSize: 14 }}>{label}</div>}
            <DatePicker
                showTime={time}
                value={dayjsValue}
                onChange={handleChange}
                disabledDate={disabledDate}
                format={format ? (date) => format(date) : time ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'}
                style={{ width: '100%' }}
            />
        </div>
    );
};
