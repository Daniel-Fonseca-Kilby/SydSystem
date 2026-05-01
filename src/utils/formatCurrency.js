export const formatCurrency = (amount, currency = 'MXN') => {
    try {
        if (currency === 'all') {
            return '$' + new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0)
        }
        
        // Mapa de monedas a sus 'locales' recomendados para que muestren su símbolo correcto (ej. ₡ en lugar de CRC)
        const localeMap = {
            'MXN': 'es-MX',
            'USD': 'en-US',
            'EUR': 'es-ES',
            'CRC': 'es-CR',
            'COP': 'es-CO',
            'ARS': 'es-AR',
            'CLP': 'es-CL',
            'PEN': 'es-PE'
        }
        const locale = localeMap[currency] || 'es-MX'

        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency || 'MXN'
        }).format(amount || 0)
    } catch (e) {
        return `$${amount}`
    }
}
