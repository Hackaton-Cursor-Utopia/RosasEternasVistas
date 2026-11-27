import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { formatMxn } from '../../lib/format'
import { fetchPedidos } from '../../api/orders'
import type { PedidoGuardado } from '../../lib/ordersStorage'

type AdminDashboardProps = {
  onVerPedidos: () => void
  onAgregarRamo: () => void
}

export function AdminDashboard({ onVerPedidos, onAgregarRamo }: AdminDashboardProps) {
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([])

  useEffect(() => {
    fetchPedidos().then(setPedidos)
    const handleUpdate = () => fetchPedidos().then(setPedidos)
    window.addEventListener('pedidos-updated', handleUpdate)
    return () => window.removeEventListener('pedidos-updated', handleUpdate)
  }, [])

  // Métricas reales calculadas desde la base de datos
  const totalVentas = pedidos.reduce((acc, p) => acc + (p.pagadoHoy || 0), 0)
  const ramosTaller = pedidos.filter((p) => p.estado === 'taller').length
  const porCobrar = pedidos.reduce((acc, p) => acc + (p.saldoRestante || 0), 0)
  const anticiposAbiertos = pedidos.filter((p) => (p.saldoRestante || 0) > 0).length
  const enviosHoy = pedidos.filter((p) => p.estado === 'envio').length

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* 4 Tarjetas de Métricas KPI: 2 en móvil, 4 en lg: */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Ventas Mes */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              Ventas Cobradas
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/30 text-primary">
              <Icon name="payments" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-xl md:text-2xl font-bold text-primary">
              {formatMxn(totalVentas)}
            </span>
            <span className="block text-[11px] text-tertiary font-bold mt-0.5">
              {pedidos.length} pedidos registrados
            </span>
          </div>
        </div>

        {/* Taller Ramos Activos */}
        <div
          onClick={onVerPedidos}
          className="flex cursor-pointer flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60 hover:ring-primary transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              Taller
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/40 text-primary">
              <Icon name="content_cut" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-xl md:text-2xl font-bold text-on-surface">
              {ramosTaller} Ramos
            </span>
            <span className="block text-[11px] text-on-surface-variant mt-0.5">
              En confección activa
            </span>
          </div>
        </div>

        {/* Por Cobrar */}
        <div
          onClick={onVerPedidos}
          className="flex cursor-pointer flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60 hover:ring-primary transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              Por Cobrar
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/50 text-primary">
              <Icon name="pending_actions" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-xl md:text-2xl font-bold text-primary">
              {formatMxn(porCobrar)}
            </span>
            <span className="block text-[11px] text-on-surface-variant mt-0.5">
              en {anticiposAbiertos} saldos pendientes
            </span>
          </div>
        </div>

        {/* Rutas CDMX */}
        <div
          onClick={onVerPedidos}
          className="flex cursor-pointer flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60 hover:ring-tertiary transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              Rutas CDMX
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary text-on-tertiary">
              <Icon name="local_shipping" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-xl md:text-2xl font-bold text-tertiary">
              {enviosHoy} Envíos
            </span>
            <span className="block text-[11px] text-on-surface-variant mt-0.5">
              En reparto en ruta
            </span>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <section className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary-fixed/40 text-tertiary">
              <Icon name="precision_manufacturing" className="text-[22px]" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-on-surface">Atelier Coyoacán (Matriz)</h4>
              <p className="text-[12px] text-on-surface-variant">
                Control operativo centralizado en PostgreSQL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onVerPedidos}
            className="rounded-xl bg-surface-container-lowest px-3.5 py-1.5 text-[11px] font-bold text-primary shadow-sm hover:bg-surface-variant active:scale-95 transition-all"
          >
            Ver Libro de Pedidos
          </button>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-surface-variant/40">
          <button
            type="button"
            onClick={onAgregarRamo}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-on-primary shadow-sm hover:opacity-95 active:scale-95 transition-all"
          >
            <Icon name="add_circle" className="text-[17px]" />
            Dar de Alta Nuevo Ramo
          </button>
          <button
            type="button"
            onClick={onVerPedidos}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-2.5 text-[12px] font-bold text-on-surface ring-1 ring-surface-variant active:scale-95 transition-all"
          >
            <Icon name="menu_book" className="text-[17px]" />
            Libro de Pedidos ({pedidos.length})
          </button>
        </div>
      </section>
    </div>
  )
}
