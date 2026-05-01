import { useState } from 'react'
import { Card, Table, Typography, Row, Col, Statistic, Button, Modal, Form, Input, message, Popconfirm } from 'antd'
import { useCompanies, useAdminStats, useDeleteCompany } from '../hooks/useApi'
import { BankOutlined, CrownOutlined, PlusOutlined, UserOutlined, MailOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons'
import { authApi } from '../services/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const { Title, Text } = Typography

export const SuperAdminDashboard = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const { data: companies = [], isLoading: loadingCompanies } = useCompanies()
  const { data: stats, isLoading: loadingStats } = useAdminStats()
  const deleteCompanyMutation = useDeleteCompany()

  const createCompanyMutation = useMutation({
    mutationFn: (data) => authApi.registerCompany(data),
    onSuccess: () => {
      message.success('Empresa y administrador creados exitosamente')
      setIsModalVisible(false)
      form.resetFields()
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['adminStats'] })
    },
    onError: (error) => {
      message.error(error.message || 'Error al crear la empresa')
    }
  })

  const handleCreateCompany = (values) => {
    createCompanyMutation.mutate(values)
  }

  const columns = [
    {
      title: 'Nombre de la Empresa',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <><BankOutlined style={{ marginRight: 8 }} />{text}</>
    },
    // { title: 'Tax ID', dataIndex: 'taxId', key: 'taxId' },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar esta empresa?"
          description="Se eliminarán todos sus datos permanentemente. ¿Estás seguro?"
          onConfirm={() => deleteCompanyMutation.mutate(record._id)}
          okText="Sí, eliminar"
          cancelText="Cancelar"
          okButtonProps={{ danger: true }}
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteCompanyMutation.isPending && deleteCompanyMutation.variables === record._id}
          />
        </Popconfirm>
      )
    }
  ]

  return (
    <div style={{ padding: '0 0 24px 0' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <CrownOutlined style={{ color: '#faad14', marginRight: 12 }} />
            Super Admin Dashboard
          </Title>
          <Text type="secondary">Panel de control global del sistema</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalVisible(true)}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            Nueva Empresa
          </Button>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Total de Empresas"
              value={stats?.totalCompanies || 0}
              loading={loadingStats}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#4f46e5' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Statistic
              title="Nivel de Acceso"
              value="Ilimitado"
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Input.Search
            placeholder="Buscar empresa por nombre o tax ID..."
            allowClear
            onChange={(e) => setSearchTerm(e.target.value)}
            size="large"
          />
        </Col>
      </Row>

      <Card title="Directorio de Empresas" bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table
          dataSource={companies.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.taxId || '').toLowerCase().includes(searchTerm.toLowerCase())
          )}
          columns={columns}
          rowKey="_id"
          loading={loadingCompanies}
          pagination={{ defaultPageSize: 10 }}
        />
      </Card>

      <Modal
        title="Crear Nueva Empresa"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCompany}
          requiredMark="optional"
        >
          <Form.Item
            name="companyName"
            label="Nombre de la Empresa"
            rules={[{ required: true, message: 'Ingresa el nombre de la empresa' }]}
          >
            <Input prefix={<BankOutlined />} placeholder="Ej. Abarrotes Los Patos" size="large" />
          </Form.Item>

          <Form.Item
            name="userName"
            label="Nombre del Administrador"
            rules={[{ required: true, message: 'Ingresa el nombre del administrador' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Ej. Juan Pérez" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Correo Electrónico del Administrador"
            rules={[
              { required: true, message: 'Ingresa el correo' },
              { type: 'email', message: 'Ingresa un correo válido' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@empresa.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Contraseña"
            rules={[{ required: true, message: 'Ingresa una contraseña' }, { min: 6, message: 'Mínimo 6 caracteres' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña segura" size="large" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={createCompanyMutation.isPending}
            >
              Registrar Empresa
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
