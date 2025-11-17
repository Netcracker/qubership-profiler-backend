import { type FC } from 'react';
import { ClusterOutlined, MenuFoldOutlined } from '@ant-design/icons';
import classNames from './calls-sidebar.module.scss';
import { Button, Menu, Tooltip } from 'antd';
import { useAppDispatch, useAppSelector } from '@app/store/hooks';
import { appDataActions, selectSiderCollapsed } from '@app/store/slices/app-state.slice';
import clsx from 'clsx';
import NamespacesTree from '@app/features/cdt/sidebar/namespaces-tree';

const CallsSideBar: FC = () => {
    const collapsed = useAppSelector(selectSiderCollapsed);
    const dispatch = useAppDispatch();
    return (
        <aside className={clsx(classNames.sidebar, collapsed && classNames.collapsed)}>
            <h3 className="ux-typography-13px-semibold">Namespaces</h3>
            {collapsed && (
                <Menu mode="vertical" selectedKeys={['tree']}>
                    <Menu.Item
                        key="tree"
                        onClick={() => dispatch(appDataActions.toggleSiderCollapsed())}
                        icon={
                            <Tooltip title="Namespaces" placement="right">
                                <ClusterOutlined />{' '}
                            </Tooltip>
                        }
                    />
                </Menu>
            )}
            {!collapsed && <NamespacesTree />}
            <div className={classNames.footer}>
                <Button
                    onClick={() => dispatch(appDataActions.toggleSiderCollapsed())}
                    type="text"
                    icon={<MenuFoldOutlined />}
                >
                    Collapse
                </Button>
            </div>
        </aside>
    );
};

export default CallsSideBar;
