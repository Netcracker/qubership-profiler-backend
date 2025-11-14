import { ESC_CALL_TREE_QUERY_PARAMS } from '@app/constants/query-params';
import { MoreOutlined, BookOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Dropdown, Input, type MenuProps } from 'antd';
import { useState, type FC, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from '../content-controls.module.scss';
import ColumnsPopover from './columns-popover';
import { useDisableWidgetFunction } from '../../hooks/use-widgets';
import { useDebounceCallback } from '@app/hooks/use-debounce-callback';

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

    const DROPDOWN_ITEMS: MenuProps['items'] = [
        {
            key: 'labelsManagement',
            label: 'Labels Managemenet',
            icon: <BookOutlined />,
        },
        {
            key: 'remove',
            label: 'Remove',
            className: 'amarant-label',
            icon: <DeleteOutlined />,
        },
    ];

    const handleClick: MenuProps['onClick'] = ({ key }) => {
        switch (key) {
            case 'labelsManagement':
                break;
            case 'remove':
                disableWidget('calls-tree');
                break;
        }
    };

    return (
        <div className={classNames.toolControls}>
            <CallsTreeTableSearch />
            <ColumnsPopover />
            <Dropdown menu={{ items: DROPDOWN_ITEMS, onClick: handleClick }}>
                <Button type="default" size="middle" icon={<MoreOutlined />} />
            </Dropdown>
        </div>
    );
};

export default CallTreeTableTools;
