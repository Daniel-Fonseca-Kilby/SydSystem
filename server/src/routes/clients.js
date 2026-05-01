import express from 'express'
import Client from '../models/Client.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.use(protect)

const getQueryFilter = (req) => {
  return req.user.role === 'superadmin' ? {} : { companyId: req.user.companyId }
}

// GET /api/clients - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find(getQueryFilter(req)).sort({ lastname: 1 })
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/clients/search?email= - Buscar cliente por email
router.get('/search', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' })
    }
    const client = await Client.findOne({ email: email.toLowerCase(), ...getQueryFilter(req) })
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    res.json(client)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/clients - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const client = new Client({
      ...req.body,
      companyId: req.user.companyId
    })
    const savedClient = await client.save()
    res.status(201).json(savedClient)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email del cliente ya está registrado' })
    }
    res.status(400).json({ message: error.message })
  }
})

// PUT /api/clients/:id - Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, ...getQueryFilter(req) },
      req.body,
      { new: true, runValidators: true }
    )
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    res.json(client)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El email ya está registrado' })
    }
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/clients/:id - Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, ...getQueryFilter(req) })
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }
    res.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
