import { Empty } from 'antd';
import type { EmptyProps } from 'antd';
import React from 'react';
import './info-page.scss';

export interface InfoPageProps extends EmptyProps {
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    additionalContent?: React.ReactNode;
}

export const InfoPage: React.FC<InfoPageProps> = ({
    icon,
    title,
    description,
    children,
    className,
    additionalContent,
    ...props
}) => {
    return (
        <div className={`info-page ${className || ''}`}>
            <Empty
                image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <>
                        {title && <div className="info-page-title">{title}</div>}
                        {description && <div className="info-page-description">{description}</div>}
                    </>
                }
                {...props}
            >
                {children}
            </Empty>
            {additionalContent}
        </div>
    );
};
