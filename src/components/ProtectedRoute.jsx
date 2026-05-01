import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const ProtectedRoute = ({ requireAdmin, requireSuperAdmin }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && user.role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  if (requireAdmin && user.role !== 'admin' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
