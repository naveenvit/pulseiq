import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.warn(`useLocalStorage: failed to save key "${key}"`)
    }
  }, [key, value])

  const remove = () => {
    if (typeof window === "undefined") return
    window.localStorage.removeItem(key)
    setValue(initialValue)
  }

  return [value, setValue, remove] as const
}