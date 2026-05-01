import { Layout, Typography, Space, Button, Alert, Dropdown, Tag } from 'antd'
import { SettingOutlined, WarningOutlined, DashboardOutlined, FileTextOutlined, TeamOutlined, ShoppingOutlined, LogoutOutlined, UserOutlined, UsergroupAddOutlined, CrownOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const { Header, Content } = Layout
const { Title } = Typography

export const AppLayout = ({ overdueCount }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const isInvoiceDetailOrNew = location.pathname === '/invoices/new' || (location.pathname.startsWith('/invoices/') && location.pathname !== '/invoices/new')
    const showTabs = !isInvoiceDetailOrNew

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const userMenu = {
        items: [
            {
                key: '1',
                label: <span style={{ fontWeight: 'bold' }}>{user?.name}</span>,
                disabled: true,
            },
            {
                key: '2',
                label: <span style={{ color: '#666' }}>
                    {user?.role !== 'superadmin' && user?.companyName ? `${user.companyName} ` : ''}
                    (<Tag color={user?.role === 'superadmin' ? 'gold' : user?.role === 'admin' ? 'blue' : 'green'}>{user?.role}</Tag>)
                </span>,
                disabled: true,
            },
            {
                type: 'divider',
            },
            {
                key: '3',
                icon: <LogoutOutlined />,
                label: 'Cerrar Sesión',
                danger: true,
                onClick: handleLogout
            }
        ]
    }

    return (
        <Layout className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
            <Header style={{ backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: 32, height: 32, backgroundColor: '#4f46e5', borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>I</span>
                    </div>
                    <Title level={4} style={{ margin: 0, color: '#0f172a' }}>
                        SydSystem 
                        {user?.role === 'superadmin' ? (
                            <span style={{ color: '#64748b', fontSize: 14, fontWeight: 'normal', marginLeft: 8 }}>| Panel Global</span>
                        ) : user?.companyName ? (
                            <span style={{ color: '#64748b', fontSize: 14, fontWeight: 'normal', marginLeft: 8 }}>| {user.companyName}</span>
                        ) : null}
                    </Title>
                </div>
                <Space size="large">
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Button type="text" style={{ padding: '0 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserOutlined style={{ color: '#4f46e5' }} />
                                </div>
                                <span style={{ fontWeight: 500 }}>{user?.name.split(' ')[0]}</span>
                            </div>
                        </Button>
                    </Dropdown>
                </Space>
            </Header>

            <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                {overdueCount > 0 && showTabs && (
                    <Alert
                        title={`Tienes ${overdueCount} factura(s) vencida(s)`}
                        description="Revisa el listado para contactar a los clientes y gestionar el cobro."
                        type="error"
                        showIcon
                        icon={<WarningOutlined />}
                        style={{ marginBottom: 24, borderRadius: 12 }}
                    />
                )}

                {showTabs && (
                    <Space style={{ marginBottom: 24 }} size="large" className="no-print" wrap>
                        <Button
                            type={location.pathname === '/' ? 'primary' : 'default'}
                            icon={<DashboardOutlined />}
                            onClick={() => navigate('/')}
                            size="large"
                        >
                            Dashboard
                        </Button>
                        <Button
                            type={location.pathname === '/invoices' ? 'primary' : 'default'}
                            icon={<FileTextOutlined />}
                            onClick={() => navigate('/invoices')}
                            size="large"
                        >
                            Facturas
                        </Button>
                        <Button
                            type={location.pathname === '/clients' ? 'primary' : 'default'}
                            icon={<TeamOutlined />}
                            onClick={() => navigate('/clients')}
                            size="large"
                        >
                            Clientes
                        </Button>
                        <Button
                            type={location.pathname === '/products' ? 'primary' : 'default'}
                            icon={<ShoppingOutlined />}
                            onClick={() => navigate('/products')}
                            size="large"
                        >
                            Productos
                        </Button>
                        {user?.role === 'superadmin' && (
                            <Button
                                type={location.pathname === '/superadmin' ? 'primary' : 'default'}
                                icon={<CrownOutlined />}
                                onClick={() => navigate('/superadmin')}
                                size="large"
                            >
                                Super Admin
                            </Button>
                        )}
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <Button
                                type={location.pathname === '/users' ? 'primary' : 'default'}
                                icon={<UsergroupAddOutlined />}
                                onClick={() => navigate('/users')}
                                size="large"
                            >
                                Empleados
                            </Button>
                        )}
                    </Space>
                )}

                {/* Aquí React Router inyectará las vistas correspondientes */}
                <Outlet />
            </Content>
        </Layout>
    )
}
