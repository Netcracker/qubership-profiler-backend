import { useAppDispatch } from '@app/store/hooks';
import { callsTreeContextDataAction } from '@app/store/slices/calls-tree-context-slices';
import { Table } from 'antd';
import { memo, useCallback, useEffect, useState, type FC, type Key } from 'react';
import { useCallsTreeData } from '../../calls-tree-context';
import { useCallsColumns, type TableData } from '../../hooks/use-calls-tree-columns';
import { useSearchParams } from 'react-router-dom';
import { ESC_CALL_TREE_QUERY_PARAMS } from '@app/constants/query-params';
import { getExpandedRowsBySearch } from '@app/features/cdt/calls-tree/call-tree-entity/utils/search-elements';

const CallsTreeTable: FC = () => {
    const columns = useCallsColumns();
    const { data, isFetching } = useCallsTreeData();
    const dispatch = useAppDispatch();
    const [urlParams] = useSearchParams();
    const callsTreeQuery = urlParams.get(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery) || '';
    const [expandedRowKeys, setExpandedRowKeys] = useState<readonly Key[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

    const handleRowClick = useCallback((record: TableData) => {
        const recordKey = String(record.info?.title || '');
        if (selectedRowKeys.includes(recordKey)) {
            dispatch(callsTreeContextDataAction.unselectRow());
            setSelectedRowKeys([]);
        } else if (record.info?.title) {
            dispatch(callsTreeContextDataAction.selectRow([recordKey, record.info?.title]));
            setSelectedRowKeys([recordKey]);
        }
    }, [dispatch, selectedRowKeys]);

    const onExpand = useCallback((expanded: boolean, record: TableData) => {
        const key = String(record.info?.title || '');
        setExpandedRowKeys(prev => {
            if (expanded) {
                return [...prev, key];
            } else {
                return prev.filter(k => k !== key);
            }
        });
    }, []);

    useEffect(() => {
        if (data && callsTreeQuery) {
            const expandedKeys = getExpandedRowsBySearch(callsTreeQuery)(data.children);
            setExpandedRowKeys(expandedKeys);
        }
    }, [callsTreeQuery, data]);

    return (
        <Table<TableData>
            columns={columns}
            dataSource={data?.children as TableData[]}
            loading={isFetching}
            rowKey={(record) => String(record.info?.title || '')}
            expandable={{
                expandedRowKeys: expandedRowKeys as Key[],
                onExpand: onExpand,
            }}
            rowSelection={{
                selectedRowKeys,
                onChange: (keys) => setSelectedRowKeys(keys as Key[]),
            }}
            onRow={(record) => ({
                onClick: () => handleRowClick(record),
            })}
        />
    );
};

export default memo(CallsTreeTable);
