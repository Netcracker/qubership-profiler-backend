import { useCallsStore, useCallsStoreSelector } from '@app/features/cdt/calls/calls-store';
import { CALLS_COLUMNS_KEYS, useSortedCallsColumns } from '@app/features/cdt/calls/hooks/use-calls-columns';
import { type PropertiesItemModel } from '@app/components/properties-list/properties-list';
import { reorderItems } from '@app/utils/reorder-items';
import { PropertiesList } from '@app/components/properties-list/properties-list';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { type Key, type ReactNode, memo, useCallback } from 'react';

const ColumnsPopover = () => {
    const [columnsOrder, set] = useCallsStore(s => s.columnsOrder);
    const _columnsOrder = Array.isArray(columnsOrder) && columnsOrder.length ? columnsOrder : CALLS_COLUMNS_KEYS;
    const hiddenColumns = useCallsStoreSelector(s => s.hiddenColumns);
    const sortedColumns = useSortedCallsColumns();

    const handleReorder = useCallback(
        (fromIndex: number, targetIndex: number) => {
            if (Array.isArray(_columnsOrder)) {
                const newOrder = reorderItems(_columnsOrder, fromIndex, targetIndex);
                set({ columnsOrder: Array.from(newOrder) });
            }
        },
        [_columnsOrder, set]
    );
    const handleToggle = useCallback(
        (item: PropertiesItemModel<unknown>) => {
            if (hiddenColumns.includes(item.value)) {
                set({ hiddenColumns: hiddenColumns.filter(c => c !== item.value) });
            } else {
                set({ hiddenColumns: [...hiddenColumns, item.value] });
            }
        },
        [hiddenColumns, set]
    );
    return (
        <Popover
            placement={'bottomRight'}
            title={<span>Properties</span>}
            overlayStyle={{ paddingTop: 0 }}
            content={
                <>
                    <PropertiesList
                        onReorder={handleReorder}
                        items={sortedColumns.map(col => ({
                            label: col.title as ReactNode,
                            value: col.key as Key,
                            data: col,
                            hidden: hiddenColumns.includes(col.key),
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
