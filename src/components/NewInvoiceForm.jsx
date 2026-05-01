import { useState, useEffect, useCallback } from 'react'
import { Form, Input, InputNumber, Button, Select, Space, Row, Col, Card, DatePicker, Typography, Divider, App, AutoComplete, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useInvoices, useClients, useProducts, useSaveClient, useSaveProduct } from '../hooks/useApi'
import dayjs from 'dayjs'
import { formatCurrency } from '../utils/formatCurrency'

const { Title, Text } = Typography

// Helpers
const generateInvoiceNumber = (prefix, year, count) => {
    return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`
}

export const NewInvoiceForm = ({ onSave, onCancel, config, initialData = null }) => {
    const [form] = Form.useForm()
    const { message } = App.useApp()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { data: savedClients = [], isLoading: loadingClients } = useClients()
    const { data: savedProducts = [], isLoading: loadingProducts } = useProducts()
    const { mutateAsync: saveClient } = useSaveClient()
    const { mutateAsync: saveProduct } = useSaveProduct()

    // Obtener la cantidad de facturas para el número autogenerado
    const { data: invoices = [] } = useInvoices()

    // Live Totals
    const items = Form.useWatch('items', form)
    const taxRate = Form.useWatch('taxRate', form)
    const currency = Form.useWatch('currency', form) || 'MXN'

    const subtotal = (items || []).reduce((sum, item) => sum + ((item?.quantity || 0) * (item?.unitPrice || 0)), 0)
    const tax = subtotal * ((taxRate || 0) / 100)
    const total = subtotal + tax

    // Clients and products are loaded automatically by React Query hooks above

    // Set initial values
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                invoiceNumber: initialData.invoiceNumber,
                date: dayjs(initialData.date),
                dueDate: dayjs(initialData.dueDate),
                clientName: initialData.client.name,
                clientLastname: initialData.client.lastname,
                clientEmail: initialData.client.email,
                clientCompany: initialData.client.company,
                clientAddress: initialData.client.address,
                clientCity: initialData.client.city,
                clientZipCode: initialData.client.zipCode,
                clientCountry: initialData.client.country,
                items: initialData.items,
                taxRate: initialData.taxRate,
                notes: initialData.notes,
                currency: initialData.currency || 'MXN'
            })
        } else {
            // El count será la longitud actual de las facturas
            const currentCount = invoices.length
            form.setFieldsValue({
                invoiceNumber: generateInvoiceNumber(config.invoicePrefix, new Date().getFullYear(), currentCount),
                date: dayjs(),
                items: [{ description: '', quantity: 1, unitPrice: 0 }],
                taxRate: config.taxRate,
                currency: 'MXN'
            })
        }
    }, [form, config, initialData, invoices.length])

    const handleClientSelect = (email) => {
        const client = savedClients.find(c => c.email === email)
        if (client) {
            form.setFieldsValue({
                clientName: client.name,
                clientLastname: client.lastname,
                clientEmail: client.email,
                clientCompany: client.company || '',
                clientAddress: client.address || '',
                clientCity: client.city || '',
                clientZipCode: client.zipCode || '',
                clientCountry: client.country || ''
            })
            message.success('Datos del cliente cargados')
        }
    }

    const handleProductSelect = (value, nameField) => {
        const product = savedProducts.find(p => p.description === value)
        if (product) {
            const currentItems = form.getFieldValue('items')
            currentItems[nameField].unitPrice = product.price
            form.setFieldsValue({ items: currentItems })
        }
    }

    const onFinish = async (values) => {
        setIsSubmitting(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 300))

            const clientData = {
                name: values.clientName,
                lastname: values.clientLastname,
                email: values.clientEmail,
                company: values.clientCompany,
                address: values.clientAddress,
                city: values.clientCity,
                zipCode: values.clientZipCode,
                country: values.clientCountry
            }

            // Save client to API if new
            const existingClient = savedClients.find(c => c.email === clientData.email)
            if (!existingClient) {
                try {
                    await saveClient(clientData)
                } catch (e) {
                    console.error('Error al guardar cliente nuevo:', e)
                }
            }

            // Save products to API if new
            for (const item of values.items) {
                if (item.description && !savedProducts.find(p => p.description === item.description)) {
                    try {
                        await saveProduct({ description: item.description, price: item.unitPrice })
                    } catch (e) {
                        console.error('Error al guardar producto nuevo:', e)
                    }
                }
            }

            const newInvoice = {
                id: initialData ? (initialData._id || initialData.id) : undefined,
                invoiceNumber: values.invoiceNumber,
                date: values.date.format('YYYY-MM-DD'),
                dueDate: values.dueDate.format('YYYY-MM-DD'),
                status: initialData ? initialData.status : 'pending',
                client: clientData,
                items: values.items.map((item, index) => ({ ...item, id: index })),
                taxRate: values.taxRate,
                notes: values.notes,
                currency: values.currency
            }

            onSave(newInvoice)
        } finally {
            setIsSubmitting(false)
        }
    }

    const productOptions = savedProducts.map(p => ({ value: p.description }))

    return (
        <Card variant="borderless" style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <Title level={4} style={{ marginBottom: 24 }}>
                {initialData ? `Editar Factura #${initialData.invoiceNumber}` : 'Nueva Factura'}
            </Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
            >
                <Row gutter={16}>
                    <Col xs={24} md={6}>
                        <Form.Item name="invoiceNumber" label="Número de Factura" rules={[{ required: true }]}>
                            <Input placeholder="INV-2026-001" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="date" label="Fecha de Emisión" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="dueDate" label="Fecha de Vencimiento" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                        <Form.Item name="currency" label="Moneda" rules={[{ required: true }]}>
                            <Select>
                                <Select.Option value="MXN">MXN - Peso Mexicano</Select.Option>
                                <Select.Option value="USD">USD - Dólar Estadounidense</Select.Option>
                                <Select.Option value="EUR">EUR - Euro</Select.Option>
                                <Select.Option value="CRC">CRC - Colón Costarricense</Select.Option>
                                <Select.Option value="CLP">CLP - Peso Chileno</Select.Option>
                                <Select.Option value="COP">COP - Peso Colombiano</Select.Option>
                                <Select.Option value="ARS">ARS - Peso Argentino</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Información del Cliente</Divider>
                
                {savedClients.length > 0 && (
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <Select
                                showSearch
                                placeholder="Seleccionar cliente guardado..."
                                optionFilterProp="children"
                                onChange={handleClientSelect}
                                style={{ width: '100%', maxWidth: 400 }}
                                suffixIcon={<UserOutlined />}
                            >
                                {savedClients.map(c => (
                                    <Select.Option key={c.email} value={c.email}>{c.name} {c.lastname} ({c.company || c.email})</Select.Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                )}

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="clientName" label="Nombre" rules={[{ required: true }]}>
                            <Input placeholder="Nombre" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="clientLastname" label="Apellidos" rules={[{ required: true }]}>
                            <Input placeholder="Apellidos" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="clientEmail" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input placeholder="correo@ejemplo.com" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="clientCompany" label="Empresa (opcional)">
                            <Input placeholder="Nombre de la empresa" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item name="clientAddress" label="Dirección">
                            <Input placeholder="Calle, número, etc." />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="clientCity" label="Ciudad">
                            <Input placeholder="Ciudad" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="clientZipCode" label="C.P.">
                            <Input placeholder="C.P." />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={4}>
                        <Form.Item name="clientCountry" label="País">
                            <Input placeholder="País" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Items</Divider>

                <Form.List name="items">
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Row key={key} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                                    <Col flex="auto">
                                        <Form.Item {...restField} name={[name, 'description']} rules={[{ required: true, message: 'Descripción requerida' }]} style={{ marginBottom: 0 }}>
                                            <AutoComplete
                                                options={productOptions}
                                                onSelect={(val) => handleProductSelect(val, name)}
                                                placeholder="Descripción del producto o servicio"
                                                filterOption={(inputValue, option) =>
                                                    option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                                }
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col flex="100px">
                                        <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                            <InputNumber min={1} placeholder="Cant." style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col flex="120px">
                                        <Form.Item {...restField} name={[name, 'unitPrice']} rules={[{ required: true }]} style={{ marginBottom: 0 }}>
                                            <InputNumber min={0} step={0.01} placeholder="Precio" style={{ width: '100%' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col>
                                        <Button type="text" danger onClick={() => remove(name)} icon={<DeleteOutlined />} disabled={fields.length === 1} />
                                    </Col>
                                </Row>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} style={{ marginTop: 16 }}>
                                    Agregar Item
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Row gutter={16}>
                    <Col xs={24} md={16}>
                        <Form.Item name="notes" label="Notas (opcional)">
                            <Input.TextArea rows={4} placeholder="Agrega notas adicionales..." />
                        </Form.Item>
                        <Form.Item name="taxRate" label="Tasa de IVA (%)" style={{ width: 150 }}>
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Row justify="space-between">
                                    <Text type="secondary">Subtotal:</Text>
                                    <Text>{formatCurrency(subtotal, currency)}</Text>
                                </Row>
                                <Row justify="space-between">
                                    <Text type="secondary">IVA ({taxRate}%):</Text>
                                    <Text>{formatCurrency(tax, currency)}</Text>
                                </Row>
                                <Divider style={{ margin: '8px 0' }} />
                                <Row justify="space-between">
                                    <Text strong>Total:</Text>
                                    <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{formatCurrency(total, currency)}</Text>
                                </Row>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                <Divider />

                <Space size="middle">
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isSubmitting} size="large">
                        {initialData ? 'Actualizar Factura' : 'Guardar Factura'}
                    </Button>
                    <Button onClick={onCancel} icon={<CloseOutlined />} size="large">
                        Cancelar
                    </Button>
                </Space>
            </Form>
        </Card>
    )
}
