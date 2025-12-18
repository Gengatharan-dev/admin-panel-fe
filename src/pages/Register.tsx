import { Button, Card, Form, Input, Select, Space, Typography } from 'antd';
import api from '../api/axios';
import { useEffect, useState } from 'react';
import { ErrorModelType, GetRoleDetail, GetRoleRes, RegisterUserReq, RegisterUserRes } from '../types';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';
import { socket } from '../socket';


const { Title, Text } = Typography;


export default function Register() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<GetRoleDetail[]>([]);
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });

    useEffect(() => {
        getRole();
    }, []);
    const userId = localStorage.getItem('userId');

    const handleSubmit = async (formData: RegisterUserReq) => {
        try {
            const { data } = await api.post<RegisterUserRes>('/auth/register', formData);

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess && data.data.isRegistered) {
                navigate('/')
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

    const getRole = async () => {
        try {
            const response = await api.get('/roles');

            const { isSuccess, error, data } = response.data as GetRoleRes;
            const roles: GetRoleDetail[] = data.roles.filter(role => role.isRoot);
            if (!isSuccess && error)
                setErrorModal({ open: true, title: 'Failed', message: error ?? 'Something want wrong' });
            else if (isSuccess && roles.length > 0)
                setRoles(roles);
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
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#f5f7fa'
            }}
        >
            <Card
                style={{ width: 450, borderRadius: 10 }}
            >
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2}>Sign up</Title>
                        <Text type="secondary">
                            Welcome back to Admin Panel. Please enter your details below to sign up.
                        </Text>
                    </div>


                    <Form layout="vertical" onFinish={handleSubmit} autoComplete='off'>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }} className="horizontal">
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true }]}
                            >
                                <Input
                                    placeholder="First Name"
                                    size="large"
                                    autoComplete="clear"
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

                        <Form.Item
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
                        </Form.Item>

                        <Form.Item
                            label="Role"
                            name="roleId"
                            rules={[{ required: true }]}
                        >
                            <Select
                                placeholder="Role"
                                size="large"
                                options={roles.map(role => ({
                                    label: role.name,
                                    value: role.id,
                                }))}
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


                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                        >
                            Sign up
                        </Button>
                    </Form>

                    <Text style={{ textAlign: 'center', display: 'block' }}>
                        Do you have an account? <Link to="/">Sign in now</Link>
                    </Text>
                </Space>
            </Card>

            <ErrorModal
                open={errorModal.open}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() =>
                    setErrorModal({ open: false, title: '', message: '' })
                }
            />
        </div>
    );
}