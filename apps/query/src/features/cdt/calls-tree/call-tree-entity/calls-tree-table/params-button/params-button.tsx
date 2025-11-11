import { type CallsTreeInfo } from '@app/store/cdt-openapi';
import { usePopupVisibleState } from '@app/utils/use-popup-visible-state';
import { AppstoreOutlined } from '@ant-design/icons';
import { Button, Modal, Table } from 'antd';
import { type FC } from 'react';
import { useCallsTreeData } from '../../../calls-tree-context';
import classNames from '../../content-controls.module.scss';
import { columnsFactory, type TableData } from '../../params-table/columns';
import { createParamsData } from '../../utils/calls-tree-operations';

interface ParamsButtonModel {
    row: CallsTreeInfo;
}

const ParamsButton: FC<ParamsButtonModel> = ({ row }) => {
    const [visible, close, open] = usePopupVisibleState();

    const { isFetching } = useCallsTreeData();

    return (
        <div className={classNames.toolControls}>
            <Button type="default" onClick={open}>
                <AppstoreOutlined style={{ color: '#0068FF' }} />
            </Button>
            <Modal
                open={visible}
                title={row.info.title}
                width={800}
                footer={<Button onClick={close}>Close</Button>}
                onOk={close}
                onCancel={close}
            >
                <Table<TableData>
                    columns={columnsFactory()}
                    dataSource={createParamsData(row) as TableData[]}
                    className="ux-table"
                    loading={isFetching}
                />
            </Modal>
        </div>
    );
};

export default ParamsButton;
