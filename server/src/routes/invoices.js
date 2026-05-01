import express from 'express'
import Invoice from '../models/Invoice.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Apply protection to all routes in this file
router.use(protect)

const getQueryFilter = (req) => {
  return req.user.role === 'superadmin' ? {} : { companyId: req.user.companyId }
}

// GET /api/invoices - Obtener todas las facturas
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find(getQueryFilter(req)).sort({ date: -1 })
    res.json(invoices)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/invoices/:id - Obtener factura por ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, ...getQueryFilter(req) })
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' })
    }
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/invoices - Crear nueva factura
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      companyId: req.user.companyId
    })
    const savedInvoice = await invoice.save()
    res.status(201).json(savedInvoice)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El número de factura ya existe' })
    }
    res.status(400).json({ message: error.message })
  }
})

// PUT /api/invoices/:id - Actualizar factura
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, ...getQueryFilter(req) },
      req.body,
      { new: true, runValidators: true }
    )
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' })
    }
    res.json(invoice)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El número de factura ya existe' })
    }
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/invoices/:id - Eliminar factura
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, ...getQueryFilter(req) })
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' })
    }
    res.json({ message: 'Factura eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/invoices/:id/mark-paid - Marcar como pagada
router.patch('/:id/mark-paid', async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, ...getQueryFilter(req) },
      { status: 'paid' },
      { new: true }
    )
    if (!invoice) {
      return res.status(404).json({ message: 'Factura no encontrada' })
    }
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
