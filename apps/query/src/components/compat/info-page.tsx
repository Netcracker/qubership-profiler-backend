import { Empty } from 'antd';
import type { FC, ReactNode } from 'react';

export interface InfoPageProps {
    title?: ReactNode;
    message?: ReactNode;
    style?: React.CSSProperties;
    className?: string;
    icon?: ReactNode;
    additionalContent?: ReactNode;
}

export const InfoPage: FC<InfoPageProps> = ({ title, message, style, className, icon, additionalContent }) => {
    return (
        <Empty
            style={style}
            className={className}
            image={icon || Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <>
                    {title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>}
                    {message && <div>{message}</div>}
                    {additionalContent && <div style={{ marginTop: 16 }}>{additionalContent}</div>}
                </>
            }
        />
    );
};
