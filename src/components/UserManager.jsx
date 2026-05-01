import { useState } from 'react'
import { Card, Table, Button, Space, Popconfirm, Modal, Form, Input, Typography, Row, Col, Tag, message } from 'antd'
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { useUsers, useSaveUser, useDeleteUser } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'

const { Title, Text } = Typography

export const UserManager = () => {
  const { user } = useAuth()
  const { data: users = [], isLoading: loading } = useUsers()
  const { mutate: saveUser } = useSaveUser()
  const { mutate: deleteUser } = useDeleteUser()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form] = Form.useForm()

  const handleAdd = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    deleteUser(id, {
      onSuccess: () => message.success('Usuario eliminado')
    })
  }

  const handleSave = (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error('Las contraseñas no coinciden')
    }

    saveUser(values, {
      onSuccess: () => {
        message.success('Usuario creado correctamente')
        setIsModalOpen(false)
      }
    })
  }

  const columns = [
    { 
      title: 'Nombre', 
      dataIndex: 'name', 
      key: 'name',
      render: (text) => <><UserOutlined style={{ marginRight: 8 }} />{text}</>
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Rol', 
      dataIndex: 'role', 
      key: 'role',
      render: (role) => {
        if (role === 'superadmin') return <Tag color="gold">Super Admin</Tag>
        if (role === 'admin') return <Tag color="blue">Administrador</Tag>
        return <Tag color="green">Empleado</Tag>
      }
    },
    { 
      title: 'Acciones', 
      key: 'actions', 
      align: 'right',
      render: (_, record) => {
        if (record._id === user._id) {
          return <Text type="secondary">Tú</Text>
        }
        return (
          <Popconfirm title="¿Eliminar usuario?" description="Esta acción no se puede deshacer" onConfirm={() => handleDelete(record._id)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        )
      } 
    }
  ]

  if (user.role === 'superadmin') {
    columns.splice(2, 0, {
      title: 'Empresa',
      dataIndex: 'companyId',
      key: 'company',
      render: (company) => company?.name || <Text type="secondary">N/A</Text>
    })
  }

  return (
    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>Gestión de Empleados</Title>
          <Text type="secondary">
            {user.role === 'superadmin' ? 'Todas las Empresas' : `Empresa: ${user.companyName}`}
          </Text>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Nuevo Empleado
          </Button>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="Buscar por nombre, email o empresa..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
          />
        </Col>
      </Row>

      <Table 
        dataSource={users.filter(u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.companyId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        )} 
        columns={columns} 
        rowKey="_id"
        loading={loading}
        pagination={{ defaultPageSize: 10 }}
      />

      <Modal
        title="Nuevo Empleado"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="Crear Usuario"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Nombre completo" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Contraseña temporal" rules={[{ required: true, min: 6 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="confirmPassword" label="Confirmar contraseña" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
