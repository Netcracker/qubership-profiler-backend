import { useCallsStore, useCallsStoreSelector } from '@app/features/cdt/calls/calls-store';
import { CALLS_COLUMNS_KEYS, useSortedCallsColumns } from '@app/features/cdt/calls/hooks/use-calls-columns';
import { type PropertiesItemModel, PropertiesList } from '@app/components/compat';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { memo, useCallback } from 'react';

const ColumnsPopover = () => {
    const [columnsOrder, set] = useCallsStore(s => s.columnsOrder);
    const _columnsOrder = columnsOrder.length ? columnsOrder : CALLS_COLUMNS_KEYS;
    const hiddenColumns = useCallsStoreSelector(s => s.hiddenColumns);
    const sortedColumns = useSortedCallsColumns();

    const handleToggle = useCallback(
        (items: PropertiesItemModel[]) => {
            const newHiddenColumns = items
                .filter(item => !item.visible)
                .map(item => item.key);
            set({ hiddenColumns: newHiddenColumns });
        },
        [set]
    );

    return (
        <Popover
            placement={'bottomRight'}
            title={<span>Properties</span>}
            arrow={false}
            overlayStyle={{ paddingTop: 0 }}
            content={
                <>
                    <PropertiesList
                        items={sortedColumns.map(col => ({
                            key: col.key as string,
                            label: (typeof col.title === 'string' ? col.title : String(col.key)) as string,
                            visible: !hiddenColumns.includes(col.key),
                        }))}
                        onChange={handleToggle}
                    />
                </>
            }
        >
            <Button type="text" icon={<SettingOutlined />} />
        </Popover>
    );
};

export default memo(ColumnsPopover);
