import { ESC_CALL_TREE_QUERY_PARAMS } from '@app/constants/query-params';
import { MoreOutlined, BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input } from 'antd';
import type { MenuProps } from 'antd';
import { useState, type FC, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from '../content-controls.module.scss';
import ColumnsPopover from './columns-popover';
import { useDisableWidgetFunction } from '../../hooks/use-widgets';
import { useDebounceCallback } from '@react-hook/debounce';

const CallsTreeTableSearch: FC = () => {
    const [urlParams, setUrlParams] = useSearchParams();
    const [callsTreeQuery, setCallsTreeQuery] = useState(
        urlParams.get(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery) || ''
    );
    const applyCallsTreeQuery = useDebounceCallback(() => {
        setUrlParams(params => {
            if (callsTreeQuery) {
                params.set(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery, callsTreeQuery?.toString());
            } else {
                params.delete(ESC_CALL_TREE_QUERY_PARAMS.callsTreeQuery);
            }
            return params;
        });
    }, 500);

    const onChangeSearch = useCallback(
        (searchQuery: string) => {
            setCallsTreeQuery(searchQuery);
            applyCallsTreeQuery();
        },
        [applyCallsTreeQuery]
    );

    return (
        <Input.Search
            className={classNames.search}
            value={callsTreeQuery}
            placeholder="Search"
            size="small"
            onChange={e => onChangeSearch(e.target.value)}
        />
    );
};

const CallTreeTableTools: FC = () => {
    const disableWidget = useDisableWidgetFunction();

    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        switch (key) {
            case 'labelsManagement':
                console.log('Labels managemenet choosen');
                break;
            case 'remove':
                disableWidget('calls-tree');
                break;
        }
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'labelsManagement',
            label: 'Labels Managemenet',
            icon: <BookOutlined style={{ fontSize: 16 }} />,
        },
        {
            key: 'remove',
            label: 'Remove',
            icon: <DeleteOutlined style={{ fontSize: 16 }} />,
            danger: true,
        },
    ];

    return (
        <div className={classNames.toolControls}>
            <CallsTreeTableSearch />
            <ColumnsPopover />
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }}>
                <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
        </div>
    );
};

export default CallTreeTableTools;
