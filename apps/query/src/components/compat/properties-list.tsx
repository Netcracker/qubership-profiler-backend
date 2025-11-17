import { Checkbox, List } from 'antd';
import type { FC } from 'react';

export interface PropertiesItemModel {
    key: string;
    label: string;
    visible: boolean;
    disabled?: boolean;
}

export interface PropertiesListProps {
    items: PropertiesItemModel[];
    onChange: (items: PropertiesItemModel[]) => void;
    onReorder?: (items: PropertiesItemModel[]) => void;
}

export const PropertiesList: FC<PropertiesListProps> = ({ items, onChange }) => {
    const handleToggle = (key: string) => {
        const newItems = items.map(item =>
            item.key === key ? { ...item, visible: !item.visible } : item
        );
        onChange(newItems);
    };

    return (
        <List
            dataSource={items}
            renderItem={item => (
                <List.Item key={item.key}>
                    <Checkbox
                        checked={item.visible}
                        disabled={item.disabled}
                        onChange={() => handleToggle(item.key)}
                    >
                        {item.label}
                    </Checkbox>
                </List.Item>
            )}
        />
    );
};

export function reorderItems<T>(items: T[], startIndex: number, endIndex: number): T[] {
    const result = Array.from(items);
    const [removed] = result.splice(startIndex, 1);
    if (removed !== undefined) {
        result.splice(endIndex, 0, removed);
    }
    return result;
}
