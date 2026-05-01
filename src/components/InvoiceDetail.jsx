import { Card, Space, Button, Popconfirm, Row, Col, Descriptions, Table, Typography } from 'antd'
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, PrinterOutlined, DownloadOutlined, MailOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { StatusBadge } from './StatusBadge'
import { calculateInvoiceTotals, formatDate } from '../utils/invoiceUtils'
import { formatCurrency } from '../utils/formatCurrency'

const { Text } = Typography

export const InvoiceDetail = ({ invoice, onBack, onMarkAsPaid, onEdit, onDelete, config, onDownloadPDF }) => {
    const { subtotal, tax, total } = calculateInvoiceTotals(invoice)
    const currency = invoice.currency || 'MXN'

    const itemColumns = [
        { title: 'Descripción', dataIndex: 'description', key: 'description' },
        { title: 'Cantidad', dataIndex: 'quantity', key: 'quantity', align: 'center' },
        { title: 'Precio Unit.', dataIndex: 'unitPrice', key: 'unitPrice', align: 'right', render: val => formatCurrency(val, currency) },
        { title: 'Total', key: 'total', align: 'right', render: (_, record) => <strong>{formatCurrency(record.quantity * record.unitPrice, currency)}</strong> }
    ]

    return (
        <Card 
            title={<Space><Button type="text" icon={<ArrowLeftOutlined />} onClick={onBack} /> Detalle de Factura #{invoice.invoiceNumber}</Space>}
            extra={
                <Space>
                    <StatusBadge status={invoice.status} />
                    <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(invoice)} />
                    <Popconfirm title="¿Eliminar factura?" description="Esta acción no se puede deshacer" onConfirm={() => onDelete(invoice._id || invoice.id)}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            }
            style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                    <Descriptions title={config.name} column={1} size="small">
                        <Descriptions.Item label="Razón Social">{config.fiscalName}</Descriptions.Item>
                        <Descriptions.Item label="RFC">{config.taxId}</Descriptions.Item>
                        <Descriptions.Item label="Dirección">{config.address}, {config.city}</Descriptions.Item>
                    </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                    <Descriptions column={1} size="small" style={{ textAlign: 'right' }}>
                        <Descriptions.Item label="Moneda">{currency}</Descriptions.Item>
                        <Descriptions.Item label="Emitida">{formatDate(invoice.date)}</Descriptions.Item>
                        <Descriptions.Item label="Vence">{formatDate(invoice.dueDate)}</Descriptions.Item>
                    </Descriptions>
                </Col>
            </Row>

            <Card type="inner" title="Información del Cliente" style={{ marginTop: 24, marginBottom: 24 }}>
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                    <Descriptions.Item label="Nombre">{invoice.client.name} {invoice.client.lastname}</Descriptions.Item>
                    {invoice.client.company && <Descriptions.Item label="Empresa">{invoice.client.company}</Descriptions.Item>}
                    <Descriptions.Item label="Email">{invoice.client.email}</Descriptions.Item>
                    <Descriptions.Item label="Dirección">{invoice.client.address}</Descriptions.Item>
                    <Descriptions.Item label="Ciudad">{invoice.client.city}, {invoice.client.zipCode}</Descriptions.Item>
                    <Descriptions.Item label="País">{invoice.client.country}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Typography.Title level={5}>Items</Typography.Title>
            <Table 
                dataSource={invoice.items} 
                columns={itemColumns} 
                pagination={false}
                rowKey={(record) => record._id || record.id}
                summary={() => (
                    <Table.Summary>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right">Subtotal:</Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text>{formatCurrency(subtotal, currency)}</Text></Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right">IVA ({invoice.taxRate}%):</Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text>{formatCurrency(tax, currency)}</Text></Table.Summary.Cell>
                        </Table.Summary.Row>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong>Total:</Text></Table.Summary.Cell>
                            <Table.Summary.Cell index={1} align="right"><Text strong style={{ color: '#1677ff', fontSize: 16 }}>{formatCurrency(total, currency)}</Text></Table.Summary.Cell>
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            {invoice.notes && (
                <div style={{ marginTop: 24, padding: 16, backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8 }}>
                    <Text strong style={{ color: '#d48806' }}>Notas:</Text> <Text style={{ color: '#d48806' }}>{invoice.notes}</Text>
                </div>
            )}

            <Space wrap style={{ marginTop: 24 }} className="no-print">
                <Button icon={<PrinterOutlined />} onClick={() => window.print()}>
                    Imprimir
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => onDownloadPDF(invoice)}>
                    Descargar PDF
                </Button>
                <Button icon={<MailOutlined />}>
                    Enviar por Email
                </Button>
                {invoice.status !== 'paid' && (
                    <Button type="primary" style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => onMarkAsPaid(invoice._id || invoice.id)}>
                        Marcar como Pagada
                    </Button>
                )}
            </Space>
        </Card>
    )
}
