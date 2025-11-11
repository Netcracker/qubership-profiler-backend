import type { CallParameter } from '@app/store/cdt-openapi';
import type { ColumnsType } from 'antd/es/table';

export type TableData = CallParameter;

export const columnsFactory = (): ColumnsType<TableData> => [
    {
        title: 'Parameter',
        key: 'id',
        dataIndex: 'id',
        render: (value: CallParameter['id'], record: CallParameter) => {
            return value;
        },
    },
];
