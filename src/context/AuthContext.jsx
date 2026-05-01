import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const userInfo = localStorage.getItem('userInfo')
      if (userInfo && userInfo !== 'undefined') {
        setUser(JSON.parse(userInfo))
      }
    } catch (error) {
      console.error('Error parsing user info from local storage:', error)
      localStorage.removeItem('userInfo')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('userInfo', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userInfo')
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando aplicación...</div>
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
