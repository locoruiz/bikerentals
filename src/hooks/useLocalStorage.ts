import { useState } from 'react'

const useLocalStorage = (key: string, initialValue: any = undefined) => {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue
        }
        try {
            const item = window.localStorage.getItem(key)
            return item ? JSON.parse(item) : initialValue
        } catch(e) {
            console.log(e)
            return initialValue
        }
    })

    const setValue = (value: any) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(value))
            }
        } catch (e) {
            console.log(e)
        }
    }

    return [storedValue, setValue]
}

export default useLocalStorage;