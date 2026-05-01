import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

const { Title, Text } = Typography

export const Login = () => {
  console.log("Login component rendered")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const data = await authApi.login(values)
      login(data)
      message.success(`Bienvenido, ${data.name}`)
      navigate('/')
    } catch (error) {
      message.error(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Invoice App SaaS</Title>
          <Text type="secondary">Inicia sesión en tu empresa</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Ingresa tu email' }]}>
            <Input prefix={<UserOutlined />} placeholder="Correo electrónico" />
          </Form.Item>
          
          <Form.Item name="password" rules={[{ required: true, message: 'Ingresa tu contraseña' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading}>
            Iniciar Sesión
          </Button>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">¿No tienes una empresa registrada? </Text>
          <Link to="/register">Registrar Empresa</Link>
        </div>
      </Card>
    </div>
  )
}
