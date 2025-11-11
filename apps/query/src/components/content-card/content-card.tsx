import { Card } from 'antd';
import type { CardProps } from 'antd';
import React from 'react';
import './content-card.scss';

export interface ContentCardProps extends CardProps {
    children?: React.ReactNode;
    titleClassName?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({ children, className, titleClassName, ...props }) => {
    const headStyle = titleClassName ? { padding: '16px 24px' } : undefined;
    return (
        <Card
            className={`content-card ${className || ''} ${titleClassName || ''}`}
            headStyle={headStyle}
            {...props}
        >
            {children}
        </Card>
    );
};
