import { Layout } from 'antd';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import { Outlet } from 'react-router-dom';
import AppSider from './AppSider';

const { Content } = Layout;

export default function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AppHeader />

      <Layout>
        <AppSider />
        <Content
          style={{
            flex: 1,
            padding: '40px 0',
          }}
        >
          <div
            style={{
              padding: '24px 24px',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>

      <AppFooter />
    </Layout>
  );
}
