import { useState, useEffect, useCallback } from 'react'
import { App as AntApp } from 'antd'
import { BrowserRouter, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import { useCompanyConfig } from '../context/CompanyConfigContext'
import { generateInvoicePDF } from '../utils/generateInvoicePDF'
import { useInvoices, useSaveInvoice, useDeleteInvoice, useMarkInvoiceAsPaid } from '../hooks/useApi'

import { AppLayout } from './AppLayout'
import { InvoiceDashboard } from './InvoiceDashboard'
import { InvoiceList } from './InvoiceList'
import { ClientManager } from './ClientManager'
import { ProductManager } from './ProductManager'
import { NewInvoiceForm } from './NewInvoiceForm'
import { InvoiceDetail } from './InvoiceDetail'
import { Login } from './Login'
import { RegisterCompany } from './RegisterCompany'
import { ProtectedRoute } from './ProtectedRoute'
import { UserManager } from './UserManager'
import { SuperAdminDashboard } from './SuperAdminDashboard'

export const InvoiceApp = () => {
    return (
        <BrowserRouter>
            <InvoiceAppInner />
        </BrowserRouter>
    )
}

const InvoiceAppInner = () => {
    const { config, updateConfig } = useCompanyConfig()
    const { message } = AntApp.useApp()
    const navigate = useNavigate()

    const { data: invoices = [], isLoading: loading } = useInvoices()
    const { mutate: saveInvoice } = useSaveInvoice()
    const { mutate: deleteInvoice } = useDeleteInvoice()
    const { mutate: markAsPaid } = useMarkInvoiceAsPaid()

    const overdueCount = invoices.filter(i => i.status === 'overdue').length

    const handleSaveInvoice = (newInvoice) => {
        saveInvoice(newInvoice, {
            onSuccess: () => {
                message.success(`Factura ${newInvoice.id ? 'actualizada' : 'creada'} correctamente`)
                navigate('/invoices')
            }
        })
    }

    const handleDeleteInvoice = (id) => {
        deleteInvoice(id, {
            onSuccess: () => {
                message.success('Factura eliminada')
                navigate('/invoices')
            }
        })
    }

    const handleMarkAsPaid = (id) => {
        markAsPaid(id, {
            onSuccess: () => message.success('Factura marcada como pagada')
        })
    }

    const handleDownloadPDF = (invoice) => {
        message.info('Generando PDF...')
        try {
            generateInvoicePDF(invoice, config)
            message.success('PDF descargado con éxito')
        } catch (error) {
            console.error(error)
            message.error('Error al generar el PDF')
        }
    }

    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterCompany />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<AppLayout overdueCount={overdueCount} />}>
                        <Route index element={<InvoiceDashboard invoices={invoices} />} />
                        <Route path="invoices" element={<InvoiceList invoices={invoices} loading={loading} />} />
                        
                        <Route path="invoices/new" element={
                            <NewInvoiceForm 
                                onSave={handleSaveInvoice}
                                onCancel={() => navigate('/invoices')}
                                config={config}
                            />
                        } />
                        
                        <Route path="invoices/:id" element={
                            <InvoiceDetailWrapper 
                                invoices={invoices}
                                onMarkAsPaid={handleMarkAsPaid}
                                onDelete={handleDeleteInvoice}
                                config={config}
                                onDownloadPDF={handleDownloadPDF}
                            />
                        } />
                        
                        <Route path="invoices/:id/edit" element={
                            <InvoiceEditWrapper 
                                invoices={invoices}
                                onSave={handleSaveInvoice}
                                config={config}
                            />
                        } />

                        <Route path="clients" element={<ClientManager />} />
                        <Route path="products" element={<ProductManager />} />

                        {/* Admin routes */}
                        <Route element={<ProtectedRoute requireAdmin={true} />}>
                            <Route path="users" element={<UserManager />} />
                        </Route>

                        {/* Super Admin routes */}
                        <Route element={<ProtectedRoute requireSuperAdmin={true} />}>
                            <Route path="superadmin" element={<SuperAdminDashboard />} />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </>
    )
}

// Wrappers para inyectar datos basados en la URL
const InvoiceDetailWrapper = ({ invoices, onMarkAsPaid, onDelete, config, onDownloadPDF }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const invoice = invoices.find(inv => (inv._id || inv.id).toString() === id)

    if (!invoice) return <div>Factura no encontrada</div>

    return (
        <InvoiceDetail 
            invoice={invoice}
            onBack={() => navigate('/invoices')}
            onMarkAsPaid={onMarkAsPaid}
            onEdit={(inv) => navigate(`/invoices/${inv._id || inv.id}/edit`)}
            onDelete={onDelete}
            config={config}
            onDownloadPDF={onDownloadPDF}
        />
    )
}

const InvoiceEditWrapper = ({ invoices, onSave, config }) => {
    const { id } = useParams()
    const navigate = useNavigate()
    const invoice = invoices.find(inv => (inv._id || inv.id).toString() === id)

    if (!invoice) return <div>Factura no encontrada</div>

    return (
        <NewInvoiceForm 
            onSave={onSave}
            onCancel={() => navigate(`/invoices/${id}`)}
            config={config}
            initialData={invoice}
        />
    )
}
