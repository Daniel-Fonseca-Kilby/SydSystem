import jsPDF from 'jspdf'
import 'jspdf-autotable'

export const generateInvoicePDF = (invoice, company) => {
    const doc = new jsPDF()

    // Colores
    const primaryColor = [79, 70, 229] // Indigo 600
    const secondaryColor = [147, 51, 234] // Purple 600

    // Variables de posición
    let yPos = 20

    // Header con gradiente simulado
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')

    // Nombre de la empresa emisora
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(company.name, 15, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(company.fiscalName, 15, yPos)

    yPos += 5
    doc.text(`RFC: ${company.taxId}`, 15, yPos)

    // Información de la factura (lado derecho)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text(`Factura #${invoice.invoiceNumber}`, 140, 25, { align: 'right' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPos = 45
    doc.text(`Fecha de emisión: ${formatDateSimple(invoice.date)}`, 140, yPos, { align: 'right' })

    yPos += 5
    doc.text(`Fecha de vencimiento: ${formatDateSimple(invoice.dueDate)}`, 140, yPos, { align: 'right' })

    // Estado
    yPos += 8
    const statusText = getStatusText(invoice.status)
    doc.text(`Estado: ${statusText}`, 140, yPos, { align: 'right' })

    // Resetear posición Y para el contenido
    yPos = 55

    // Información del cliente
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Información del Cliente', 15, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)

    const clientInfo = [
        `Nombre: ${invoice.client.name} ${invoice.client.lastname}`,
        `Empresa: ${invoice.client.company || 'N/A'}`,
        `Email: ${invoice.client.email}`,
        `Dirección: ${invoice.client.address}`,
        `Ciudad: ${invoice.client.city}, ${invoice.client.zipCode}`,
        `País: ${invoice.client.country}`
    ]

    clientInfo.forEach((line) => {
        doc.text(line, 15, yPos)
        yPos += 5
    })

    // Tabla de items
    yPos += 5
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Items', 15, yPos)

    const tableData = invoice.items.map((item) => [
        item.description,
        item.quantity.toString(),
        formatCurrency(item.unitPrice),
        formatCurrency(item.quantity * item.unitPrice)
    ])

    doc.autoTable({
        startY: yPos + 5,
        head: [['Descripción', 'Cantidad', 'Precio Unit.', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: primaryColor },
        margin: { left: 15, right: 15 },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { cellWidth: 25, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    })

    // Totales
    const finalY = doc.lastAutoTable.finalY + 10
    const { subtotal, tax, total } = calculateTotals(invoice)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    // Línea de subtotal
    doc.text('Subtotal:', 140, finalY, { align: 'right' })
    doc.text(formatCurrency(subtotal), 180, finalY, { align: 'right' })

    // Línea de impuesto
    yPos = finalY + 6
    doc.text(`IVA (${invoice.taxRate}%):`, 140, yPos, { align: 'right' })
    doc.text(formatCurrency(tax), 180, yPos, { align: 'right' })

    // Línea de total
    yPos += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...primaryColor)
    doc.text('Total:', 140, yPos, { align: 'right' })
    doc.text(formatCurrency(total), 180, yPos, { align: 'right' })

    // Notas
    if (invoice.notes) {
        yPos += 15
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)

        const splitNotes = doc.splitTextToSize(`Notas: ${invoice.notes}`, 180)
        doc.text(splitNotes, 15, yPos)
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages()
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.text(
            `Página ${i} de ${pageCount}`,
            105,
            285,
            { align: 'center' }
        )
        doc.text(
            `${company.name} - ${company.email}`,
            15,
            285
        )
    }

    return doc
}

// Funciones helper
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount)
}

const formatDateSimple = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const getStatusText = (status) => {
    const statusMap = {
        paid: 'Pagado',
        pending: 'Pendiente',
        overdue: 'Vencido',
        draft: 'Borrador'
    }
    return statusMap[status] || status
}

const calculateTotals = (invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice)
    }, 0)
    const tax = subtotal * (invoice.taxRate / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
}
