import { Layout } from 'antd';
import React from 'react';
import './app-header-layout.scss';

const { Header } = Layout;

export interface AppHeaderLayoutProps {
    children?: React.ReactNode;
    className?: string;
}

export interface AppHeaderRowProps {
    children?: React.ReactNode;
}

export interface AppHeaderLogoProps {
    src?: string;
}

export interface AppHeaderTitleProps {
    text?: string;
}

export interface AppHeaderGroupProps {
    children?: React.ReactNode;
}

const AppHeaderRow: React.FC<AppHeaderRowProps> = ({ children }) => {
    return <div className="app-header-row">{children}</div>;
};

const AppHeaderLogo: React.FC<AppHeaderLogoProps> = ({ src }) => {
    return <div className="app-header-logo">{src && <img src={src} alt="Logo" />}</div>;
};

const AppHeaderTitle: React.FC<AppHeaderTitleProps> = ({ text }) => {
    return <div className="app-header-title">{text}</div>;
};

const AppHeaderGroup: React.FC<AppHeaderGroupProps> = ({ children }) => {
    return <div className="app-header-group">{children}</div>;
};

export const AppHeaderLayout: React.FC<AppHeaderLayoutProps> & {
    Row: typeof AppHeaderRow;
    Logo: typeof AppHeaderLogo;
    Title: typeof AppHeaderTitle;
    Group: typeof AppHeaderGroup;
} = ({ children, className }) => {
    return <Header className={`app-header-layout ${className || ''}`}>{children}</Header>;
};

AppHeaderLayout.Row = AppHeaderRow;
AppHeaderLayout.Logo = AppHeaderLogo;
AppHeaderLayout.Title = AppHeaderTitle;
AppHeaderLayout.Group = AppHeaderGroup;
