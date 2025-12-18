import { Layout, Menu, MenuProps } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

export default function AppSider() {
    const navigate = useNavigate();
    const location = useLocation();

    const roleId = localStorage.getItem('role');
    const children = [
        {
            key: '/users',
            icon: <UserOutlined />,
            label: 'User Management',
        },
    ];

    if (roleId === String(1)) children.push({
        key: '/roles',
        icon: <TeamOutlined />,
        label: 'Role Management',
    });

    const menus: MenuProps['items'] = [
        {
            key: 'admin',
            icon: <SettingOutlined />,
            label: "Admin",
            children,
        }];


    return (
        <Sider width={220} theme="light">
            <Menu
                mode="inline"
                openKeys={['admin']}
                selectedKeys={[location.pathname]}
                onClick={({ key }) => navigate(key)}
                items={menus}
            />
        </Sider>
    );
}
