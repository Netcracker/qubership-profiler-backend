import { useDownloadCallsTreeDataMutation } from '@app/store/cdt-openapi';
import { useAppSelector } from '@app/store/hooks';
import { selectDashboardState } from '@app/store/slices/calls-tree-context-slices';
import { Button, Dropdown, Menu } from 'antd';
import { LoginOutlined, DownloadOutlined, PlusCircleOutlined, BarChartOutlined, UnorderedListOutlined, BranchesOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useEnableWidgetFunction } from './hooks/use-widgets';

export const CallsTreeBackToOverviewButton = () => {
    return (
        <Button
            type="text"
            icon={<LoginOutlined />}
            onClick={() => console.log('Back to overview clicked')}
        >
            Back to Overview
        </Button>
    );
};

export const CallsTreeDownloadButton = () => {
    const { panels } = useAppSelector(selectDashboardState);
    const [downloadCallsTreeData] = useDownloadCallsTreeDataMutation();
    const downloadCallsTree = useCallback(() => {
        downloadCallsTreeData({ initialPanelState: panels });
    }, [panels, downloadCallsTreeData]);

    return <Button type="text" icon={<DownloadOutlined />} onClick={downloadCallsTree} />;
};

export const CallsTreeAddWidgetDropdown = () => {
    const enableWidget = useEnableWidgetFunction();

    function handleClick({ key }: any) {
        switch (key) {
            case 'frame-graph':
                enableWidget('frame-graph', { w: 12, h: 1 });
                break;
            case 'statistics':
                enableWidget('stats', { w: 3, h: 2 });
                break;
            case 'call-tree':
                enableWidget('calls-tree', { w: 9, h: 2 });
                break;
        }
    }

    const menu = (
        <Menu onClick={handleClick}>
            <Menu.Item key="frame-graph" icon={<BarChartOutlined />}>
                Frame Graph
            </Menu.Item>
            <Menu.Item key="statistics" icon={<UnorderedListOutlined />}>
                Statistics
            </Menu.Item>
            <Menu.Item key="call-tree" icon={<BranchesOutlined />}>
                Call Tree
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['hover']}>
            <Button type="text" icon={<PlusCircleOutlined />} />
        </Dropdown>
    );
};
