import { usePopupVisibleState } from '@app/utils/use-popup-visible-state';
import { FileTextOutlined } from '@ant-design/icons';
import { Button, Modal, Input } from 'antd';
import { type FC } from 'react';
import classNames from '../../content-controls.module.scss';

const { TextArea } = Input;

interface TraceButtonModel {
    text: string;
}

const TraceButton: FC<TraceButtonModel> = ({ text }) => {
    const [visible, close, open] = usePopupVisibleState();

    return (
        <div className={classNames.toolControls}>
            <Button type="default" onClick={open}>
                <FileTextOutlined style={{ color: '#0068FF' }} />
            </Button>
            <Modal
                open={visible}
                title="StackTrace"
                footer={<Button onClick={close}>Close</Button>}
                onOk={close}
                onCancel={close}
            >
                <TextArea placeholder="Placeholder" readOnly={true} autoSize value={text} />
            </Modal>
        </div>
    );
};

export default TraceButton;
