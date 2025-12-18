import { Button, Form, Input, Modal, notification, Select, Space, Typography } from "antd";
import ErrorModal from "./ErrorModal";
import { useEffect, useState } from "react";
import { CreateRoleReq, CreateRoleRes, ErrorModelType, GetRoleDetail, UpdateRoleReq, UpdateRoleRes } from "../types";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../socket";


const { Title } = Typography;


interface Props {
    open: boolean;
    role: GetRoleDetail | null;
    title: string;
    onClose: () => void;
    getRoles: () => void;
}

export default function RoleModel({ open, role, title, onClose, getRoles }: Props) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });

    useEffect(() => {
        if (role && open) {
            form.setFieldsValue(role);
        } else {
            form.resetFields();
        }
    }, [role, open]);

    const userId = localStorage.getItem('userId');

    const handleSubmit = async (formData: CreateRoleReq | UpdateRoleReq) => {
        try {
            let data: CreateRoleRes | UpdateRoleRes | null = null;
            if (!role) {
                const response = await api.post<CreateRoleRes>('/role/add', formData);
                data = response.data;
            } else {
                const response = await api.put<UpdateRoleRes>(`/role/update/${role.id}`, formData);
                data = response.data;
            }

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                onClose();
                getRoles();
                notification.success({
                    message: `${title} successfully`
                });
            }
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                localStorage.clear();
                socket.emit("user-offline", userId);
                navigate('/', { replace: true });
            }
            if (err.response?.data?.error === "User not found") {
                localStorage.clear();
                navigate('/', { replace: true });
            }
            setErrorModal({ open: true, title: 'Failed', message: err?.response?.data?.error ?? 'Something want wrong' });
        }

    };

    return (
        <Modal
            open={open}
            footer={null}
            centered
            closable={false}
            width={450}
        >
            <div
                style={{
                    minHeight: '60',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#f5f7fa',
                    padding: 10
                }}
            >
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2}>{title}</Title>
                    </div>


                    <Form layout="vertical"
                        onFinish={handleSubmit}
                        form={form}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="Name"
                            name="name"
                            rules={[{ required: true }]}
                        >
                            <Input
                                placeholder="Name"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Active"
                            name="isActive"
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder="Active"
                                size="large"
                                options={[{ value: true, label: 'Active' }, { value: false, label: 'Inactive' }]}

                            />
                        </Form.Item>

                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 16
                            }}
                        >
                        </div>

                        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                            <Button
                                type="primary"
                                onClick={onClose}
                                size="large"
                                block
                                htmlType="reset"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                            >
                                {role?.id ? 'Edit' : 'Add'}
                            </Button>
                        </div>
                    </Form>
                </Space>

                <ErrorModal
                    open={errorModal.open}
                    title={errorModal.title}
                    message={errorModal.message}
                    onClose={() =>
                        setErrorModal({ open: false, title: '', message: '' })
                    }
                />
            </div>
        </Modal>
    )
};