import { usePopupVisibleState } from '@app/components/compat';
import { FileTextOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import { type FC } from 'react';
import classNames from '../../content-controls.module.scss';

interface TraceButtonModel {
    text: string;
}

const TraceButton: FC<TraceButtonModel> = ({ text }) => {
    const { visible, close, open } = usePopupVisibleState();

    return (
        <div className={classNames.toolControls}>
            <Button type="text" onClick={open}>
                <FileTextOutlined style={{ fontSize: 16, color: '#0068FF' }} />
            </Button>
            <Modal
                open={visible}
                title="StackTrace"
                width={800}
                footer={<Button onClick={close}>Close</Button>}
                onOk={close}
                onCancel={close}
            >
                <Input.TextArea placeholder="Placeholder" readOnly={true} autoSize value={text} />
            </Modal>
        </div>
    );
};

export default TraceButton;
