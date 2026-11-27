import { api } from './client'
import { USE_MOCKS } from '../lib/env'
import { COLORES_MONO, LISTONES, PAPELES, EXTRAS_LUJO, OCASIONES, COLECCIONES } from '../lib/atelier'

export interface ItemCatalogo {
  id: number
  categoria: string
  clave: string
  nombre: string
  valorhex?: string | null
  icono?: string | null
  valornumerico?: number | null
  precioextra: number
  orden: number
  activo: boolean
}

export type CatalogosAgrupados = {
  ColoresRosas?: ItemCatalogo[]
  Listones?: ItemCatalogo[]
  Papeles?: ItemCatalogo[]
  Extras?: ItemCatalogo[]
  Ocasiones?: ItemCatalogo[]
  Colecciones?: ItemCatalogo[]
  [key: string]: ItemCatalogo[] | undefined
}

// Fallback elegante en caso de modo offline
function getMockCatalogos(): CatalogosAgrupados {
  return {
    ColoresRosas: COLORES_MONO.map((c, i) => ({
      id: i + 1,
      categoria: 'ColoresRosas',
      clave: c.id,
      nombre: c.nombre,
      valorhex: c.hex,
      precioextra: 0,
      orden: i,
      activo: true,
    })),
    Listones: LISTONES.map((c, i) => ({
      id: i + 10,
      categoria: 'Listones',
      clave: c.id,
      nombre: c.nombre,
      valorhex: c.hex,
      precioextra: 0,
      orden: i,
      activo: true,
    })),
    Papeles: PAPELES.map((p, i) => ({
      id: i + 20,
      categoria: 'Papeles',
      clave: p.id,
      nombre: p.nombre,
      valorhex: p.hex,
      precioextra: 0,
      orden: i,
      activo: true,
    })),
    Extras: EXTRAS_LUJO.map((e, i) => ({
      id: i + 30,
      categoria: 'Extras',
      clave: e.id,
      nombre: e.label,
      precioextra: e.precio,
      icono: e.icon,
      orden: i,
      activo: true,
    })),
    Ocasiones: OCASIONES.map((o, i) => ({
      id: i + 40,
      categoria: 'Ocasiones',
      clave: o.id,
      nombre: o.label,
      icono: o.icon,
      precioextra: 0,
      orden: i,
      activo: true,
    })),
    Colecciones: COLECCIONES.map((c, i) => ({
      id: i + 50,
      categoria: 'Colecciones',
      clave: c.id,
      nombre: c.label,
      precioextra: 0,
      orden: i,
      activo: true,
    })),
  }
}

export async function fetchCatalogos(): Promise<CatalogosAgrupados> {
  if (USE_MOCKS) {
    return getMockCatalogos()
  }

  try {
    const res = await api.get<CatalogosAgrupados>('/catalogos')
    if (res && typeof res === 'object' && Object.keys(res).length > 0) {
      return res
    }
  } catch (err) {
    console.warn('No se pudo conectar a /api/catalogos, usando catálogo local:', err)
  }
  return getMockCatalogos()
}

export async function fetchCatalogoPorCategoria(categoria: string): Promise<ItemCatalogo[]> {
  const todos = await fetchCatalogos()
  return todos[categoria] ?? []
}

export async function crearItemCatalogo(
  categoria: string,
  data: {
    nombre: string
    clave?: string
    valorhex?: string
    icono?: string
    precioextra?: number
    orden?: number
  }
): Promise<ItemCatalogo | null> {
  try {
    const res = await api.post<ItemCatalogo>(`/catalogos/${categoria}`, data)
    window.dispatchEvent(new Event('catalogos-updated'))
    return res
  } catch (err) {
    console.error('Error al crear item en catálogo:', err)
    return null
  }
}

export async function actualizarItemCatalogo(
  itemId: number,
  data: Partial<ItemCatalogo>
): Promise<ItemCatalogo | null> {
  try {
    const res = await api.put<ItemCatalogo>(`/catalogos/items/${itemId}`, data)
    window.dispatchEvent(new Event('catalogos-updated'))
    return res
  } catch (err) {
    console.error('Error al actualizar item del catálogo:', err)
    return null
  }
}

export async function desactivarItemCatalogo(itemId: number): Promise<boolean> {
  try {
    await api.delete(`/catalogos/items/${itemId}`)
    window.dispatchEvent(new Event('catalogos-updated'))
    return true
  } catch (err) {
    console.error('Error al desactivar item del catálogo:', err)
    return false
  }
}
