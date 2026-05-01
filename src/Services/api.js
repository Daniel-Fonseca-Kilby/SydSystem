const API_BASE_URL = 'http://localhost:3000/api'

const getAuthHeaders = () => {
  const userInfo = localStorage.getItem('userInfo')
  const headers = { 'Content-Type': 'application/json' }
  if (userInfo) {
    const { token } = JSON.parse(userInfo)
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const fetchAPI = async (endpoint, options = {}) => {
  const headers = getAuthHeaders()
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
      throw new Error('Sesión expirada. Por favor, inicia sesión de nuevo.')
    }
    
    let errorMessage = 'Error en la petición'
    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch (e) {}
    throw new Error(errorMessage)
  }
  
  return response.json()
}

// ============================================
// AUTH & USERS
// ============================================
export const authApi = {
  login: (credentials) => fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  registerCompany: (data) => fetchAPI('/auth/register-company', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getUsers: () => fetchAPI('/auth/users'),
  createUser: (userData) => fetchAPI('/auth/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  deleteUser: (id) => fetchAPI(`/auth/users/${id}`, {
    method: 'DELETE'
  })
}

// ============================================
// ADMIN
// ============================================
export const adminApi = {
  getCompanies: () => fetchAPI('/admin/companies'),
  getStats: () => fetchAPI('/admin/stats'),
  deleteCompany: (id) => fetchAPI(`/admin/companies/${id}`, { method: 'DELETE' })
}

// ============================================
// FACTURAS
// ============================================
export const invoiceApi = {
  getAll: () => fetchAPI('/invoices'),
  getById: (id) => fetchAPI(`/invoices/${id}`),
  create: (invoiceData) => fetchAPI('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData)
  }),
  update: (id, invoiceData) => fetchAPI(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData)
  }),
  delete: (id) => fetchAPI(`/invoices/${id}`, {
    method: 'DELETE'
  }),
  markAsPaid: (id) => fetchAPI(`/invoices/${id}/mark-paid`, {
    method: 'PATCH'
  })
}

// ============================================
// CLIENTES
// ============================================
export const clientApi = {
  getAll: () => fetchAPI('/clients'),
  getByEmail: async (email) => {
    try {
      return await fetchAPI(`/clients/search?email=${encodeURIComponent(email)}`)
    } catch (e) {
      return null
    }
  },
  create: (clientData) => fetchAPI('/clients', {
    method: 'POST',
    body: JSON.stringify(clientData)
  }),
  update: (id, clientData) => fetchAPI(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData)
  }),
  delete: (id) => fetchAPI(`/clients/${id}`, {
    method: 'DELETE'
  })
}

// ============================================
// PRODUCTOS
// ============================================
export const productApi = {
  getAll: () => fetchAPI('/products'),
  search: (description) => fetchAPI(`/products/search?description=${encodeURIComponent(description)}`),
  create: (productData) => fetchAPI('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  update: (id, productData) => fetchAPI(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  delete: (id) => fetchAPI(`/products/${id}`, {
    method: 'DELETE'
  })
}
