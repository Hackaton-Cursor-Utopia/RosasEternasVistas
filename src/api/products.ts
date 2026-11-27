import { api } from './client'
import { USE_MOCKS } from '../lib/env'
import { PRODUCTOS_MOCK } from '../mocks/products.mock'
import type { CrearProductoRequest, EstadoCatalogo, ListaRespuesta, Producto } from '../types/models'

const STORAGE_KEY_PRODUCTOS = 'de-catalogo-productos'

export function obtenerProductosMemoria(): Producto[] {
  if (typeof window === 'undefined') return [...PRODUCTOS_MOCK]
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRODUCTOS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Error al leer productos de localStorage:', e)
  }
  guardarProductosMemoria([...PRODUCTOS_MOCK])
  return [...PRODUCTOS_MOCK]
}

export function guardarProductosMemoria(lista: Producto[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTOS, JSON.stringify(lista))
    window.dispatchEvent(new Event('catalogo-updated'))
  } catch (e) {
    console.warn('Error al guardar productos en localStorage:', e)
  }
}

export function actualizarProductoCatalogo(id: string, updates: Partial<Producto>): Producto | null {
  const lista = obtenerProductosMemoria()
  const idx = lista.findIndex((p) => p.id === id)
  if (idx === -1) return null

  const actualizado = {
    ...lista[idx],
    ...updates,
    actualizadoEn: new Date().toISOString(),
  }
  lista[idx] = actualizado
  guardarProductosMemoria(lista)
  return actualizado
}

export function toggleAgotadoProducto(id: string): Producto | null {
  const lista = obtenerProductosMemoria()
  const prod = lista.find((p) => p.id === id)
  if (!prod) return null

  const esAgotado = prod.estado === 'agotado' || prod.stock === 0
  const nuevoEstado: EstadoCatalogo = esAgotado ? 'activo' : 'agotado'
  const nuevoStock = esAgotado ? 6 : 0
  const nuevoBadge = esAgotado ? undefined : 'Agotado'

  return actualizarProductoCatalogo(id, {
    estado: nuevoEstado,
    stock: nuevoStock,
    badge: nuevoBadge,
  })
}

function asProducto(raw: Record<string, unknown>): Producto {
  const precio = Number(raw.precioUnitario ?? raw.precio_unitario ?? raw.precio ?? 0)
  const anticipo = Number(raw.montoAnticipo ?? raw.monto_anticipo ?? 0)
  return {
    id: String(raw.id ?? ''),
    sku: String(raw.sku ?? ''),
    nombre: String(raw.nombre ?? ''),
    descripcion: String(raw.descripcion ?? ''),
    tipo: raw.tipo === 'producto' ? 'producto' : 'arreglo',
    categoria: String(raw.categoria ?? 'Ramos'),
    ocasion: String(raw.ocasion ?? 'todas'),
    coleccion: String(raw.coleccion ?? 'clasicos'),
    color: raw.color ? String(raw.color) : undefined,
    piezas: Number(raw.piezas ?? 12),
    stock: Number(raw.stock ?? 0),
    badge: raw.badge ? String(raw.badge) : undefined,
    image_url: raw.image_url ? String(raw.image_url) : raw.imagenUrl ? String(raw.imagenUrl) : null,
    estado: (raw.estado as Producto['estado']) ?? 'activo',
    precioUnitario: precio,
    montoAnticipo: anticipo,
    tasaIva: Number(raw.tasaIva ?? raw.tasa_iva ?? 0.16),
    ivaIncluido: Boolean(raw.ivaIncluido ?? raw.iva_incluido ?? true),
    creadoEn: String(raw.creadoEn ?? raw.created_at ?? ''),
    actualizadoEn: String(raw.actualizadoEn ?? raw.updated_at ?? ''),
  }
}

export async function fetchProductos(): Promise<Producto[]> {
  if (USE_MOCKS) {
    await new Promise((r) => setTimeout(r, 60))
    return obtenerProductosMemoria()
  }

  const payload = await api.get<ListaRespuesta<Record<string, unknown>> | Record<string, unknown>[]>(
    '/products',
  )
  const rows = Array.isArray(payload) ? payload : payload.datos
  return rows.map(asProducto)
}

export async function createProducto(body: CrearProductoRequest): Promise<Producto> {
  if (USE_MOCKS) {
    const isAgotado = body.estado === 'agotado' || body.stock === 0
    const nuevo: Producto = {
      id: crypto.randomUUID(),
      sku: `DE-${Date.now()}`,
      nombre: body.nombre,
      descripcion: body.descripcion ?? '',
      tipo: 'arreglo',
      categoria: 'Ramos',
      ocasion: body.ocasion,
      coleccion: body.coleccion ?? 'clasicos',
      piezas: body.piezas,
      stock: isAgotado ? 0 : (body.stock ?? 1),
      image_url: body.image_url,
      estado: isAgotado ? 'agotado' : (body.estado ?? 'activo'),
      badge: isAgotado ? 'Agotado' : undefined,
      precioUnitario: body.precioUnitario,
      montoAnticipo: body.precioUnitario,
      tasaIva: 0.16,
      ivaIncluido: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    }
    const lista = obtenerProductosMemoria()
    lista.unshift(nuevo)
    guardarProductosMemoria(lista)
    return nuevo
  }

  const payload = await api.post<Record<string, unknown>>('/products', body)
  return asProducto(payload)
}

export async function uploadProductoImagen(file: File): Promise<string> {
  if (USE_MOCKS) {
    return URL.createObjectURL(file)
  }
  const form = new FormData()
  form.append('imagen', file)
  const payload = await api.post<{ url: string }>('/uploads/image', form)
  return payload.url
}
