import { Card } from 'antd';
import type { FC, ReactNode } from 'react';

export interface SummaryCardProps {
    title?: ReactNode;
    content?: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export const SummaryCard: FC<SummaryCardProps> = ({ title, content, footer, className }) => {
    return (
        <Card title={title} className={className}>
            {content}
            {footer && <div style={{ marginTop: 16 }}>{footer}</div>}
        </Card>
    );
};
