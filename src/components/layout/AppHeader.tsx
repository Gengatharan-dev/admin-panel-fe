import { Avatar, Dropdown, Layout, MenuProps, Image } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { disconnectSocket, socket } from '../../socket';
import logo from "../../logo.png";

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile', { replace: true }),
      style: { height: "40px" },
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: () => {
        localStorage.clear();
        socket.emit("user-offline", userId);
        disconnectSocket();
        navigate('/', { replace: true });
      },
      style: { height: "40px" },
    },
  ];


  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <>
        <Image src={logo} alt="Admin Dashboard" preview={false} style={{ width: 100 }} />

        <Dropdown
          menu={{
            items, style: {
              minWidth: 180,
            },
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Avatar
            style={{ marginLeft: "auto", cursor: "pointer" }}
            size="large"
            src="/avatar.png"
            icon={<UserOutlined />}
          />
        </Dropdown>
      </>
    </Header>
  );
}
