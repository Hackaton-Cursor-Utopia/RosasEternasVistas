import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'de-favoritos'

type FavoritesContextValue = {
  favorites: string[]
  count: number
  isFavorite: (productId: string) => boolean
  toggleFavorite: (productId: string) => boolean
  toast: string | null
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as string[]) : []
    } catch {
      return []
    }
  })
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // storage unavailable
    }
  }, [favorites])

  const toggleFavorite = (productId: string) => {
    const exists = favorites.includes(productId)
    if (exists) {
      setFavorites((prev) => prev.filter((id) => id !== productId))
      setToast('Quitado de favoritos')
    } else {
      setFavorites((prev) => [...prev, productId])
      setToast('Guardado en favoritos')
    }
    setTimeout(() => {
      setToast(null)
    }, 2400)
    return !exists
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        count: favorites.length,
        isFavorite,
        toggleFavorite,
        toast,
      }}
    >
      {children}
      {/* Toast Flotante de Favoritos */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[12px] font-bold text-on-primary shadow-xl backdrop-blur-md animate-fade-in">
          <span>{toast}</span>
        </div>
      )}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider')
  return ctx
}
