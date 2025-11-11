import { useDownloadCallsTreeDataMutation } from '@app/store/cdt-openapi';
import { useAppSelector } from '@app/store/hooks';
import { selectDashboardState } from '@app/store/slices/calls-tree-context-slices';
import { Button, Dropdown, type MenuProps } from 'antd';
import { useCallback } from 'react';
import {
    ArrowLeftOutlined,
    DownloadOutlined,
    PlusCircleOutlined,
    BarChartOutlined,
    UnorderedListOutlined,
    ApartmentOutlined
} from '@ant-design/icons';
import { useEnableWidgetFunction } from './hooks/use-widgets';

export const CallsTreeBackToOverviewButton = () => {
    return (
        <Button
            type="default"
            icon={<ArrowLeftOutlined />}
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

    return <Button type="default" icon={<DownloadOutlined />} onClick={downloadCallsTree} />;
};

export const CallsTreeAddWidgetDropdown = () => {
    const enableWidget = useEnableWidgetFunction();

    const handleClick: MenuProps['onClick'] = ({ key }) => {
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
    };

    const items: MenuProps['items'] = [
        {
            key: 'frame-graph',
            label: 'Frame Graph',
            icon: <BarChartOutlined />,
        },
        {
            key: 'statistics',
            label: 'Statistics',
            icon: <UnorderedListOutlined />,
        },
        {
            key: 'call-tree',
            label: 'Call Tree',
            icon: <ApartmentOutlined />,
        },
    ];

    return (
        <Dropdown menu={{ items, onClick: handleClick }} trigger={['hover']}>
            <Button type="default" icon={<PlusCircleOutlined />} />{' '}
        </Dropdown>
    );
};
