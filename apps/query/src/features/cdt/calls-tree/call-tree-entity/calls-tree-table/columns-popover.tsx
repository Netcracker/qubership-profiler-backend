import { CALLS_COLUMNS_KEYS, useSortedCallsColumns } from '@app/features/cdt/calls-tree/hooks/use-calls-tree-columns';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { callsTreeContextDataAction, selectCallsTreeState } from '@app/store/slices/calls-tree-context-slices';
import { type PropertiesItemModel } from '@app/components/properties-list/properties-list';
import { PropertiesList } from '@app/components/properties-list/properties-list';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { memo, useCallback, type Key, type ReactNode } from 'react';

const ColumnsPopover = () => {
    const { hiddenColumns } = useAppSelector(selectCallsTreeState);
    const dispatch = useAppDispatch();

    const sortedColumns = useSortedCallsColumns();

    const handleToggle = useCallback(
        (item: PropertiesItemModel<unknown>) => {
            if (hiddenColumns.includes(item.value)) {
                dispatch(callsTreeContextDataAction.setHiddenColumns(hiddenColumns.filter(c => c !== item.value)));
            } else {
                dispatch(callsTreeContextDataAction.setHiddenColumns([...hiddenColumns, item.value]));
            }
        },
        [hiddenColumns, dispatch]
    );
    return (
        <Popover
            placement={'bottomRight'}
            title={<span>Properties</span>}
            content={
                <>
                    <PropertiesList
                        // onReorder={handleReorder}
                        items={sortedColumns.map(col => ({
                            label: col.title as ReactNode,
                            value: col.key as Key,
                            data: col,
                            hidden: !!(col.key && hiddenColumns.includes(col.key)),
                        }))}
                        onToggle={handleToggle}
                    />
                </>
            }
        >
            <Button type="default" icon={<SettingOutlined />} />
        </Popover>
    );
};

export default memo(ColumnsPopover);
