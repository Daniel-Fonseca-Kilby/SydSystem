import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'

dotenv.config()

const makeSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Conectado a MongoDB')

    // Find the first admin or user to convert
    const user = await User.findOne({})
    if (!user) {
      console.log('No hay usuarios en la base de datos.')
      process.exit(1)
    }

    user.role = 'superadmin'
    await user.save()

    console.log(`¡Éxito! El usuario ${user.email} ahora es SUPERADMIN.`)
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

makeSuperAdmin()
