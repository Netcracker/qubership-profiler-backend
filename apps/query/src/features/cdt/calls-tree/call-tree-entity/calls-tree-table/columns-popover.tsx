import { CALLS_COLUMNS_KEYS, useSortedCallsColumns } from '@app/features/cdt/calls-tree/hooks/use-calls-tree-columns';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { callsTreeContextDataAction, selectCallsTreeState } from '@app/store/slices/calls-tree-context-slices';
import { PropertiesList, type PropertiesItemModel } from '@app/components/compat';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Popover } from 'antd';
import { memo, useCallback, type Key } from 'react';

const ColumnsPopover = () => {
    const { columnsOrder, hiddenColumns } = useAppSelector(selectCallsTreeState);
    const dispatch = useAppDispatch();

    const _columnsOrder = columnsOrder.length ? columnsOrder : CALLS_COLUMNS_KEYS;
    const sortedColumns = useSortedCallsColumns();

    const handleChange = useCallback(
        (items: PropertiesItemModel[]) => {
            const newHiddenColumns = items
                .filter(item => !item.visible)
                .map(item => item.key);
            dispatch(callsTreeContextDataAction.setHiddenColumns(newHiddenColumns));
        },
        [dispatch]
    );

    return (
        <Popover
            placement="bottomRight"
            title="Properties"
            content={
                <PropertiesList
                    items={sortedColumns.map(col => ({
                        key: col.name as string,
                        label: col.name as string,
                        visible: !hiddenColumns.includes(col.name),
                    }))}
                    onChange={handleChange}
                />
            }
        >
            <Button type="text" icon={<SettingOutlined />} />
        </Popover>
    );
};

export default memo(ColumnsPopover);
