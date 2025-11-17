import HighlightCell from '@app/components/highlight-cell/highlight-cell';
import type { StatsInfo } from '@app/store/cdt-openapi';
import type { ColumnsType } from 'antd/es/table';

export type TableData = StatsInfo;

export const columnsFactory = (): ColumnsType<TableData> => [
    {
        title: '',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (value) => {
            return <span style={{ display: 'inline-flex', gap: 8 }}>{value} </span>;
        },
    },
    {
        title: '',
        dataIndex: 'totalTime',
        key: 'totalTime',
        width: 110,
        render: (value) => {
            return (
                value && (
                    <span style={{ height: 13, display: 'inline-flex', gap: 8, fontWeight: 500 }}>
                        {value}
                        {' ms'}
                    </span>
                )
            );
        },
    },
    {
        title: '',
        dataIndex: 'totalTimePercent',
        key: 'totalTimePercent',
        width: 110,
        render: (value) => {
            return (
                value && (
                    <HighlightCell highlight={value > 90} >
                        {'(' + value.toFixed(2) + '%)'}
                    </HighlightCell>
                )
            );
        },
    },
];
