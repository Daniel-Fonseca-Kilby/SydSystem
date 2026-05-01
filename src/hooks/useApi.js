import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoiceApi, clientApi, productApi, authApi, adminApi } from '../services/api'
import dayjs from 'dayjs'

// --- Super Admin ---
export const useCompanies = () => {
    return useQuery({
        queryKey: ['companies'],
        queryFn: () => adminApi.getCompanies()
    })
}

export const useAdminStats = () => {
    return useQuery({
        queryKey: ['adminStats'],
        queryFn: () => adminApi.getStats()
    })
}

export const useDeleteCompany = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => adminApi.deleteCompany(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            queryClient.invalidateQueries({ queryKey: ['adminStats'] })
        }
    })
}

// --- Users (Admin Only) ---
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => authApi.getUsers()
    })
}

export const useSaveUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userData) => authApi.createUser(userData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
    })
}

export const useDeleteUser = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => authApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
        }
    })
}

// --- Invoices ---
export const useInvoices = () => {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: async () => {
            const data = await invoiceApi.getAll()
            const today = dayjs().startOf('day')
            return data.map(inv => {
                if (inv.status === 'pending' && dayjs(inv.dueDate).isBefore(today)) {
                    return { ...inv, status: 'overdue' }
                }
                return inv
            })
        }
    })
}

export const useSaveInvoice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (invoice) => {
            if (invoice.id) {
                return await invoiceApi.update(invoice.id, invoice)
            }
            return await invoiceApi.create(invoice)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        }
    })
}

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => invoiceApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        }
    })
}

export const useMarkInvoiceAsPaid = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => invoiceApi.markAsPaid(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
        }
    })
}

// --- Clients ---
export const useClients = () => {
    return useQuery({
        queryKey: ['clients'],
        queryFn: () => clientApi.getAll()
    })
}

export const useSaveClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (client) => {
            if (client._id || client.id) {
                return await clientApi.update(client._id || client.id, client)
            }
            return await clientApi.create(client)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

export const useDeleteClient = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => clientApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] })
        }
    })
}

// --- Products ---
export const useProducts = () => {
    return useQuery({
        queryKey: ['products'],
        queryFn: () => productApi.getAll()
    })
}

export const useSaveProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (product) => {
            if (product._id || product.id) {
                return await productApi.update(product._id || product.id, product)
            }
            return await productApi.create(product)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        }
    })
}

export const useDeleteProduct = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id) => productApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
        }
    })
}
