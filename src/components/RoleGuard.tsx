export default function RoleGuard({ role, children }: any) {
    const userRole = localStorage.getItem('role');
    if (userRole !== role) return null;
    return children;
}