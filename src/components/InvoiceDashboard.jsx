import { useMemo, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, DatePicker, Space, Select, Empty } from 'antd'
import { FileTextOutlined, DollarOutlined, CheckCircleOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '../utils/formatCurrency'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const COLORS = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f']

const calculateInvoiceTotals = (invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
    }, 0)
    const tax = subtotal * (invoice.taxRate / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
}

const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(year, parseInt(month) - 1)
    return date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })
}

export const InvoiceDashboard = ({ invoices }) => {
    const [dateRange, setDateRange] = useState(null)
    const [currencyFilter, setCurrencyFilter] = useState('all')

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            // Filter by currency
            const invCurrency = inv.currency || 'MXN'
            if (currencyFilter !== 'all' && invCurrency !== currencyFilter) return false

            // Filter by date range
            if (dateRange && dateRange[0] && dateRange[1]) {
                const invDate = dayjs(inv.date)
                if (invDate.isBefore(dateRange[0], 'day') || invDate.isAfter(dateRange[1], 'day')) {
                    return false
                }
            }
            return true
        })
    }, [invoices, dateRange, currencyFilter])

    const statusData = useMemo(() => {
        const statusTotals = { paid: 0, pending: 0, overdue: 0, draft: 0 }
        filteredInvoices.forEach(inv => {
            const { total } = calculateInvoiceTotals(inv)
            statusTotals[inv.status] = (statusTotals[inv.status] || 0) + total
        })
        return [
            { name: 'Pagadas', amount: statusTotals.paid },
            { name: 'Pendientes', amount: statusTotals.pending },
            { name: 'Vencidas', amount: statusTotals.overdue },
            { name: 'Borrador', amount: statusTotals.draft }
        ]
    }, [filteredInvoices])

    const pieData = useMemo(() => {
        const counts = {
            paid: filteredInvoices.filter(i => i.status === 'paid').length,
            pending: filteredInvoices.filter(i => i.status === 'pending').length,
            overdue: filteredInvoices.filter(i => i.status === 'overdue').length,
            draft: filteredInvoices.filter(i => i.status === 'draft').length
        }
        return [
            { name: 'Pagadas', value: counts.paid },
            { name: 'Pendientes', value: counts.pending },
            { name: 'Vencidas', value: counts.overdue },
            { name: 'Borrador', value: counts.draft }
        ].filter(item => item.value > 0)
    }, [filteredInvoices])

    const monthlyData = useMemo(() => {
        const monthlyTotals = {}
        filteredInvoices.forEach(inv => {
            const date = new Date(inv.date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const { total } = calculateInvoiceTotals(inv)
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = { count: 0, amount: 0 }
            }
            monthlyTotals[monthKey].count += 1
            monthlyTotals[monthKey].amount += total
        })
        return Object.entries(monthlyTotals)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6) // Mostrar solo últimos 6 meses del filtro
            .map(([key, data]) => ({
                month: formatMonth(key),
                count: data.count,
                amount: data.amount
            }))
    }, [filteredInvoices])

    const stats = useMemo(() => {
        const totalInvoices = filteredInvoices.length
        const totalAmount = filteredInvoices.reduce((sum, inv) => sum + calculateInvoiceTotals(inv).total, 0)
        const paidAmount = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + calculateInvoiceTotals(inv).total, 0)
        const pendingAmount = totalAmount - paidAmount
        return { totalInvoices, totalAmount, paidAmount, pendingAmount }
    }, [filteredInvoices])

    // Get unique currencies available in invoices
    const availableCurrencies = useMemo(() => {
        const currencies = new Set(invoices.map(i => i.currency || 'MXN'))
        if (!currencies.has('MXN')) currencies.add('MXN') // Default
        return ['all', ...Array.from(currencies)]
    }, [invoices])

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{ marginBottom: 24, borderRadius: 12 }}>
                <Row gutter={[16, 16]} align="middle" justify="space-between">
                    <Col>
                        <Space>
                            <FilterOutlined style={{ color: '#1677ff' }} />
                            <Text strong>Filtros del Dashboard:</Text>
                        </Space>
                    </Col>
                    <Col>
                        <Space wrap>
                            <Select
                                value={currencyFilter}
                                onChange={setCurrencyFilter}
                                style={{ width: 120 }}
                                options={availableCurrencies.map(c => ({ value: c, label: c === 'all' ? 'Todas las Monedas' : c }))}
                            />
                            <RangePicker 
                                onChange={setDateRange} 
                                format="DD/MM/YYYY" 
                                allowClear
                                placeholder={['Fecha Inicio', 'Fecha Fin']}
                            />
                        </Space>
                    </Col>
                </Row>
            </Card>

            {filteredInvoices.length === 0 ? (
                <Card variant="borderless" style={{ borderRadius: 12 }}>
                    <Empty description={`No hay datos ${currencyFilter === 'all' ? '' : `para ${currencyFilter} `}en el rango seleccionado`} />
                </Card>
            ) : (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless" hoverable style={{ borderRadius: 12 }}>
                                <Statistic 
                                    title="Total Facturas" 
                                    value={stats.totalInvoices} 
                                    prefix={<FileTextOutlined />} 
                                    styles={{ content: { color: '#1677ff' } }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless" hoverable style={{ borderRadius: 12 }}>
                                <Statistic 
                                    title={`Monto Total${currencyFilter === 'all' ? '' : ` (${currencyFilter})`}`} 
                                    value={stats.totalAmount} 
                                    precision={2} 
                                    prefix={<DollarOutlined />} 
                                    formatter={value => formatCurrency(value, currencyFilter)}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless" hoverable style={{ borderRadius: 12 }}>
                                <Statistic 
                                    title={`Cobrado${currencyFilter === 'all' ? '' : ` (${currencyFilter})`}`}
                                    value={stats.paidAmount} 
                                    precision={2} 
                                    prefix={<CheckCircleOutlined />} 
                                    styles={{ content: { color: '#52c41a' } }}
                                    formatter={value => formatCurrency(value, currencyFilter)}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card variant="borderless" hoverable style={{ borderRadius: 12 }}>
                                <Statistic 
                                    title={`Por Cobrar${currencyFilter === 'all' ? '' : ` (${currencyFilter})`}`}
                                    value={stats.pendingAmount} 
                                    precision={2} 
                                    prefix={<ClockCircleOutlined />} 
                                    styles={{ content: { color: '#faad14' } }}
                                    formatter={value => formatCurrency(value, currencyFilter)}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <Card title={`Monto por Estado${currencyFilter === 'all' ? '' : ` (${currencyFilter})`}`} variant="borderless" style={{ borderRadius: 12 }}>
                                <div style={{ height: 300, minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={statusData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(value) => formatCurrency(value, currencyFilter)} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="amount" fill="#1677ff" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Distribución de Facturas" variant="borderless" style={{ borderRadius: 12 }}>
                                <div style={{ height: 300, minWidth: 0 }}>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <Card title={`Tendencia Mensual${currencyFilter === 'all' ? '' : ` (${currencyFilter})`}`} variant="borderless" style={{ borderRadius: 12 }}>
                        <div style={{ height: 300, minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value, name) => {
                                            if (name === 'amount') return formatCurrency(value, currencyFilter)
                                            return value
                                        }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar yAxisId="left" dataKey="count" fill="#52c41a" name="Facturas" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar yAxisId="right" dataKey="amount" fill="#faad14" name="Monto" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </>
            )}
        </div>
    )
}
