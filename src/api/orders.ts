import { api } from './client'
import { USE_MOCKS } from '../lib/env'
import {
  obtenerPedidosLocales,
  guardarPedidoLocal,
  cambiarEstadoPedido,
  liquidarSaldoPedido,
  type PedidoGuardado,
} from '../lib/ordersStorage'

export async function fetchPedidos(): Promise<PedidoGuardado[]> {
  if (USE_MOCKS) {
    return obtenerPedidosLocales()
  }

  try {
    const pedidos = await api.get<PedidoGuardado[]>('/pedidos')
    if (Array.isArray(pedidos) && pedidos.length > 0) {
      // Sincronizar en localStorage para redundancia offline
      pedidos.forEach((p) => guardarPedidoLocal(p))
      return pedidos
    }
  } catch (err) {
    console.warn('Fallo al conectar con /api/pedidos, usando almacenamiento local:', err)
  }
  return obtenerPedidosLocales()
}

export async function createPedido(pedido: PedidoGuardado): Promise<PedidoGuardado> {
  // Siempre guardar copia local inmediata
  guardarPedidoLocal(pedido)

  if (!USE_MOCKS) {
    try {
      const res = await api.post<PedidoGuardado>('/pedidos', pedido)
      if (res && res.folio) {
        guardarPedidoLocal(res)
        return res
      }
    } catch (err) {
      console.warn('Error al enviar pedido a la API:', err)
    }
  }
  return pedido
}

export async function updateEstadoPedido(
  folio: string,
  nuevoEstado: 'taller' | 'listo' | 'envio' | 'entregado'
): Promise<PedidoGuardado | null> {
  const localActualizado = cambiarEstadoPedido(folio, nuevoEstado)

  if (!USE_MOCKS) {
    try {
      const res = await api.patch<{ ok: boolean; pedido: PedidoGuardado }>(
        `/pedidos/${folio}/estado`,
        { estado: nuevoEstado }
      )
      if (res?.pedido) {
        guardarPedidoLocal(res.pedido)
        return res.pedido
      }
    } catch (err) {
      console.warn('Error al actualizar estado en la API:', err)
    }
  }
  return localActualizado
}

export async function liquidarSaldoPedidoApi(
  folio: string
): Promise<PedidoGuardado | null> {
  const localActualizado = liquidarSaldoPedido(folio)

  if (!USE_MOCKS) {
    try {
      const res = await api.post<{ ok: boolean; pedido: PedidoGuardado }>(
        `/pedidos/${folio}/liquidar`
      )
      if (res?.pedido) {
        guardarPedidoLocal(res.pedido)
        return res.pedido
      }
    } catch (err) {
      console.warn('Error al liquidar saldo en la API:', err)
    }
  }
  return localActualizado
}
