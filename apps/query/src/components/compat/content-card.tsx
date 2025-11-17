import { Card } from 'antd';
import type { FC, ReactNode } from 'react';

export interface ContentCardProps {
    title?: ReactNode;
    children?: ReactNode;
    className?: string;
    titleClassName?: string;
    extra?: ReactNode;
}

export const ContentCard: FC<ContentCardProps> = ({ title, children, className, titleClassName, extra }) => {
    const titleNode = titleClassName ? <span className={titleClassName}>{title}</span> : title;
    return (
        <Card title={titleNode} className={className} extra={extra} style={{ height: '100%' }}>
            {children}
        </Card>
    );
};
