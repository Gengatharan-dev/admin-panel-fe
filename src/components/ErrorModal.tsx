import { Modal, Button, Typography } from 'antd';


const { Text } = Typography;


interface Props {
    open: boolean;
    title: string;
    message: string;
    onClose: () => void;
}


export default function ErrorModal({ open, title, message, onClose }: Props) {
    return (
        <Modal
            open={open}
            footer={null}
            centered
            closable={false}
            width={360}
        >
            <div style={{ textAlign: 'center' }}>
                <Text type="danger" style={{ fontSize: 16, fontWeight: 600 }}>
                    {title}
                </Text>
                <p style={{ marginTop: 12 }}>{message}</p>
                <Button
                    type="primary"
                    block
                    onClick={onClose}
                >
                    OK
                </Button>
            </div>
        </Modal>
    );
}