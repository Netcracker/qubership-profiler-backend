import { asyncConfirm } from '@app/components/confirm';
import { getDownloadDumpUrl, useDeleteDumpByIdMutation, type HeapDumpInfo } from '@app/store/cdt-openapi';
import { DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { memo, useCallback } from 'react';
import classNames from './heap-dumps-table.module.scss';

const iconStyle = { fontSize: 16 };
function TrowActions(heapInfo: HeapDumpInfo) {
    const { dumpId, pod } = heapInfo;
    const [deleteDump] = useDeleteDumpByIdMutation();
    const handleDeleteDump = useCallback(async () => {
        const confirmed = await asyncConfirm({
            title: 'Delete Heap Dump?',
            content: 'Are you sure you want to delete this heap dump?',
            okButtonProps: {
                danger: true,
            },
        });

        if (confirmed) {
            await deleteDump({
                dumpId: dumpId,
                dumpType: 'heap',
                podId: pod,
            });
        }
    }, [deleteDump, dumpId, pod]);

    return (
        <div className="flex g-4">
            <Button
                className={classNames.pigeonButtons}
                href={getDownloadDumpUrl({ dumpId: heapInfo.dumpId, dumpType: 'heap', podId: heapInfo.pod })}
                target="_blank"
                type="text"
                size="small"
                icon={<DownloadOutlined style={iconStyle} />}
            />
            <Button
                className={classNames.pigeonButtons}
                onClick={handleDeleteDump}
                type="text"
                size="small"
                icon={<DeleteOutlined style={iconStyle} />}
            />
        </div>
    );
}

export default memo(TrowActions);
