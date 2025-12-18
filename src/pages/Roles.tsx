import { Button, Card, notification, Popconfirm, Table, TableColumnsType, TablePaginationConfig, Tag } from 'antd';
import api from '../api/axios';
import { useEffect, useState } from 'react';
import * as Model from '../types';
import ErrorModal from '../components/ErrorModal';
import { useNavigate } from 'react-router-dom';
import { SorterResult } from 'antd/es/table/interface';
import Search from 'antd/es/input/Search';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import RoleModel from '../components/RoleModel';
import { socket } from '../socket';


export default function Roles() {
    const [totalCount, setTotalCount] = useState<number>(0);
    const [roles, setRoles] = useState<Model.GetRoleDetail[]>([]);
    const navigate = useNavigate();
    const [errorModal, setErrorModal] = useState<Model.ErrorModelType>({
        open: false,
        title: '',
        message: '',
    });
    const [roleModel, setRoleModel] = useState<Model.RoleModelType>({
        open: false,
        title: '',
        role: null,
    });
    const [roleReq, setRoleReq] = useState<Model.GetRolesReq>({
        page: 1,
        count: 10,
        search: null,
        sortColumn: Model.RoleSortColumnKey.CreatedAt,
        sortDirection: Model.SortDirection.Desc
    })
    const roleId = localStorage.getItem('role');

    useEffect(() => {
        getRoles(roleReq);
    }, [roleReq]);
    const userId = localStorage.getItem('userId');

    const getRoles = async (req: Model.GetRolesReq) => {
        const url = `/role/get/all?count=${req.count}&page=${req.page}&search=${req.search}&sortColumn=${req.sortColumn}&sortDirection=${req.sortDirection}`;

        try {
            const { data } = await api.get<Model.GetRolesRes>(url);

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                setRoles(data.data.roles);
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

    const handleDelete = async (id: number) => {
        try {
            const { data } = await api.delete<Model.DeleteRoleRes>(`/role/delete/${id}`);

            if (!data.isSuccess && data.error)
                setErrorModal({ open: true, title: 'Failed', message: data.error ?? 'Something want wrong' });
            else if (data.isSuccess) {
                getRoles(roleReq);
                notification.success({
                    message: 'Role deleted successfully'
                });
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
            setErrorModal({ open: true, title: 'Failed', message: err.response?.data?.error ?? 'Something want wrong' });
        }
    };

    const handleTableChange = (
        pagination: TablePaginationConfig,
        _: any,
        sorter: SorterResult<Model.GetRoleDetail> | SorterResult<Model.GetRoleDetail>[],
    ) => {
        const sortObj = Array.isArray(sorter) ? sorter[0] : sorter;
        setRoleReq({
            ...roleReq,
            page: pagination.current ?? 1,
            count: pagination.pageSize ?? 10,
            sortColumn: (sortObj?.field as Model.RoleSortColumnKey) ?? Model.RoleSortColumnKey.CreatedAt,
            sortDirection: sortObj.order === 'ascend' ? Model.SortDirection.Asc : Model.SortDirection.Desc,
            search: null
        });

    };

    const columns: TableColumnsType<Model.GetRoleDetail> = [
        { title: 'Name', dataIndex: 'name', sorter: true, key: Model.RoleSortColumnKey.Name, width: 220, },
        {
            title: 'Active', dataIndex: 'isActive', sorter: true, key: Model.RoleSortColumnKey.isActive, width: 150,
            render: (value: boolean) => value ?
                <Tag style={{ fontSize: 14 }} color={'green'} >Active</Tag>
                : <Tag color={'red'} style={{ fontSize: 14 }} >Inactive</Tag>
        },
        { title: 'Created At', dataIndex: 'createdAt', sorter: true, key: Model.RoleSortColumnKey.CreatedAt, width: 200, },
    ];
    if (roleId === "1") {
        columns.push({
            title: 'Action',
            width: 150,
            render: (_: Model.GetRoleDetail, role: Model.GetRoleDetail) => (
                <div style={{
                    display: "flex",
                    gap: 5
                }}>
                    <Button
                        size='small'
                        icon={<EditOutlined />}
                        onClick={() => setRoleModel({ open: true, title: 'Edit Role', role })}
                    />

                    <Popconfirm
                        title="Delete user"
                        description="Are you sure you want to delete this user?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => handleDelete(role.id)}
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </div>
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
                title="Role Management"
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
                        style={{ width: 210, borderRadius: "1px solid #181616ff" }}
                        onSearch={(value) =>
                            setRoleReq({
                                ...roleReq,
                                page: 1,
                                search: value.trim() === '' ? null : value.trim(),
                            })
                        }
                    />

                    {roleId === '1' && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setRoleModel({ open: true, title: 'Add Role', role: null })}
                        >
                            Add Role
                        </Button>
                    )}
                </div>

                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={roles}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        current: roleReq.page,
                        pageSize: roleReq.count ?? undefined,
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

            {roleModel.open && <RoleModel
                open={roleModel.open}
                role={roleModel.role}
                title={roleModel.title}
                onClose={() => setRoleModel({ open: false, title: '', role: null })}
                getRoles={() => getRoles(roleReq)}
            />}


            {errorModal.open && <ErrorModal
                open={errorModal.open}
                title={errorModal.title}
                message={errorModal.message}
                onClose={() =>
                    setErrorModal({ open: false, title: '', message: '' })
                }
            />}
        </div>
    );
}