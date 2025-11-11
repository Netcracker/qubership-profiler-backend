import type { CallStatsInfo } from '@app/store/cdt-openapi';
import type { ColumnsType } from 'antd/es/table';
import prettyMilliseconds from 'pretty-ms';

export type TableData = CallStatsInfo;

export const columnsFactory = (): ColumnsType<TableData> => [
    {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        width: 115,
        render: (value: any) => {
            return value;
        },
    },
    {
        title: 'method itself',
        key: 'self',
        dataIndex: 'self',
        width: 158,
        render: (value: any, record: CallStatsInfo) => {
            if (record.total) return prettyMilliseconds(Number(value));
            return value;
        },
    },
    {
        title: 'with children',
        key: 'total',
        dataIndex: 'total',
        width: 131,
        render: (value: any) => {
            if (value) {
                return prettyMilliseconds(value);
            }
        },
    },
];
