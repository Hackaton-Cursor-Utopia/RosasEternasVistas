import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchProductos } from '../api/products'
import { isApiError, isNetworkError } from '../api/client'
import type { Producto } from '../types/models'

export function useCatalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Leemos filtros de la URL para permitir compartir y navegación con historial
  const ocasion = searchParams.get('ocasion') || 'todas'
  const coleccion = searchParams.get('coleccion') || 'todas'

  const setOcasion = useCallback(
    (nuevaOcasion: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (nuevaOcasion === 'todas') {
          next.delete('ocasion')
        } else {
          next.set('ocasion', nuevaOcasion)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const setColeccion = useCallback(
    (nuevaColeccion: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (nuevaColeccion === 'todas') {
          next.delete('coleccion')
        } else {
          next.set('coleccion', nuevaColeccion)
        }
        return next
      })
    },
    [setSearchParams],
  )

  const limpiarFiltros = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const datos = await fetchProductos()
      setProductos(datos)
    } catch (err) {
      if (isNetworkError(err) || isApiError(err)) {
        setError(err.message)
      } else {
        setError('No se pudo cargar el catálogo.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Combinación (intersección) de ambos filtros
  const filtrados = useMemo(() => {
    return productos.filter((item) => {
      const matchOcasion = ocasion === 'todas' || item.ocasion === ocasion
      const matchColeccion = coleccion === 'todas' || item.coleccion === coleccion
      return matchOcasion && matchColeccion
    })
  }, [productos, ocasion, coleccion])

  return {
    productos,
    filtrados,
    loading,
    error,
    ocasion,
    setOcasion,
    coleccion,
    setColeccion,
    limpiarFiltros,
    recargar: load,
  }
}
