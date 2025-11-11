import HighlightCell from '@app/components/highlight-cell/highlight-cell';
import type { StatsInfo } from '@app/store/cdt-openapi';
import type { ColumnsType } from 'antd/es/table';

export type TableData = StatsInfo;

export const columnsFactory = (): ColumnsType<TableData> => [
    {
        title: '',
        key: 'name',
        dataIndex: 'name',
        width: 200,
        render: (value: StatsInfo['name'], record: StatsInfo) => {
            return <span style={{ display: 'inline-flex', gap: 8 }}>{value} </span>;
        },
    },
    {
        title: '',
        key: 'totalTime',
        dataIndex: 'totalTime',
        width: 110,
        render: (value: StatsInfo['totalTime'], record: StatsInfo) => {
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
        key: 'totalTimePercent',
        dataIndex: 'totalTimePercent',
        width: 110,
        render: (value: StatsInfo['totalTimePercent'], record: StatsInfo) => {
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
