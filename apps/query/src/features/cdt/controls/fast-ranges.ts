import dayjs from 'dayjs';

export type Range = {
    readonly label: string;
    readonly unit: 'minute' | 'hour' | 'day' | 'week' | 'month';
    readonly value: number;
};

export const fastRanges: Readonly<Range[]> = [
    {
        label: 'Last 15 min',
        unit: 'minute',
        value: 15,
    },
    {
        label: 'Last 1 h',
        unit: 'hour',
        value: 1,
    },
    {
        label: 'Last 2 h',
        unit: 'hour',
        value: 2,
    },
    {
        label: 'Last 4 h',
        unit: 'hour',
        value: 4,
    },
];

export const defaultSelectedRange = fastRanges[0]!;
export const defaultRange = {
    dateFrom: dayjs()
        .subtract(defaultSelectedRange.value, defaultSelectedRange.unit)
        .valueOf()
        .toString(),
    dateTo: dayjs().valueOf().toString(),
};
