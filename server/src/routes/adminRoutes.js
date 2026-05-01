import express from 'express'
import Company from '../models/Company.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Middleware para verificar superadmin
const superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'superadmin') {
    next()
  } else {
    res.status(403).json({ message: 'No autorizado. Se requiere rol de superadmin' })
  }
}

router.use(protect)
router.use(superAdmin)

// GET /api/admin/companies - Listar todas las empresas
router.get('/companies', async (req, res) => {
  try {
    const companies = await Company.find({}).sort({ createdAt: -1 })
    res.json(companies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/admin/stats - Estadísticas globales
router.get('/stats', async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments()
    res.json({ totalCompanies })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/admin/companies/:id - Eliminar empresa y sus datos
router.delete('/companies/:id', async (req, res) => {
  try {
    const companyId = req.params.id
    
    const company = await Company.findById(companyId)
    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' })
    }

    // Opcional: Eliminar datos asociados (usuarios, clientes, etc.)
    // Aquí puedes importar los modelos y hacer deleteMany
    // await User.deleteMany({ companyId })
    
    await Company.findByIdAndDelete(companyId)
    res.json({ message: 'Empresa eliminada correctamente' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
