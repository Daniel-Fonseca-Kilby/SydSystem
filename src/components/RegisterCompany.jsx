import { useState } from 'react'
import { Card, Form, Input, Button, Typography, message, Divider } from 'antd'
import { BankOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'

const { Title, Text } = Typography

export const RegisterCompany = () => {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error('Las contraseñas no coinciden')
    }

    setLoading(true)
    try {
      const data = await authApi.registerCompany({
        companyName: values.companyName,
        userName: values.userName,
        email: values.email,
        password: values.password
      })
      login(data)
      message.success(`Empresa ${data.companyName} registrada con éxito. Bienvenido.`)
      navigate('/')
    } catch (error) {
      message.error(error.message || 'Error al registrar la empresa')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5', padding: 24 }}>
      <Card style={{ width: 450, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Nueva Empresa</Title>
          <Text type="secondary">Crea un espacio de trabajo para tu equipo</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="companyName" label="Nombre de la Empresa" rules={[{ required: true }]}>
            <Input prefix={<BankOutlined />} placeholder="Ej. Mi Tienda S.A." />
          </Form.Item>

          <Divider style={{ margin: '12px 0' }} />
          <Text strong style={{ display: 'block', marginBottom: 16 }}>Cuenta de Administrador</Text>

          <Form.Item name="userName" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Tu nombre completo" />
          </Form.Item>
          
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="Correo electrónico" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña (mínimo 6 caracteres)" />
          </Form.Item>

          <Form.Item name="confirmPassword" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} style={{ marginTop: 8 }}>
            Registrar y Entrar
          </Button>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary">¿Ya tienes cuenta? </Text>
          <Link to="/login">Iniciar Sesión</Link>
        </div>
      </Card>
    </div>
  )
}
