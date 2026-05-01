import { useState, useMemo } from 'react'
import { Card, Table, Typography, Button, Spin, Empty, Row, Col, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { StatusBadge } from './StatusBadge'
import { formatDate, calculateInvoiceTotals } from '../utils/invoiceUtils'
import { formatCurrency } from '../utils/formatCurrency'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography

const InvoiceFilters = ({ searchTerm, onSearchChange, statusFilter, onStatusChange, onCreateNew }) => {
    return (
        <Row gutter={16} style={{ marginBottom: 24 }} align="middle">
            <Col xs={24} sm={10} md={10}>
                <Input.Search 
                    placeholder="Buscar por número, cliente o empresa..." 
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    size="large"
                />
            </Col>
            <Col xs={24} sm={8}>
                <Select 
                    value={statusFilter}
                    onChange={onStatusChange}
                    size="large"
                    style={{ width: '100%' }}
                    options={[
                        { value: 'all', label: 'Todos los estados' },
                        { value: 'paid', label: 'Pagadas' },
                        { value: 'pending', label: 'Pendientes' },
                        { value: 'overdue', label: 'Vencidas' },
                        { value: 'draft', label: 'Borradores' }
                    ]}
                />
            </Col>
            <Col xs={24} sm={6} md={6} style={{ textAlign: 'right', marginTop: { xs: 16, sm: 0 } }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={onCreateNew}>
                    Nueva Factura
                </Button>
            </Col>
        </Row>
    )
}

export const InvoiceList = ({ invoices, loading }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const navigate = useNavigate()

    const filteredInvoices = useMemo(() => {
        return invoices.filter(invoice => {
            const matchesSearch = 
                invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.client.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (invoice.client.company && invoice.client.company.toLowerCase().includes(searchTerm.toLowerCase()))
            
            const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

            return matchesSearch && matchesStatus
        }).sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [invoices, searchTerm, statusFilter])

    const columns = [
        { title: 'Número', dataIndex: 'invoiceNumber', key: 'invoiceNumber', render: text => <Text strong>{text}</Text> },
        { title: 'Fecha', dataIndex: 'date', key: 'date', render: text => formatDate(text) },
        { title: 'Vencimiento', dataIndex: 'dueDate', key: 'dueDate', render: text => formatDate(text) },
        { title: 'Estado', dataIndex: 'status', key: 'status', render: status => <StatusBadge status={status} /> },
        { title: 'Cliente', key: 'client', render: (_, record) => `${record.client.name} ${record.client.lastname}` },
        { title: 'Total', key: 'total', align: 'right', render: (_, record) => <Text strong>{formatCurrency(calculateInvoiceTotals(record).total, record.currency || 'MXN')}</Text> },
    ]

    return (
        <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <InvoiceFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                onCreateNew={() => navigate('/invoices/new')}
            />
            {loading ? (
                <div style={{ padding: '60px 0', textAlign: 'center' }}>
                    <Spin size="large" tip="Cargando facturas..." />
                </div>
            ) : invoices.length === 0 ? (
                <Empty
                    description="No hay facturas registradas"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/invoices/new')}>
                        Crear primera factura
                    </Button>
                </Empty>
            ) : (
                <Table
                    dataSource={filteredInvoices}
                    columns={columns}
                    rowKey={(record) => record._id || record.id}
                    onRow={(record) => ({
                        onClick: () => navigate(`/invoices/${record._id || record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                    pagination={{ defaultPageSize: 10, showSizeChanger: true }}
                />
            )}
        </Card>
    )
}
