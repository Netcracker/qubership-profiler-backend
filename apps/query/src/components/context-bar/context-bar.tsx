import { Breadcrumb } from 'antd';
import React from 'react';
import './context-bar.scss';

export interface ContextItemModel {
    key: string;
    label: React.ReactNode;
    icon?: React.ReactNode;
}

export interface ContextBarProps {
    items?: ContextItemModel[];
    className?: string;
}

export const ContextBar: React.FC<ContextBarProps> = ({ items = [], className }) => {
    return (
        <div className={`context-bar ${className || ''}`}>
            <Breadcrumb>
                {items.map(item => (
                    <Breadcrumb.Item key={item.key}>
                        {item.icon && <span className="context-bar-icon">{item.icon}</span>}
                        {item.label}
                    </Breadcrumb.Item>
                ))}
            </Breadcrumb>
        </div>
    );
};
