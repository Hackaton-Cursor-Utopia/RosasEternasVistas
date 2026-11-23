import { api } from './client'
import { USE_MOCKS } from '../lib/env'
import { PRODUCTOS_MOCK } from '../mocks/products.mock'
import type { CrearProductoRequest, ListaRespuesta, Producto } from '../types/models'

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
    await new Promise((r) => setTimeout(r, 280))
    return PRODUCTOS_MOCK
  }

  const payload = await api.get<ListaRespuesta<Record<string, unknown>> | Record<string, unknown>[]>(
    '/products',
  )
  const rows = Array.isArray(payload) ? payload : payload.datos
  return rows.map(asProducto)
}

export async function createProducto(body: CrearProductoRequest): Promise<Producto> {
  if (USE_MOCKS) {
    const nuevo: Producto = {
      id: crypto.randomUUID(),
      sku: `DE-${Date.now()}`,
      nombre: body.nombre,
      descripcion: body.descripcion ?? '',
      tipo: 'arreglo',
      categoria: 'Ramos',
      ocasion: body.ocasion,
      coleccion: 'clasicos',
      piezas: body.piezas,
      stock: 1,
      image_url: body.image_url,
      estado: 'activo',
      precioUnitario: body.precioUnitario,
      montoAnticipo: body.precioUnitario,
      tasaIva: 0.16,
      ivaIncluido: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    }
    PRODUCTOS_MOCK.unshift(nuevo)
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
