import { useState, useEffect, useCallback } from 'react'
import { Card, Table, Button, Space, Popconfirm, Modal, Form, Input, InputNumber, App as AntApp, Typography, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useProducts, useSaveProduct, useDeleteProduct } from '../hooks/useApi'
import { formatCurrency } from '../utils/formatCurrency'

const { Title } = Typography

export const ProductManager = () => {
    const { data: products = [], isLoading: loading } = useProducts()
    const { mutate: saveProduct } = useSaveProduct()
    const { mutate: deleteProduct } = useDeleteProduct()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [form] = Form.useForm()

    const handleAdd = () => {
        setEditingProduct(null)
        form.resetFields()
        setIsModalOpen(true)
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        form.setFieldsValue(product)
        setIsModalOpen(true)
    }

    const handleDelete = (id) => {
        deleteProduct(id, {
            onSuccess: () => message.success('Producto eliminado')
        })
    }

    const handleSave = (values) => {
        const data = editingProduct ? { ...values, id: editingProduct._id || editingProduct.id } : values
        saveProduct(data, {
            onSuccess: () => {
                message.success(`Producto ${editingProduct ? 'actualizado' : 'creado'} correctamente`)
                setIsModalOpen(false)
            }
        })
    }

    const columns = [
        { title: 'Descripción', dataIndex: 'description', key: 'description' },
        { title: 'Categoría', dataIndex: 'category', key: 'category' },
        { 
            title: 'Precio Unitario', 
            dataIndex: 'price', 
            key: 'price', 
            align: 'right',
            render: (val) => formatCurrency(val, 'MXN') // Generic formatting
        },
        { 
            title: 'Acciones', 
            key: 'actions', 
            align: 'right',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="¿Eliminar producto?" description="Esta acción no se puede deshacer" onConfirm={() => handleDelete(record._id || record.id)}>
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
                    <Title level={4} style={{ margin: 0 }}>Catálogo de Productos y Servicios</Title>
                </Col>
                <Col>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                        Nuevo Producto
                    </Button>
                </Col>
            </Row>

            <Table 
                dataSource={products} 
                columns={columns} 
                rowKey={(record) => record._id || record.description}
                loading={loading}
                pagination={{ defaultPageSize: 10 }}
            />

            <Modal
                title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                okText="Guardar"
                cancelText="Cancelar"
            >
                <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 24 }}>
                    <Form.Item name="description" label="Descripción" rules={[{ required: true, message: 'Ingresa una descripción' }]}>
                        <Input placeholder="Ej. Diseño de Logotipo" />
                    </Form.Item>
                    
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item name="price" label="Precio Unitario" rules={[{ required: true, message: 'Ingresa un precio' }]}>
                                <InputNumber min={0} step={0.01} style={{ width: '100%' }} prefix="$" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item name="category" label="Categoría">
                                <Input placeholder="Ej. Servicios" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </Card>
    )
}
