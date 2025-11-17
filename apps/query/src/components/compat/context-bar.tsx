import { Breadcrumb, Space } from 'antd';
import type { FC, ReactNode } from 'react';

export interface ContextItemModel {
    key?: string;
    id?: string;
    label?: ReactNode;
    name?: ReactNode;
    icon?: ReactNode;
}

export interface ContextBarProps {
    items: ContextItemModel[];
    left?: ReactNode;
    right?: ReactNode;
}

export const ContextBar: FC<ContextBarProps> = ({ items, left, right }) => {
    const breadcrumbItems = items.map(item => ({
        key: item.key || item.id,
        title: (
            <>
                {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
                {item.label || item.name}
            </>
        ),
    }));

    return (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            {left && <div>{left}</div>}
            <Breadcrumb items={breadcrumbItems} />
            {right && <div>{right}</div>}
        </Space>
    );
};
