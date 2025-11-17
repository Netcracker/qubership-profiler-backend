import type { ServiceDumpInfo } from '@app/store/cdt-openapi';
import { Button, Dropdown, Menu } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { memo } from 'react';

const DumpsDownloadOpts = memo<{ opts?: ServiceDumpInfo['downloadOptions'] }>(({ opts }) => {
    if (!opts) return null;
    if (opts.length === 0) return 0;
    return (
        <Dropdown
            overlay={
                <Menu>
                    {opts?.map(it => (
                        <a href={it.uri} target="_blank" rel="noreferrer" key={it.typeName}>
                            <Menu.Item>{it.typeName}</Menu.Item>
                        </a>
                    ))}
                </Menu>
            }
        >
            <Button
                type="text"
                size="small"
                icon={<CloudDownloadOutlined style={{ fontSize: 16 }} />}
            />
        </Dropdown>
    );
});

DumpsDownloadOpts.displayName = 'DumpsDownloadOpts';

export default DumpsDownloadOpts;
