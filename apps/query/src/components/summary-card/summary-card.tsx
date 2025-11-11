import { Card } from 'antd';
import type { CardProps } from 'antd';
import React from 'react';
import './summary-card.scss';

export interface SummaryCardProps extends Omit<CardProps, 'content'> {
    title?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
    title,
    content,
    footer,
    children,
    className,
    ...props
}) => {
    return (
        <Card className={`summary-card ${className || ''}`} title={title} {...props}>
            {content || children}
            {footer && <div className="summary-card-footer">{footer}</div>}
        </Card>
    );
};
