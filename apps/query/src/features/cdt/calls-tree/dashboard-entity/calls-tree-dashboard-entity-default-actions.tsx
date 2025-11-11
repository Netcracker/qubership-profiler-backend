import { Button, Dropdown, type MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { FC } from 'react';
import { useDisableWidgetFunction } from '../hooks/use-widgets';
import { type Widget } from '@app/store/slices/calls-tree-context-slices';

const DefaultEntityActions: FC<Widget> = ({ i }) => {
    const disableWidget = useDisableWidgetFunction();

    const handleClick: MenuProps['onClick'] = ({ key }) => {
        switch (key) {
            case 'edit':
                console.log('Edit choosen: ', i);
                break;
            case 'remove':
                disableWidget(i);
                break;
        }
    };

    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined />,
        },
        {
            key: 'remove',
            label: 'Remove',
            className: 'amarant-label',
            icon: <DeleteOutlined />,
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: handleClick }}>
            <Button type="default" icon={<MoreOutlined />} />
        </Dropdown>
    );
};

export default DefaultEntityActions;
