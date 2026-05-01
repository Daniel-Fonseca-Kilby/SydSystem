import { useState, useEffect } from 'react'

export const useLocalStorage = (key, initialValue) => {
    // Leer valor inicial desde localStorage o usar el valor por defecto
    const readValue = () => {
        if (typeof window === 'undefined') {
            return initialValue
        }

        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    }

    const [storedValue, setStoredValue] = useState(readValue)

    // Persistir en localStorage cuando cambia el valor
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(storedValue))
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error)
        }
    }, [key, storedValue])

    return [storedValue, setStoredValue]
}
