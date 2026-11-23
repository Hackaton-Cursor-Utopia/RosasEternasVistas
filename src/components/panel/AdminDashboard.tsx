import { Icon } from '../ui/Icon'
import { formatMxn } from '../../lib/format'
import { METRICAS_MOCK } from '../../mocks/sales.mock'

type AdminDashboardProps = {
  onVerPedidos: () => void
  onAgregarRamo: () => void
}

export function AdminDashboard({ onVerPedidos, onAgregarRamo }: AdminDashboardProps) {
  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* 4 Tarjetas de Métricas KPI: 2 en móvil, 4 en lg: */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Ventas Mes */}
        <div className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-surface-variant uppercase">
              Ventas Mes
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-container/30 text-primary">
              <Icon name="payments" className="text-[18px]" />
            </span>
          </div>
          <div className="mt-3">
            <span className="font-headline text-xl md:text-2xl font-bold text-primary">
              {formatMxn(METRICAS_MOCK.ventasMes)}
            </span>
            <span className="block text-[11px] text-tertiary font-bold mt-0.5">
              {METRICAS_MOCK.ventasMesDelta}
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
              {METRICAS_MOCK.ramosTaller} Ramos
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
              {formatMxn(METRICAS_MOCK.porCobrar)}
            </span>
            <span className="block text-[11px] text-on-surface-variant mt-0.5">
              MXN en {METRICAS_MOCK.anticiposAbiertos} anticipos
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
              {METRICAS_MOCK.enviosHoy} Envíos
            </span>
            <span className="block text-[11px] text-on-surface-variant mt-0.5">
              Programados hoy
            </span>
          </div>
        </div>
      </div>

      {/* Grid Secundario: Demanda & Capacidad en 2 Columnas en lg: */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Demanda por Temporada */}
        <section className="flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                  <Icon name="pie_chart" className="text-[16px]" />
                </span>
                <h4 className="font-headline text-base font-bold text-on-surface">
                  Demanda por Temporada
                </h4>
              </div>
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
                Q1 2025
              </span>
            </div>
            <p className="mt-1.5 text-[12px] text-on-surface-variant leading-relaxed">
              Distribución de encargos recibidos en el atelier durante el período actual.
            </p>

            {/* Barra multicolor */}
            <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-surface-container">
              <div className="h-full bg-primary" style={{ width: '65%' }} />
              <div className="h-full bg-tertiary" style={{ width: '20%' }} />
              <div className="h-full bg-secondary-blush" style={{ width: '15%' }} />
            </div>
          </div>

          {/* Leyenda */}
          <div className="mt-5 flex items-center justify-between text-[11px] md:text-[12px] pt-3 border-t border-surface-variant/40">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="font-semibold">San Valentín</span>
              <span className="text-on-surface-variant">65% (42)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-tertiary" />
              <span className="font-semibold">Cumpleaños</span>
              <span className="text-on-surface-variant">20% (13)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary-blush" />
              <span className="font-semibold">Aniversarios</span>
              <span className="text-on-surface-variant">15% (10)</span>
            </div>
          </div>
        </section>

        {/* Capacidad del Taller y Acciones Rápidas */}
        <section className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-tertiary-fixed/40 text-tertiary">
                <Icon name="precision_manufacturing" className="text-[22px]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-on-surface">Capacidad del Taller</h4>
                <p className="text-[12px] text-on-surface-variant">
                  {METRICAS_MOCK.mesasActivas} de {METRICAS_MOCK.mesasTotales} mesas de envoltura activas
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onVerPedidos}
              className="rounded-xl bg-surface-container-lowest px-3.5 py-1.5 text-[11px] font-bold text-primary shadow-sm hover:bg-surface-variant active:scale-95 transition-all"
            >
              Ver Tareas
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
              Libro de Pedidos
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
