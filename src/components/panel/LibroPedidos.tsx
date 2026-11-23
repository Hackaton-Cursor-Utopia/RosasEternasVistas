import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { formatMxn } from '../../lib/format'
import { waUrl } from '../../lib/whatsapp'
import { PEDIDOS_MOCK } from '../../mocks/sales.mock'
import type { EstadoPedido, PedidoOperativo } from '../../types/models'

type FiltroEstado = 'todos' | 'taller' | 'envio' | 'liquidar'

const FILTROS: Array<{ id: FiltroEstado; label: string; icon: string }> = [
  { id: 'todos', label: 'Todos', icon: 'all_inbox' },
  { id: 'taller', label: 'Por Confeccionar', icon: 'content_cut' },
  { id: 'envio', label: 'Por Enviar CDMX', icon: 'local_shipping' },
  { id: 'liquidar', label: 'Por Liquidar', icon: 'pending_actions' },
]

export function LibroPedidos() {
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')

  const pedidosFiltrados = PEDIDOS_MOCK.filter((p) => {
    if (filtro === 'todos') return true
    return p.estados.includes(filtro as EstadoPedido)
  })

  const getMensajeWhatsApp = (pedido: PedidoOperativo) => {
    if (pedido.saldoPendiente > 0) {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, te saludamos del taller respecto a tu encargo *${pedido.folio}* (${pedido.descripcion}).
Tienes un saldo pendiente por liquidar de *${formatMxn(pedido.saldoPendiente)} MXN*. ¿Deseas liquidarlo por transferencia SPEI o al recibir? ✨`
    }
    if (pedido.estados.includes('envio')) {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, ¡tu ramo *${pedido.folio}* está listo para entrega! 🚗
Ruta: ${pedido.entregaEtiqueta}. Te mantendremos informado en cuanto salga el chofer.`
    }
    return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, te confirmamos que tu pedido *${pedido.folio}* está en la mesa de confección y caligrafía. ¡Quedará hermoso!`
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Libro de Pedidos</h3>
          <p className="text-[12px] text-on-surface-variant">Gestión de encargos, estados de confección y cobro en CDMX</p>
        </div>
        <span className="w-fit rounded-full bg-secondary-container/40 px-3 py-1 text-[11px] font-bold text-primary">
          {pedidosFiltrados.length} pedidos encontrados
        </span>
      </div>

      {/* Barra de Filtros Responsiva */}
      <div className="no-scrollbar -mx-4 md:mx-0 flex items-center gap-2 overflow-x-auto md:overflow-visible md:flex-wrap px-4 md:px-0 pb-1">
        {FILTROS.map((f) => {
          const active = filtro === f.id
          const count =
            f.id === 'todos'
              ? PEDIDOS_MOCK.length
              : PEDIDOS_MOCK.filter((p) => p.estados.includes(f.id as EstadoPedido)).length

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
                active
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name={f.icon} className="text-[15px]" />
              <span>{f.label}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                  active ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-variant text-on-surface-variant'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Cuadrícula de Tarjetas: 1 col (móvil), 2 col (md/lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pedidosFiltrados.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl bg-surface-container-low p-8 text-center text-[13px] text-on-surface-variant">
            No hay pedidos en este estado en este momento.
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div
              key={pedido.id}
              className="flex flex-col justify-between gap-3 rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-2.5">
                {/* Encabezado Folio & Estado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-bold text-primary">
                      {pedido.folio}
                    </span>
                    <span className="text-[12px] font-semibold text-on-surface">
                      • {pedido.clienteNombre}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      pedido.badgeTone === 'taller'
                        ? 'bg-secondary-container/40 text-primary'
                        : pedido.badgeTone === 'listo'
                          ? 'bg-tertiary-fixed/40 text-tertiary'
                          : 'bg-primary-fixed/60 text-primary'
                    }`}
                  >
                    {pedido.badge}
                  </span>
                </div>

                {/* Descripción del Ramo */}
                <div>
                  <p className="text-[13px] font-semibold text-on-surface leading-snug">
                    {pedido.descripcion}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                    <Icon name="schedule" className="text-[14px] text-primary" />
                    <span>{pedido.hora}</span>
                  </div>
                  <div className="mt-0.5 flex items-start gap-1.5 text-[11px] text-on-surface-variant">
                    <Icon name="local_shipping" className="text-[14px] text-tertiary mt-0.5 shrink-0" />
                    <span>{pedido.entregaEtiqueta}</span>
                  </div>
                </div>
              </div>

              {/* Desglose Económico & WhatsApp */}
              <div className="flex flex-col gap-2 pt-2 border-t border-surface-variant/40">
                <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2 text-[12px]">
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Total:</span>{' '}
                    <span className="font-bold text-on-surface">{formatMxn(pedido.total)} MXN</span>
                  </div>
                  <div>
                    {pedido.saldoPendiente > 0 ? (
                      <span className="font-bold text-primary">
                        Saldo: {formatMxn(pedido.saldoPendiente)} MXN
                      </span>
                    ) : (
                      <span className="font-bold text-tertiary">Liquidado 100%</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-on-surface-variant font-medium">
                    {pedido.nota}
                  </span>
                  <a
                    href={waUrl(getMensajeWhatsApp(pedido), pedido.clienteTelefono)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg bg-tertiary/10 px-3 py-1.5 text-[11px] font-bold text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all"
                  >
                    <Icon name="chat" className="text-[14px]" />
                    WhatsApp al {pedido.clienteTelefono}
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
