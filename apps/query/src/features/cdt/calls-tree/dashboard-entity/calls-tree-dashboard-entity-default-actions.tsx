import { Button, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined } from '@ant-design/icons';
import type { FC } from 'react';
import { useDisableWidgetFunction } from '../hooks/use-widgets';
import { type Widget } from '@app/store/slices/calls-tree-context-slices';

const DefaultEntityActions: FC<Widget> = ({ i }) => {
    const disableWidget = useDisableWidgetFunction();

    function handleClick(item: any) {
        switch (item.id) {
            case 'edit':
                console.log('Edit choosen: ', i);
                break;
            case 'remove':
                disableWidget(i);
                break;
        }
    }

    const menu = (
        <Menu onClick={({ key }) => handleClick({ id: key })}>
            <Menu.Item key="edit" icon={<EditOutlined style={{ fontSize: 16 }} />}>
                Edit
            </Menu.Item>
            <Menu.Item key="remove" className="amarant-label" icon={<DeleteOutlined style={{ fontSize: 16 }} />}>
                Remove
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu}>
            <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
    );
};

export default DefaultEntityActions;
