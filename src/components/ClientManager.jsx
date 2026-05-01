import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Space, Popconfirm, Modal, Form, Input, App as AntApp, Typography, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useClients, useSaveClient, useDeleteClient } from '../hooks/useApi'

const { Title } = Typography

export const ClientManager = () => {
    const { message } = AntApp.useApp()
    const { data: clients = [], isLoading: loading } = useClients()
    const { mutate: saveClient } = useSaveClient()
    const { mutate: deleteClient } = useDeleteClient()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingClient, setEditingClient] = useState(null)
    const [form] = Form.useForm()

    const handleAdd = () => {
        setEditingClient(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    const handleEdit = (client) => {
        setEditingClient(client)
        form.setFieldsValue(client)
        setIsModalOpen(true)
    }

    const handleDelete = (id) => {
        deleteClient(id, {
            onSuccess: () => message.success('Cliente eliminado')
        })
    }

    const handleSave = (values) => {
        const data = editingClient ? { ...values, id: editingClient._id || editingClient.id } : values
        saveClient(data, {
            onSuccess: () => {
                message.success(`Cliente ${editingClient ? 'actualizado' : 'creado'} correctamente`)
                setIsModalOpen(false)
            }
        })
    }

    const columns = [
        { title: 'Nombre', key: 'name', render: (_, record) => `${record.name} ${record.lastname}` },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Empresa', dataIndex: 'company', key: 'company' },
        { title: 'Ciudad', dataIndex: 'city', key: 'city' },
        { title: 'País', dataIndex: 'country', key: 'country' },
        { 
            title: 'Acciones', 
            key: 'actions', 
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="¿Eliminar cliente?" description="Esta acción no se puede deshacer" onConfirm={() => handleDelete(record._id || record.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ) 
        }
    ]

    return (
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={4} style={{ margin: 0 }}>Directorio de Clientes</Title>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Nuevo Cliente
                    </Button>
                </Col>
            </Row>

            <Table 
                dataSource={clients} 
                columns={columns} 
                rowKey={(record) => record._id || record.email}
                loading={loading}
                pagination={{ defaultPageSize: 10 }}
            />

            <Modal
                title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Guardar"
                cancelText="Cancelar"
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 24 }}>
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                                <Input placeholder="Ej. Juan" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="lastname" label="Apellidos" rules={[{ required: true, message: 'Ingresa los apellidos' }]}>
                                <Input placeholder="Ej. Pérez" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="email" label="Correo Electrónico" rules={[{ required: true, type: 'email', message: 'Ingresa un correo válido' }]}>
                                <Input placeholder="correo@ejemplo.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="company" label="Empresa (opcional)">
                                <Input placeholder="Nombre de la empresa" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={24}>
                            <Form.Item name="address" label="Dirección">
                                <Input placeholder="Calle, número, colonia..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="city" label="Ciudad">
                                <Input placeholder="Ciudad" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="zipCode" label="Código Postal">
                                <Input placeholder="C.P." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item name="country" label="País">
                                <Input placeholder="País" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    )
}
