import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key')

      req.user = await User.findById(decoded.id).select('-password')
      
      if (!req.user) {
        return res.status(401).json({ message: 'No autorizado, usuario no encontrado' })
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401).json({ message: 'No autorizado, token falló' })
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No autorizado, no hay token' })
  }
}

export const admin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
    next()
  } else {
    res.status(401).json({ message: 'No autorizado como administrador' })
  }
}
