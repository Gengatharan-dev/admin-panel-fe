import { Button, Card, notification, Popconfirm, Table, TableColumnsType, TablePaginationConfig, Tag } from 'antd';
import api from '../api/axios';
import { useEffect, useState } from 'react';
import { ErrorModelType, GetUserDetail, GetUsersReq, GetUsersRes, SortColumnKey, SortDirection, UserModelType } from '../types';
import ErrorModal from '../components/ErrorModal';
import Search from 'antd/es/input/Search';
import { SorterResult } from 'antd/es/table/interface';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import UserModel from '../components/UserModel';
import { socket } from '../socket';


export default function Users() {
    const [totalCount, setTotalCount] = useState<number>(0);
    const [users, setUsers] = useState<GetUserDetail[]>([]);
    const [userReq, setUserReq] = useState<GetUsersReq>({
        page: 1,
        count: 10,
        search: null,
        sortColumn: SortColumnKey.CreatedAt,
        sortDirection: SortDirection.Desc
    });
    const [errorModal, setErrorModal] = useState<ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });
    const [userModel, setUserModel] = useState<UserModelType>({
        open: false,
        title: '',
        user: null,
    });
    const navigate = useNavigate();
    const roleId = localStorage.getItem('role');

    useEffect(() => {
        getUsers(userReq);
    }, [userReq]);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        socket.emit("join-admin-room");

        socket.on("user-created", (data) => {
            if (roleId === String(1)) {
                notification.success({
                    message: "User created successfully",
                });
            }
            setUsers((prev) => [...prev, data]?.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1));
        });

        socket.on("user-updated", (data) => {
            if (roleId === String(1)) {
                notification.success({
                    message: "User updated successfully",
                });
            }
            setUsers((prev) =>
                prev.map((user) => (user.id === data.id ? data : user))?.sort((a, b) => a.createdAt > b.createdAt ? -1 : 1)
            );
        });

        socket.on("user-status", (data) => {
            setUsers((prev) => prev.map((user) => user.id === data.id ? {
                ...user,
                isOnline: data.isOnline,
            } : user));
        });

        return () => {
            socket.off();
        };
    }, []);

    const getUsers = async (formData: GetUsersReq) => {
        const url = `/user/get/all?count=${formData.count}&page=${formData.page}&search=${formData.search}&sortColumn=${formData.sortColumn}&sortDirection=${formData.sortDirection}`;

        try {
            const { data } = await api.get<GetUsersRes>(url);

            if (!data.isSuccess && data.error) {
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            }
            if (data.isSuccess) {
                setUsers(data.data.users);
                setTotalCount(data.data.totalCount);
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

            setErrorModal({ open: true, title: 'Failed', message: err.response?.data?.error ?? 'Something want wrong' });
        }
    };

    const handleTableChange = (
        pagination: TablePaginationConfig,
        _: any,
        sorter: SorterResult<GetUserDetail> | SorterResult<GetUserDetail>[],
    ) => {
        const sortObj = Array.isArray(sorter) ? sorter[0] : sorter;
        setUserReq({
            ...userReq,
            page: pagination.current ?? 1,
            count: pagination.pageSize ?? 10,
            sortColumn: (sortObj?.field as SortColumnKey) ?? SortColumnKey.CreatedAt,
            sortDirection: sortObj.order === 'ascend' ? SortDirection.Asc : SortDirection.Desc,
            search: null
        });

    };


    const handleDelete = async (id: string) => {
        try {
            const { data } = await api.delete(`/user/delete/${id}`);

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error });
            else if (data.isSuccess) {
                getUsers(userReq);
                notification.success({
                    message: 'User deleted successfully'
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
            setErrorModal({ open: true, title: 'Failed', message: err.response?.data?.error });
        }
    };


    const columns: TableColumnsType<GetUserDetail> = [
        {
            title: 'Name', dataIndex: 'name', sorter: true, key: SortColumnKey.Name, width: 200,
            render: (name: string, user: GetUserDetail) => user.lastName ? `${user.firstName} ${user.lastName}` : `${user.firstName}`,
        },
        { title: 'Email', dataIndex: 'email', sorter: true, key: SortColumnKey.Email, width: 240, },
        {
            title: 'Role', width: 220,
            render: (role: string, user: GetUserDetail) => user?.roles?.length ? user.roles.map(role => role.name).join(', ') : '-',
        },
        { title: 'Created At', dataIndex: 'createdAt', sorter: true, key: SortColumnKey.CreatedAt, width: 200, },
        {
            title: 'Status', dataIndex: 'is_online', sorter: true, key: 'status', width: 140,
            render: (_: GetUserDetail, user: GetUserDetail) =>
                user.isOnline ?
                    <Tag color={"green"} style={{ fontSize: 14 }}>Online</Tag>
                    : <Tag color={"red"} style={{ fontSize: 14 }}>Offline</Tag>
        },
    ];

    if (roleId === "1") {
        columns.push({
            title: 'Action',
            width: 140,
            render: (_: GetUserDetail, user: GetUserDetail) => (
                <div style={{
                    display: "flex",
                    gap: 5
                }}
                >
                    <Button
                        icon={<EditOutlined />}
                        size='small'
                        onClick={() => setUserModel({ open: true, title: 'Edit User', user: user })}
                    />

                    <Popconfirm
                        title="Delete user"
                        description="Are you sure you want to delete this user?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(user.id)}
                    >
                        <Button danger icon={<DeleteOutlined />} size='small' />
                    </Popconfirm>
                </div >
            )
        })

    }


    return (
        <div
            style={{
                height: '80%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Card
                title="User Management"
                style={{ height: '100%', borderRadius: 8 }}
            >

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 12
                }}>
                    <Search
                        placeholder="Search"
                        allowClear
                        style={{ width: 210 }}
                        onSearch={(value) =>
                            setUserReq({
                                ...userReq,
                                page: 1,
                                search: value.trim() === '' ? null : value.trim(),
                            })
                        }
                    />

                    {roleId === '1' && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setUserModel({ open: true, title: 'Add User', user: null })}
                        >
                            Add User
                        </Button>
                    )}
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    dataSource={users}
                    pagination={{
                        current: userReq.page,
                        pageSize: userReq.count ?? undefined,
                        total: totalCount,
                        showSizeChanger: true,
                        locale: {
                            items_per_page: '',
                        },
                    }}
                    onChange={handleTableChange}
                    sticky
                />
            </Card>

            {userModel.open && <UserModel
                open={userModel.open}
                title={userModel.title}
                user={userModel.user}
                onClose={() => setUserModel({ open: false, title: '', user: null })}
            />}

            {errorModal.open && <ErrorModal
                open={errorModal.open}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() =>
                    setErrorModal({ open: false, title: '', message: '' })
                }
            />}
        </div >
    );
}