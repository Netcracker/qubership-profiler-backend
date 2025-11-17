import type { CallStatsInfo } from '@app/store/cdt-openapi';
import type { ColumnsType } from 'antd/es/table';
import prettyMilliseconds from 'pretty-ms';

export type TableData = CallStatsInfo;

export const columnsFactory = (): ColumnsType<TableData> => [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 115,
        render: (value) => value,
    },
    {
        title: 'method itself',
        dataIndex: 'self',
        key: 'self',
        width: 158,
        render: (value, record) => {
            if (record.total) return prettyMilliseconds(Number(value));
            return value;
        },
    },
    {
        title: 'with children',
        dataIndex: 'total',
        key: 'total',
        width: 131,
        render: (value) => {
            if (value) {
                return prettyMilliseconds(value);
            }
        },
    },
];
