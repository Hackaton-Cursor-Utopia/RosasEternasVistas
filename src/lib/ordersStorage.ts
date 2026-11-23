import type { MetodoEntrega, ModalidadPago } from '../types/models'

const STORAGE_KEY = 'de-pedidos-dispositivo'

export interface PedidoGuardado {
  id: string
  folio: string
  fecha: string
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo?: string
  productoNombre: string
  productoPiezas: number
  entrega: MetodoEntrega
  direccion?: string
  sucursalNombre?: string
  modalidad: ModalidadPago
  total: number
  pagadoHoy: number
  saldoRestante: number
  estado: 'taller' | 'listo' | 'envio' | 'entregado'
  referencia: string
}

export function guardarPedidoLocal(pedido: PedidoGuardado): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: PedidoGuardado[] = raw ? JSON.parse(raw) : []
    const updated = [pedido, ...list.filter((p) => p.folio !== pedido.folio)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // storage not available
  }
}

export function obtenerPedidosLocales(): PedidoGuardado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function buscarPedidoLocal(folio: string): PedidoGuardado | undefined {
  const list = obtenerPedidosLocales()
  return list.find((p) => p.folio.toLowerCase() === folio.trim().toLowerCase())
}
