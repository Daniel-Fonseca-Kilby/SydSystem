import { createContext, useContext } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const defaultCompanyConfig = {
    name: 'Mi Empresa',
    fiscalName: 'Razón Social S.A. de C.V.',
    taxId: 'XAXX010101000', // RFC genérico
    address: 'Calle Principal 123',
    city: 'Ciudad de México',
    zipCode: '06600',
    country: 'México',
    email: 'contacto@miempresa.com',
    phone: '+52 55 1234 5678',
    logo: null,
    currency: 'MXN',
    taxRate: 16,
    invoicePrefix: 'INV',
    notes: 'Gracias por su preferencia'
}

const CompanyConfigContext = createContext(null)

export const CompanyConfigProvider = ({ children }) => {
    const [config, setConfig] = useLocalStorage('companyConfig', defaultCompanyConfig)

    const updateConfig = (newConfig) => {
        setConfig(prev => ({ ...prev, ...newConfig }))
    }

    const resetConfig = () => {
        setConfig(defaultCompanyConfig)
    }

    return (
        <CompanyConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
            {children}
        </CompanyConfigContext.Provider>
    )
}

export const useCompanyConfig = () => {
    const context = useContext(CompanyConfigContext)
    if (!context) {
        throw new Error('useCompanyConfig debe usarse dentro de CompanyConfigProvider')
    }
    return context
}
