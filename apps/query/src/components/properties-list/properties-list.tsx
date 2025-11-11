import { Checkbox, List } from 'antd';
import React from 'react';
import './properties-list.scss';

export interface PropertiesItemModel<T = any> {
    id?: string | number;
    label: React.ReactNode;
    value?: any;
    checked?: boolean;
    hidden?: boolean;
    disabled?: boolean;
    data?: T;
    [key: string]: any;
}

export interface PropertiesListProps<T = any> {
    items?: PropertiesItemModel<T>[];
    onChange?: (items: PropertiesItemModel<T>[]) => void;
    onToggle?: (item: PropertiesItemModel<T>) => void;
    onReorder?: (fromIndex: number, targetIndex: number) => void;
    className?: string;
}

export const PropertiesList = <T,>({ items = [], onChange, onToggle, className }: PropertiesListProps<T>) => {
    const handleCheckChange = (item: PropertiesItemModel<T>, checked: boolean) => {
        if (onToggle) {
            onToggle(item);
        } else if (onChange) {
            const newItems = items.map(i =>
                (i.id === item.id || i.value === item.value) ? { ...i, checked } : i
            );
            onChange(newItems);
        }
    };

    return (
        <List
            className={`properties-list ${className || ''}`}
            dataSource={items}
            renderItem={(item) => (
                <List.Item>
                    <Checkbox
                        checked={item.checked ?? !item.hidden}
                        disabled={item.disabled}
                        onChange={(e) => handleCheckChange(item, e.target.checked)}
                    >
                        {item.label}
                    </Checkbox>
                </List.Item>
            )}
        />
    );
};
