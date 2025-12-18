import {
    Avatar,
    Card,
    Col,
    Form,
    Input,
    Row,
    Typography,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { ErrorModelType, GetProfileDetail, GetProfileRes } from "../types";
import { useEffect, useState } from "react";
import api from "../api/axios";
import ErrorModal from "../components/ErrorModal";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

const { Title, Text } = Typography;



export default function Profile() {

    const [profile, setProfile] = useState<GetProfileDetail | null>(null);
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });
    const navigate = useNavigate();
    const [form] = Form.useForm();


    useEffect(() => {
        getUser();
    }, []);


    const roleId = localStorage.getItem('role');
    const roleName = roleId === String(1) ? "Admin" : "User";
    const userId = localStorage.getItem('userId');


    const getUser = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const { data } = await api.get<GetProfileRes>(`/auth/get/${userId}`);
            const { isSuccess, error } = data;
            if (!isSuccess && error)
                setErrorModal({ open: true, title: 'Failed', message: error ?? 'Something want wrong' });
            else if (isSuccess && data.data) {
                const res = {
                    ...data.data,
                    roles: data.data?.roles?.map(role => role.name).join(', '),
                };
                form.setFieldsValue(res);
                setProfile(res);
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
        <div
            style={{
                padding: "40px",
                background: "#f5f7fa",
            }}
        >
            <Row gutter={24} justify="center">

                <Col xs={24} md={8}>
                    <Card
                        style={{
                            borderRadius: 12,
                            textAlign: "center",
                            height: "100%",
                        }}
                    >
                        <Avatar
                            size={120}
                            icon={<UserOutlined />}
                            style={{ backgroundColor: "#d9d9d9" }}
                        />

                        <Title level={3} style={{ marginTop: 16 }}>
                            {roleName}
                        </Title>

                        <Text type="secondary" style={{ fontSize: 17 }}>
                            {profile?.lastName ? `${profile.firstName} ${profile.lastName}` : profile?.firstName}
                        </Text>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        title={
                            <Title level={4} style={{ marginBottom: 0 }}>
                                Profile Details
                            </Title>
                        }
                        style={{
                            borderRadius: 12,
                        }}
                    >
                        <Form
                            layout="vertical"
                            form={form}
                        >
                            <Row gutter={16} style={{ fontWeight: 500, color: '#393535ff' }}>
                                <Col span={12}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                        labelCol={{ style: { fontSize: 20, } }}
                                    >
                                        <Input disabled style={{ height: 40, fontWeight: 500, color: '#5b5757ff' }} />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                        labelCol={{ style: { fontSize: 20, } }}
                                    >
                                        <Input disabled style={{ height: 40, fontWeight: 500, color: '#5b5757ff' }} />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        labelCol={{ style: { fontSize: 20, } }}
                                    >
                                        <Input disabled style={{ height: 40, fontWeight: 500, color: '#5b5757ff' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>

            </Row>
            <ErrorModal
                open={errorModal.open}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() => setErrorModal({ open: false, title: '', message: '' })}
            />
        </div>
    );
}
