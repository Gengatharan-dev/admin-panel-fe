import { Avatar, Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

export default function AppFooter() {
  return (
    <Footer
      style={{
        textAlign: 'center',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <Text type="secondary" style={{ fontWeight: "bold" }}>
        &copy; {new Date().getFullYear()} Admin Panel
      </Text>
    </Footer>
  );
}
