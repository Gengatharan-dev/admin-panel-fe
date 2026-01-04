import { Button, Card, Form, Input, Space, Typography } from 'antd';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ErrorModelType, LoginUserReq, LoginUserRes } from '../types';
import {
    MailOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';
import { useState } from 'react';
import { connectSocket, socket } from '../socket';

const { Title, Text } = Typography;


export default function Login() {
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });
    const navigate = useNavigate();

    const handleSubmit = async (formData: LoginUserReq) => {
        try {
            const { data } = await api.post<LoginUserRes>('/auth/login', formData);

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                localStorage.setItem('token', data.data.authorization);
                localStorage.setItem('role', String(data.data.roleId));
                localStorage.setItem('userId', data.data.userId);
                if (data.data.roleId === 2) {
                    connectSocket();
                    socket.emit("user-online", data.data.userId);
                }
                navigate('/users', { replace: true });
            }
        } catch (err: any) {
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
                style={{ width: 450, borderRadius: 10, padding: 32 }}
            >
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2}>Sign in</Title>
                        <Text type="secondary">
                            Welcome back to Admin Panel. Please enter your details below to sign in.
                        </Text>
                    </div>


                    <Form layout="vertical" onFinish={handleSubmit} autoComplete='off'>
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
                            Sign in
                        </Button>
                    </Form>


                    <Text style={{ textAlign: 'center', display: 'block' }}>
                        Don&apos;t have an account? <Link to="/register">Sign up now</Link>
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