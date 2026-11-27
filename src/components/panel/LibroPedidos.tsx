import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from '../ui/Icon'
import { formatMxn, formatMxnExact } from '../../lib/format'
import { waUrl } from '../../lib/whatsapp'
import {
  obtenerPedidosLocales,
  cambiarEstadoPedido,
  liquidarSaldoPedido,
  type PedidoGuardado,
} from '../../lib/ordersStorage'

type FiltroEstado = 'todos' | 'taller' | 'listo' | 'envio' | 'liquidar' | 'entregado'

const FILTROS: Array<{ id: FiltroEstado; label: string; icon: string }> = [
  { id: 'todos', label: 'Todos', icon: 'all_inbox' },
  { id: 'taller', label: 'En Confección', icon: 'content_cut' },
  { id: 'listo', label: 'Listos / Vitrina', icon: 'inventory_2' },
  { id: 'envio', label: 'En Ruta CDMX', icon: 'local_shipping' },
  { id: 'liquidar', label: 'Por Liquidar', icon: 'pending_actions' },
  { id: 'entregado', label: 'Entregados', icon: 'task_alt' },
]

export function LibroPedidos() {
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([])
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoGuardado | null>(null)
  const [copiadoFolio, setCopiadoFolio] = useState(false)
  const [mostrarQrSaldo, setMostrarQrSaldo] = useState(false)
  const [procesandoPago, setProcesandoPago] = useState(false)

  // Cargar pedidos reactivamente y sincronizar con storage
  const recargarPedidos = () => {
    const list = obtenerPedidosLocales()
    setPedidos(list)
    if (pedidoDetalle) {
      const updated = list.find((p) => p.folio === pedidoDetalle.folio)
      if (updated) setPedidoDetalle(updated)
    }
  }

  useEffect(() => {
    recargarPedidos()
    const handleUpdate = () => recargarPedidos()
    window.addEventListener('pedidos-updated', handleUpdate)
    return () => window.removeEventListener('pedidos-updated', handleUpdate)
  }, [])

  const pedidosFiltrados = pedidos.filter((p) => {
    if (p.activo === false) return false
    if (filtro === 'todos') return true
    if (filtro === 'liquidar') return p.saldoRestante > 0
    return p.estado === filtro
  })

  const handleCambiarEstado = (nuevoEstado: 'taller' | 'listo' | 'envio' | 'entregado') => {
    if (!pedidoDetalle) return
    const actualizado = cambiarEstadoPedido(pedidoDetalle.folio, nuevoEstado)
    if (actualizado) {
      setPedidoDetalle(actualizado)
      recargarPedidos()
    }
  }

  // Liquidar saldo automáticamente desde QR o taller
  const handleLiquidarSaldoAutomatico = (marcarComoEntregado = false) => {
    if (!pedidoDetalle) return
    setProcesandoPago(true)

    setTimeout(() => {
      let actualizado = liquidarSaldoPedido(pedidoDetalle.folio)
      if (marcarComoEntregado && actualizado) {
        actualizado = cambiarEstadoPedido(pedidoDetalle.folio, 'entregado')
      }
      if (actualizado) {
        setPedidoDetalle(actualizado)
        recargarPedidos()
      }
      setProcesandoPago(false)
    }, 400)
  }

  const handleCopiarFolio = (folio: string) => {
    navigator.clipboard.writeText(folio)
    setCopiadoFolio(true)
    setTimeout(() => setCopiadoFolio(false), 2000)
  }

  const getMensajeWhatsApp = (pedido: PedidoGuardado) => {
    if (pedido.saldoRestante > 0) {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, te saludamos del taller respecto a tu encargo *${pedido.folio}* (${pedido.productoNombre}).
Tienes un saldo pendiente por liquidar de *${formatMxn(pedido.saldoRestante)} MXN*. ¿Deseas escanear el código QR para liquidarlo al momento? ✨`
    }
    if (pedido.estado === 'entregado') {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, ¡te confirmamos que tu pedido *${pedido.folio}* ha sido entregado exitosamente y liquidado al 100%! Gracias por confiar en Dulce Eternidad. ✨🌹`
    }
    if (pedido.estado === 'envio') {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, ¡tu ramo *${pedido.folio}* está en ruta de entrega en auto climatizado! 🚗
Destino: ${pedido.direccion || 'CDMX'}. Te avisaremos al aproximarse el chofer.`
    }
    if (pedido.estado === 'listo') {
      return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, te informamos que tu ramo *${pedido.folio}* está terminado y listo con su empaque protector en el Atelier. ✨`
    }
    return `🌸 *Dulce Eternidad Atelier CDMX*
Hola ${pedido.clienteNombre}, te confirmamos que tu encargo *${pedido.folio}* está en la mesa de confección artesanal y caligrafía. ¡Va a quedar hermoso!`
  }

  const getEstadoBadge = (estado: PedidoGuardado['estado']) => {
    switch (estado) {
      case 'taller':
        return { label: 'En Confección', cls: 'bg-secondary-container/50 text-primary' }
      case 'listo':
        return { label: 'Listo / Vitrina', cls: 'bg-tertiary-fixed/50 text-tertiary' }
      case 'envio':
        return { label: 'En Ruta CDMX', cls: 'bg-primary-fixed/60 text-primary' }
      case 'entregado':
        return { label: 'Entregado', cls: 'bg-emerald-100 text-emerald-800' }
      default:
        return { label: estado, cls: 'bg-surface-variant text-on-surface-variant' }
    }
  }

  // QR limpio generado para liquidación del saldo pendiente (sin datos bancarios)
  const qrDataSaldo = pedidoDetalle
    ? `https://dulceeternidad.com/liquidar?folio=${pedidoDetalle.folio}&saldo=${pedidoDetalle.saldoRestante}`
    : ''

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Libro de Pedidos</h3>
          <p className="text-[12px] text-on-surface-variant">
            Historial operativo, cobro de saldos con QR y seguimiento de entregas en CDMX
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-fit rounded-full bg-secondary-container/40 px-3 py-1 text-[11px] font-bold text-primary">
            {pedidosFiltrados.length} pedidos
          </span>
          <button
            type="button"
            onClick={recargarPedidos}
            title="Refrescar pedidos"
            className="rounded-full bg-surface-container p-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <Icon name="refresh" className="text-[18px]" />
          </button>
        </div>
      </div>

      {/* Barra de Filtros Responsiva (Incluye Entregados y Por Liquidar) */}
      <div className="no-scrollbar -mx-4 md:mx-0 flex items-center gap-2 overflow-x-auto md:overflow-visible md:flex-wrap px-4 md:px-0 pb-1">
        {FILTROS.map((f) => {
          const active = filtro === f.id
          const count =
            f.id === 'todos'
              ? pedidos.filter((p) => p.activo !== false).length
              : f.id === 'liquidar'
                ? pedidos.filter((p) => p.activo !== false && p.saldoRestante > 0).length
                : pedidos.filter((p) => p.activo !== false && p.estado === f.id).length

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

      {/* Cuadrícula de Tarjetas de Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pedidosFiltrados.length === 0 ? (
          <div className="md:col-span-2 rounded-2xl bg-surface-container-low p-8 text-center text-[13px] text-on-surface-variant">
            No hay pedidos en la categoría "{FILTROS.find((f) => f.id === filtro)?.label}" en este momento.
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => {
            const badge = getEstadoBadge(pedido.estado)
            const esVentaDirecta = pedido.tipoVenta === 'existencia'

            return (
              <div
                key={pedido.folio}
                onClick={() => {
                  setPedidoDetalle(pedido)
                  setMostrarQrSaldo(false)
                }}
                className="group flex flex-col justify-between gap-3.5 rounded-2xl bg-surface-container-lowest p-4 md:p-5 shadow-sm ring-1 ring-surface-variant/60 hover:shadow-md hover:ring-primary/60 transition-all cursor-pointer"
              >
                <div className="flex flex-col gap-2.5">
                  {/* Encabezado Folio, Tipo de Venta y Estado */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-bold text-primary">
                        {pedido.folio}
                      </span>
                      <span className="text-[12px] font-semibold text-on-surface truncate">
                        • {pedido.clienteNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          esVentaDirecta
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {esVentaDirecta ? 'Existencia' : 'Encargo'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Descripción del Ramo y Rosas */}
                  <div>
                    <p className="text-[13px] font-semibold text-on-surface leading-snug">
                      {pedido.productoNombre} ({pedido.productoPiezas} rosas)
                    </p>
                    {pedido.colorRosas && (
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Tono: <span className="font-semibold">{pedido.colorRosas}</span>
                        {pedido.colorPapel ? ` • Papel: ${pedido.colorPapel}` : ''}
                      </p>
                    )}
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                      <Icon
                        name={pedido.entrega === 'envio' ? 'local_shipping' : 'storefront'}
                        className="text-[14px] text-primary"
                      />
                      <span className="truncate">
                        {pedido.entrega === 'envio'
                          ? `Envío: ${pedido.direccion || 'CDMX'}`
                          : `Pick-up: ${pedido.sucursalNombre || 'Atelier Roma Norte'}`}
                      </span>
                    </div>
                  </div>

                  {/* Nota interna breve si existe */}
                  {pedido.notaInterna && (
                    <div className="rounded-lg bg-surface-container-low px-2.5 py-1.5 text-[10px] text-on-surface-variant italic truncate">
                      📌 {pedido.notaInterna}
                    </div>
                  )}
                </div>

                {/* Desglose Económico & Acciones */}
                <div className="flex flex-col gap-2 pt-2 border-t border-surface-variant/40">
                  <div className="flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2 text-[12px]">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-semibold">
                        Total:
                      </span>{' '}
                      <span className="font-bold text-on-surface">{formatMxn(pedido.total)} MXN</span>
                    </div>
                    <div>
                      {pedido.saldoRestante > 0 ? (
                        <span className="font-bold text-primary flex items-center gap-1">
                          <Icon name="qr_code_2" className="text-[13px]" />
                          Saldo: {formatMxn(pedido.saldoRestante)} MXN
                        </span>
                      ) : (
                        <span className="font-bold text-tertiary flex items-center gap-1">
                          <Icon name="check_circle" className="text-[13px]" />
                          Liquidado 100%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="text-[10px] font-bold text-primary group-hover:underline flex items-center gap-1">
                      <span>Ver detalle y cobro</span>
                      <Icon name="arrow_forward" className="text-[12px]" />
                    </span>

                    <a
                      href={waUrl(getMensajeWhatsApp(pedido), pedido.clienteTelefono)}
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg bg-tertiary/10 px-2.5 py-1.5 text-[11px] font-bold text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all"
                    >
                      <Icon name="chat" className="text-[14px]" />
                      <span>{pedido.clienteTelefono}</span>
                    </a>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL DE DETALLE DEL PEDIDO, COBRO POR QR Y CONTROL OPERATIVO   */}
      {/* ============================================================== */}
      {pedidoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl ring-1 ring-surface-variant/60">
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-surface-variant/40 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xl font-bold text-primary">
                  {pedidoDetalle.folio}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    getEstadoBadge(pedidoDetalle.estado).cls
                  }`}
                >
                  {getEstadoBadge(pedidoDetalle.estado).label}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopiarFolio(pedidoDetalle.folio)}
                  className="rounded-lg bg-surface-container-low px-2 py-1 text-[11px] font-bold text-primary hover:bg-surface-container"
                >
                  {copiadoFolio ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setPedidoDetalle(null)}
                className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* 1. SECCIÓN DE COBRO POR QR DEL SALDO PENDIENTE (SI HAY SALDO) */}
              {pedidoDetalle.saldoRestante > 0 ? (
                <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 via-surface-container-lowest to-surface-container-low p-4 sm:p-5 flex flex-col items-center text-center gap-3.5 shadow-sm">
                  <div className="flex items-center justify-between w-full border-b border-primary/10 pb-2">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="qr_code_scanner" className="text-[17px]" />
                      Cobro por Código QR • Saldo Pendiente
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                      Por Liquidar
                    </span>
                  </div>

                  {!mostrarQrSaldo ? (
                    /* BOTÓN PREVIO: GENERAR QR */
                    <div className="flex flex-col items-center gap-3 w-full py-2">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                        <Icon name="qr_code_2" className="text-[34px]" />
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          Saldo Pendiente de Cobro:
                        </span>
                        <p className="font-headline text-2xl sm:text-3xl font-bold text-primary mt-0.5">
                          {formatMxn(pedidoDetalle.saldoRestante)} <span className="text-[13px] font-normal">MXN</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-1.5 max-w-sm mx-auto leading-relaxed">
                          Presiona el botón para generar el código QR y mostrarlo al cliente para su escaneo directo en mostrador o entrega.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMostrarQrSaldo(true)}
                        className="mt-1 flex min-h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-[13px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
                      >
                        <Icon name="qr_code" className="text-[19px]" />
                        <span>Generar QR ({formatMxn(pedidoDetalle.saldoRestante)} MXN)</span>
                      </button>
                    </div>
                  ) : (
                    /* CÓDIGO QR VISIBLE Y BOTONES DE CONFIRMACIÓN */
                    <div className="flex flex-col items-center gap-3 w-full animate-fade-in">
                      {/* Código QR limpio para que el cliente lo escanee con su propio teléfono */}
                      <div className="rounded-2xl bg-white p-3.5 shadow-md ring-1 ring-black/10">
                        <QRCodeSVG
                          value={qrDataSaldo}
                          size={155}
                          level="M"
                          marginSize={1}
                          className="rounded-lg"
                        />
                        <div className="mt-2 flex items-center justify-center gap-1 text-zinc-600">
                          <Icon name="photo_camera" className="text-[13px]" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">
                            Escanear con celular
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                          Monto exacto a cobrar al cliente:
                        </span>
                        <p className="font-headline text-2xl font-bold text-primary">
                          {formatMxn(pedidoDetalle.saldoRestante)} <span className="text-[12px] font-normal">MXN</span>
                        </p>
                        <p className="text-[11px] text-on-surface-variant mt-1 max-w-sm">
                          Muestra este código al cliente para cobrar al instante sin necesidad de datos bancarios.
                        </p>
                      </div>

                      {/* Botones de Confirmación Automática */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                        <button
                          type="button"
                          onClick={() => handleLiquidarSaldoAutomatico(false)}
                          disabled={procesandoPago}
                          className="flex-1 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-on-primary shadow-sm hover:bg-primary/95 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                        >
                          {procesandoPago ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              <span>Registrando pago...</span>
                            </>
                          ) : (
                            <>
                              <Icon name="check_circle" className="text-[18px]" />
                              <span>Confirmar Cobro (Liquidar 100%)</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleLiquidarSaldoAutomatico(true)}
                          disabled={procesandoPago}
                          className="flex-1 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-[13px] font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
                        >
                          <Icon name="task_alt" className="text-[18px]" />
                          <span>Liquidar y Marcar Entregado</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMostrarQrSaldo(false)}
                        className="text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors pt-1 cursor-pointer"
                      >
                        Ocultar QR
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ESTADO 100% LIQUIDADO */
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shrink-0 shadow-xs">
                      <Icon name="check" className="text-[22px]" />
                    </span>
                    <div>
                      <p className="font-headline text-base font-bold text-emerald-950">
                        100% Liquidado • Totalmente Pagado
                      </p>
                      <p className="text-[11px] text-emerald-800">
                        Total liquidado: <strong>{formatMxn(pedidoDetalle.total)} MXN</strong>
                        {pedidoDetalle.fechaPago && ` • Registrado a las ${pedidoDetalle.fechaPago}`}
                      </p>
                    </div>
                  </div>

                  {pedidoDetalle.estado !== 'entregado' && (
                    <button
                      type="button"
                      onClick={() => handleCambiarEstado('entregado')}
                      className="shrink-0 flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                    >
                      <Icon name="task_alt" className="text-[15px]" />
                      <span>Marcar Entregado</span>
                    </button>
                  )}
                </div>
              )}

              {/* 2. Control de Estado de Confección & Entrega */}
              <div className="rounded-2xl bg-surface-container-low p-4">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2.5">
                  Actualizar Estado Operativo en Tiempo Real
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCambiarEstado('taller')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-[11px] font-bold transition-all ${
                      pedidoDetalle.estado === 'taller'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="content_cut" className="text-[18px] mb-1" />
                    <span>En Taller</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCambiarEstado('listo')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-[11px] font-bold transition-all ${
                      pedidoDetalle.estado === 'listo'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="inventory_2" className="text-[18px] mb-1" />
                    <span>Listo en Vitrina</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCambiarEstado('envio')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-[11px] font-bold transition-all ${
                      pedidoDetalle.estado === 'envio'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="local_shipping" className="text-[18px] mb-1" />
                    <span>En Ruta CDMX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCambiarEstado('entregado')}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-center text-[11px] font-bold transition-all ${
                      pedidoDetalle.estado === 'entregado'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="task_alt" className="text-[18px] mb-1" />
                    <span>Entregado</span>
                  </button>
                </div>
              </div>

              {/* 3. Datos del Cliente y Logística */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-surface-variant/60 p-4 space-y-1.5 text-[12px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                    Comprador / Contacto
                  </p>
                  <p className="font-bold text-base text-on-surface">
                    {pedidoDetalle.clienteNombre}
                  </p>
                  <p className="flex items-center gap-1.5 text-tertiary font-semibold">
                    <Icon name="chat" className="text-[15px]" />
                    {pedidoDetalle.clienteTelefono}
                  </p>
                  <p className="text-on-surface-variant text-[11px]">
                    Modalidad:{' '}
                    <strong className="text-on-surface uppercase">
                      {pedidoDetalle.tipoVenta === 'existencia' ? 'Venta mostrador' : 'Encargo taller'}
                    </strong>
                  </p>
                </div>

                <div className="rounded-2xl border border-surface-variant/60 p-4 space-y-1.5 text-[12px]">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                    Logística & Entrega
                  </p>
                  <p className="font-bold text-on-surface flex items-center gap-1.5">
                    <Icon
                      name={pedidoDetalle.entrega === 'envio' ? 'local_shipping' : 'storefront'}
                      className="text-[16px] text-primary"
                    />
                    {pedidoDetalle.entrega === 'envio'
                      ? 'Envío en auto climatizado CDMX'
                      : 'Recoger en mostrador / Atelier'}
                  </p>
                  <p className="text-on-surface-variant text-[11px]">
                    Destino: {pedidoDetalle.direccion || 'Atelier Roma Norte'}
                  </p>
                </div>
              </div>

              {/* 4. Especificaciones del Ramo */}
              <div className="rounded-2xl border border-surface-variant/60 p-4 space-y-2 text-[12px]">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">
                  Especificaciones del Arreglo Floral
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-on-surface">
                    {pedidoDetalle.productoNombre}
                  </span>
                  <span className="rounded-full bg-secondary-container/40 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {pedidoDetalle.productoPiezas} Rosas Satinadas
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant pt-1 border-t border-surface-variant/40">
                  <div>
                    Tono de pétalos:{' '}
                    <strong className="text-on-surface">{pedidoDetalle.colorRosas || 'Estándar'}</strong>
                  </div>
                  <div>
                    Envoltura:{' '}
                    <strong className="text-on-surface">{pedidoDetalle.colorPapel || 'Coreana'}</strong>
                  </div>
                </div>
              </div>

              {/* 5. Dedicatoria Manuscrita si existe */}
              {(pedidoDetalle.dedicatoriaMensaje || pedidoDetalle.dedicatoriaPara) && (
                <div className="rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 space-y-1.5 text-[12px]">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Icon name="history_edu" className="text-[15px]" />
                    Tarjeta Caligrafiada Manuscrita
                  </p>
                  <div className="flex items-center gap-4 text-[11px] text-amber-950">
                    {pedidoDetalle.dedicatoriaPara && (
                      <span>
                        Para: <strong>{pedidoDetalle.dedicatoriaPara}</strong>
                      </span>
                    )}
                    {pedidoDetalle.dedicatoriaDe && (
                      <span>
                        De parte de: <strong>{pedidoDetalle.dedicatoriaDe}</strong>
                      </span>
                    )}
                  </div>
                  {pedidoDetalle.dedicatoriaMensaje && (
                    <p className="font-serif italic text-amber-950 text-[13px] bg-white/70 p-2.5 rounded-xl border border-amber-200/40 mt-1">
                      "{pedidoDetalle.dedicatoriaMensaje}"
                    </p>
                  )}
                </div>
              )}

              {/* 6. Nota Interna del Taller */}
              {pedidoDetalle.notaInterna && (
                <div className="rounded-2xl bg-surface-container-low p-4 space-y-1">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase flex items-center gap-1">
                    <Icon name="sticky_note_2" className="text-[15px] text-primary" />
                    Nota Interna para Floristas y Taller
                  </p>
                  <p className="text-[12px] text-on-surface font-medium">
                    {pedidoDetalle.notaInterna}
                  </p>
                </div>
              )}

              {/* 7. Desglose Financiero */}
              <div className="rounded-2xl border border-surface-variant/60 bg-surface-container-low p-4 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Total del Encargo:</span>
                  <span className="font-bold text-on-surface text-base">
                    {formatMxn(pedidoDetalle.total)} MXN
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Abonado / Pagado:</span>
                  <span className="font-bold text-tertiary">
                    {formatMxnExact(pedidoDetalle.pagadoHoy)} MXN
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-surface-variant/40">
                  <span className="text-on-surface-variant font-bold">Saldo Pendiente:</span>
                  <span
                    className={`font-headline text-lg font-bold ${
                      pedidoDetalle.saldoRestante > 0 ? 'text-primary' : 'text-emerald-700'
                    }`}
                  >
                    {formatMxn(pedidoDetalle.saldoRestante)} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* Footer de Acciones del Modal */}
            <div className="flex items-center justify-between border-t border-surface-variant/40 bg-surface-container-low px-6 py-3.5">
              <a
                href={waUrl(getMensajeWhatsApp(pedidoDetalle), pedidoDetalle.clienteTelefono)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-tertiary px-4 py-2.5 text-[12px] font-bold text-on-tertiary shadow-sm hover:opacity-95"
              >
                <Icon name="chat" className="text-[16px]" />
                Actualizar por WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setPedidoDetalle(null)}
                className="rounded-xl bg-surface-container px-4 py-2.5 text-[12px] font-bold text-on-surface hover:bg-surface-variant"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
