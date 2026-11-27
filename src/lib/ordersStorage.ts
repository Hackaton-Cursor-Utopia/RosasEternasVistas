import type { MetodoEntrega, ModalidadPago } from '../types/models'
import { formatMxn, formatMxnExact } from './format'
import { PEDIDOS_MOCK } from '../mocks/sales.mock'

const STORAGE_KEY = 'de-pedidos-dispositivo'

export type EstadoPago = 'pendiente' | 'verificando' | 'pagado' | 'rechazado'

export interface PedidoGuardado {
  id: string
  folio: string
  fecha: string
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo?: string
  productoNombre: string
  productoPiezas: number
  colorRosas?: string
  colorPapel?: string
  colorMono?: string
  entrega: MetodoEntrega
  direccion?: string
  sucursalNombre?: string
  modalidad: ModalidadPago
  total: number
  pagadoHoy: number
  saldoRestante: number
  estado: 'taller' | 'listo' | 'envio' | 'entregado'
  referencia: string
  estadoPago?: EstadoPago
  fechaPago?: string
  reciboEnviadoWhatsApp?: string
  reciboEnviadoCorreo?: string
  // Nuevos campos para taller y vendedor
  tipoVenta?: 'existencia' | 'encargo'
  notaInterna?: string
  dedicatoriaPara?: string
  dedicatoriaDe?: string
  dedicatoriaMensaje?: string
  activo?: boolean
}

// Convertir pedidos mock iniciales a PedidoGuardado si está vacío
function getInitialOrders(): PedidoGuardado[] {
  return PEDIDOS_MOCK.map((m) => {
    const estado = m.estados.includes('envio')
      ? 'envio'
      : m.badgeTone === 'listo'
        ? 'listo'
        : 'taller'
    return {
      id: m.id,
      folio: m.folio.replace('#', ''),
      fecha: 'Hoy',
      clienteNombre: m.clienteNombre,
      clienteTelefono: m.clienteTelefono,
      productoNombre: m.descripcion,
      productoPiezas: 12,
      entrega: m.entregaEtiqueta.toLowerCase().includes('roma') || m.entregaEtiqueta.toLowerCase().includes('camioneta') ? 'envio' : 'recoger',
      direccion: m.entregaEtiqueta,
      sucursalNombre: 'Atelier Roma Norte',
      modalidad: m.saldoPendiente > 0 ? 'anticipo' : 'completo',
      total: m.total,
      pagadoHoy: m.montoCobrado,
      saldoRestante: m.saldoPendiente,
      estado,
      referencia: `HBE-${m.folio.replace(/\D/g, '')}`,
      estadoPago: m.saldoPendiente === 0 ? 'pagado' : 'pendiente',
      tipoVenta: 'encargo',
      notaInterna: m.nota,
      activo: true,
    }
  })
}

export function guardarPedidoLocal(pedido: PedidoGuardado): void {
  try {
    const list = obtenerPedidosLocales()
    const cleanPedido = {
      ...pedido,
      folio: pedido.folio.replace('#', '').toUpperCase(),
      activo: pedido.activo !== false,
    }
    const updated = [cleanPedido, ...list.filter((p) => p.folio.toUpperCase() !== cleanPedido.folio)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('pedidos-updated'))
  } catch {
    // storage not available
  }
}

export function obtenerPedidosLocales(): PedidoGuardado[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const initial = getInitialOrders()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
    const list: PedidoGuardado[] = JSON.parse(raw)
    return list
  } catch {
    return []
  }
}

export function buscarPedidoLocal(folio: string): PedidoGuardado | undefined {
  const list = obtenerPedidosLocales()
  const clean = folio.replace('#', '').trim().toLowerCase()
  return list.find((p) => p.folio.replace('#', '').trim().toLowerCase() === clean)
}

export function actualizarPedidoLocal(
  folio: string,
  updates: Partial<PedidoGuardado>
): PedidoGuardado | undefined {
  try {
    const list = obtenerPedidosLocales()
    const clean = folio.replace('#', '').trim().toLowerCase()
    const index = list.findIndex((p) => p.folio.replace('#', '').trim().toLowerCase() === clean)
    if (index === -1) return undefined
    const updated = { ...list[index], ...updates }
    list[index] = updated
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('pedidos-updated'))
    return updated
  } catch {
    return undefined
  }
}

export function cambiarEstadoPedido(
  folio: string,
  nuevoEstado: 'taller' | 'listo' | 'envio' | 'entregado'
): PedidoGuardado | undefined {
  return actualizarPedidoLocal(folio, { estado: nuevoEstado })
}

export function liquidarSaldoPedido(folio: string): PedidoGuardado | undefined {
  const actual = buscarPedidoLocal(folio)
  if (!actual) return undefined
  return actualizarPedidoLocal(folio, {
    saldoRestante: 0,
    pagadoHoy: actual.total,
    estadoPago: 'pagado',
    fechaPago: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  })
}

/**
 * Genera el formato de texto oficial del Ticket / Recibo Digital de Dulce Eternidad Atelier
 */
export function generarTextoTicket(pedido: PedidoGuardado): string {
  const entregaTexto =
    pedido.entrega === 'envio'
      ? `🚗 Domicilio CDMX: ${pedido.direccion || 'Dirección registrada'}`
      : `🏪 Pick-up Atelier: ${pedido.sucursalNombre || 'Roma Norte'}`

  const estadoPagoTexto =
    pedido.estadoPago === 'pagado'
      ? '✅ PAGADO Y ACREDITADO'
      : '🟡 PENDIENTE DE VALIDACIÓN'

  return `━━━━━━━━━━━━━━━━━━━━━━━━━
🌸 *DULCE ETERNIDAD ATELIER CDMX* 🌸
     *Comprobante Oficial de Encargo*
━━━━━━━━━━━━━━━━━━━━━━━━━
📄 *Folio de Pedido:* ${pedido.folio}
📅 *Fecha:* ${pedido.fecha}
👤 *Cliente:* ${pedido.clienteNombre}
📱 *Teléfono:* +${pedido.clienteTelefono}
${pedido.clienteCorreo ? `✉️ *Correo:* ${pedido.clienteCorreo}\n` : ''}
📍 *Modalidad de Entrega:*
${entregaTexto}

💐 *Detalle del Ramo:*
• ${pedido.productoNombre} (${pedido.productoPiezas} Rosas)
${pedido.colorRosas ? `• Tono Rosas: ${pedido.colorRosas}\n` : ''}${pedido.colorPapel ? `• Papel: ${pedido.colorPapel}\n` : ''}${pedido.dedicatoriaMensaje ? `💌 *Dedicatoria:* "${pedido.dedicatoriaMensaje}"\n` : ''}
💰 *Desglose de Pago:*
• Total: ${formatMxn(pedido.total)} MXN
• Abonado: ${formatMxnExact(pedido.pagadoHoy)} MXN
${pedido.saldoRestante > 0 ? `• Saldo Pendiente: ${formatMxn(pedido.saldoRestante)} MXN` : '• Saldo Pendiente: $0.00 MXN (100% Liquidado)'}
• Estatus: ${estadoPagoTexto}
━━━━━━━━━━━━━━━━━━━━━━━━━`
}
