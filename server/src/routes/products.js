import express from 'express'
import Product from '../models/Product.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

const getQueryFilter = (req) => {
  return req.user.role === 'superadmin' ? {} : { companyId: req.user.companyId }
}

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ active: true, ...getQueryFilter(req) }).sort({ description: 1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/products/search?description= - Buscar producto por descripción
router.get('/search', async (req, res) => {
  try {
    const { description } = req.query
    if (!description) {
      return res.status(400).json({ message: 'Descripción es requerida' })
    }
    const products = await Product.find({
      active: true,
      ...getQueryFilter(req),
      description: { $regex: description, $options: 'i' }
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/products - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      companyId: req.user.companyId
    })
    const savedProduct = await product.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El producto ya existe' })
    }
    res.status(400).json({ message: error.message })
  }
})

// PUT /api/products/:id - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, ...getQueryFilter(req) },
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json(product)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El producto ya existe' })
    }
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/products/:id - Eliminar producto (lógico - set active: false)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, ...getQueryFilter(req) },
      { active: false },
      { new: true }
    )
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }
    res.json({ message: 'Producto eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
