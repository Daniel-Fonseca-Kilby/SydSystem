export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export const calculateInvoiceTotals = (invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * (invoice.taxRate / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
}
