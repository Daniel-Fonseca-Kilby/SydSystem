import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Company from '../models/Company.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d'
  })
}

// @route   POST /api/auth/register-company
// @desc    Register a new company and its admin user
// @access  Public
router.post('/register-company', async (req, res) => {
  const { companyName, userName, email, password } = req.body

  try {
    if (!companyName || !userName || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' })
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' })
    }

    // 1. Create company
    const company = await Company.create({ name: companyName })

    // 2. Create admin user for this company
    const user = await User.create({
      name: userName,
      email,
      password,
      role: 'admin',
      companyId: company._id
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      companyName: company.name,
      token: generateToken(user._id)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).populate('companyId', 'name')

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId?._id || null,
        companyName: user.companyId?.name || null,
        token: generateToken(user._id)
      })
    } else {
      res.status(401).json({ message: 'Email o contraseña inválidos' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   POST /api/auth/users
// @desc    Create an employee user (Admin only)
// @access  Private/Admin
router.post('/users', protect, admin, async (req, res) => {
  const { name, email, password } = req.body

  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'El usuario ya existe' })
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      companyId: req.user.companyId
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   GET /api/auth/users
// @desc    Get all employees for the admin's company
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const query = req.user.role === 'superadmin' ? {} : { companyId: req.user.companyId }
    const users = await User.find(query).select('-password').populate('companyId', 'name')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// @route   DELETE /api/auth/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }
    
    // Prevent deleting users from other companies unless superadmin
    if (req.user.role !== 'superadmin' && user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({ message: 'No autorizado para eliminar este usuario' })
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' })
    }

    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'Usuario eliminado' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
