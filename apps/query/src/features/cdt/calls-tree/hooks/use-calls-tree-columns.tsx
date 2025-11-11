import type { CallsTreeInfo } from '@app/store/cdt-openapi';
import { Progress } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import TraceButton from '../call-tree-entity/calls-tree-table/trace-button/trace-button';
import { useAppSelector } from '@app/store/hooks';
import { selectCallsTreeState } from '@app/store/slices/calls-tree-context-slices';
import prettyMilliseconds from 'pretty-ms';
import CallsTreeSearchedElement from '../call-tree-entity/calls-tree-table/calls-tree-searched-element';
import ParamsButton from '../call-tree-entity/calls-tree-table/params-button/params-button';

export type TableData = CallsTreeInfo;

export const DEFAULT_CALLS_COLUMNS: ColumnsType<TableData> = [
    {
        title: 'Method',
        key: 'info',
        dataIndex: 'info',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={record.info.title} />,
        width: 437,
    },
    {
        key: 'params',
        title: '',
        dataIndex: 'params',
        render: (_: any, record: CallsTreeInfo) => (record.params ? <ParamsButton row={record} /> : null),
        width: 43,
    },
    {
        key: 'hasStackTrace',
        title: '',
        dataIndex: 'info',
        render: (_: any, record: CallsTreeInfo) =>
            record.info.hasStackTrace ? <TraceButton text={record.info.trace || ''} /> : null,
        width: 43,
    },
    {
        key: 'totalTimePerc',
        title: 'Total time, %',
        dataIndex: 'info',
        render: (_: any, record: CallsTreeInfo) => (
            <Progress
                className="progress-bar"
                percent={record.timePercent}
                showInfo={true}
            />
        ),
    },
    {
        key: 'totalTime',
        title: 'Total Time',
        dataIndex: 'time',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={prettyMilliseconds(record.time.total)} />,
    },
    {
        title: 'Total Suspension',
        key: 'suspension',
        dataIndex: 'suspension',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={record.suspension.total.toString()} />,
    },
    {
        key: 'selfTime',
        title: 'Self Time',
        dataIndex: 'time',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={prettyMilliseconds(record.time?.self)} />,
    },
    {
        key: 'selfSuspension',
        title: 'Self Suspension',
        dataIndex: 'suspension',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={record.suspension.self.toString()} />,
    },
    {
        title: 'Invocations',
        key: 'invocations',
        dataIndex: 'invocations',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={record.invocations.self.toString()} />,
    },
    {
        key: 'calls',
        title: 'Calls',
        dataIndex: 'info',
        render: (_: any, record: CallsTreeInfo) => <CallsTreeSearchedElement text={record.info.calls.toString()} />,
    },
];

export const CALLS_COLUMNS_KEYS = DEFAULT_CALLS_COLUMNS.map(column => column.key);

export function useSortedCallsColumns() {
    const { columnsOrder } = useAppSelector(selectCallsTreeState);
    return [...DEFAULT_CALLS_COLUMNS].sort(
        (a, b) => columnsOrder.indexOf(a.key as string) - columnsOrder.indexOf(b.key as string)
    );
}
export function useCallsColumns() {
    const { hiddenColumns } = useAppSelector(selectCallsTreeState);
    const sortedColumns = useSortedCallsColumns();
    return sortedColumns.filter(column => column.key && !hiddenColumns.includes(column.key));
}
