import { Button, Form, Input, Modal, Select, Space, Typography } from "antd";
import ErrorModal from "./ErrorModal";
import { useEffect, useState } from "react";
import { CreateUserReq, CreateUserRes, ErrorModelType, GetRoleDetail, GetRolesRes, GetUserDetail, UpdateUserReq, UpdateUserRes } from "../types";
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../socket";


const { Title } = Typography;


interface Props {
    open: boolean;
    user: GetUserDetail | null;
    title: string;
    onClose: () => void;
}

export default function UserModel({ open, user, title, onClose }: Props) {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [roles, setRoles] = useState<GetRoleDetail[]>([]);
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });

    useEffect(() => {
        if (user && open) {
            form.setFieldsValue({
                ...user,
                roleIds: user.roles.map(role => role.id),
            });
            getRoles();
        } else {
            form.resetFields();
        }
    }, [open, user]);

    const userId = localStorage.getItem('userId');

    const handleSubmit = async (formData: CreateUserReq | UpdateUserReq) => {
        try {
            let data: CreateUserRes | UpdateUserRes | null = null;
            if (!user) {
                const response = await api.post<CreateUserRes>('/user/create', formData);
                data = response.data;
            } else {
                const response = await api.put<UpdateUserRes>(`/user/update/${user.id}`, formData);
                data = response.data;
            }

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                onClose();
            };
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

    const getRoles = async () => {
        try {
            const { data } = await api.get<GetRolesRes>('/roles');

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                const roles = data.data?.roles?.filter(role => !role.isRoot)
                setRoles(roles);
            }
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                localStorage.clear();
                socket.emit("user-offline", userId);
                navigate('/', { replace: true });
            }
            setErrorModal({ open: true, title: 'Failed', message: err.response?.data?.error ?? 'Something want wrong' });
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
                    minHeight: '70vh',
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }} className="horizontal">
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true }]}
                            >
                                <Input
                                    placeholder="First Name"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true }]}
                            >
                                <Input
                                    placeholder="Last Name"
                                    size="large"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{ required: true, type: 'email' }]}
                        >
                            <Input
                                prefix={<MailOutlined />}
                                placeholder="Email"
                                size="large"
                            />
                        </Form.Item>

                        {!user && <Form.Item
                            label="Password"
                            name="password"
                            rules={[{ required: true }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                size="large"
                                iconRender={(visible) =>
                                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                }
                            />
                        </Form.Item>}

                        {user && <Form.Item
                            label="Role"
                            name="roleIds"
                            rules={[{ required: true }]}
                        >
                            <Select
                                mode="multiple"
                                size="large"
                                placeholder="Role"
                                allowClear
                                options={
                                    roles.map((role) => ({
                                        label: role.name,
                                        value: role.id
                                    }))
                                }
                            />
                        </Form.Item>}

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
                                {user?.id ? 'Update' : 'Create'}
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
        </Modal >
    )
};