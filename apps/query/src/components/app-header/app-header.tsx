import { Layout } from 'antd';
import { type FC, memo } from 'react';

export interface AppHeaderProps {
    version ?: string
}

const appTitle = `Cloud Diagnostic Toolset`;
const AppHeader: FC<AppHeaderProps> = ({version}) => {
    return (
        <Layout.Header>
            <div>{version ? `${appTitle} v.${version}` : appTitle}</div>
        </Layout.Header>
    );
};

export default memo(AppHeader);
