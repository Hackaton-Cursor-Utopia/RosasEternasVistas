import { createPortal } from 'react-dom'
import { Icon } from '../ui/Icon'
import { ATELIER } from '../../lib/atelier'
import { formatMxn, formatMxnExact } from '../../lib/format'
import type { PedidoGuardado } from '../../lib/ordersStorage'

type TicketModalProps = {
  pedido: PedidoGuardado
  onClose: () => void
}

function TicketContent({ pedido }: { pedido: PedidoGuardado }) {
  const isPagado = pedido.estadoPago === 'pagado'

  return (
    <div className="flex flex-col gap-3.5 bg-white text-neutral-900 font-sans p-6 rounded-3xl border border-neutral-200/80 shadow-xs max-w-sm mx-auto w-full">
      {/* Logo y Encabezado de la Florería */}
      <div className="flex flex-col items-center text-center border-b border-dashed border-neutral-300 pb-3.5">
        <img src={ATELIER.logoUrl} alt="Dulce Eternidad" className="h-12 w-auto object-contain mb-1.5" />
        <h2 className="font-headline text-2xl font-bold tracking-tight text-primary">
          Dulce Eternidad
        </h2>
        <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest mt-0.5">
          Atelier Floral • CDMX
        </p>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          {ATELIER.razonSocial}
        </p>
      </div>

      {/* Folio y Estatus */}
      <div className="flex items-center justify-between bg-neutral-50 rounded-2xl p-3 border border-neutral-200/80 text-[12px]">
        <div>
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Folio</span>
          <span className="font-mono text-base font-bold text-primary">{pedido.folio}</span>
        </div>
        <div className="text-right">
          <span className="block text-[9px] font-bold text-neutral-500 uppercase tracking-wider">Estatus Pago</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
              isPagado
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <Icon name={isPagado ? 'check_circle' : 'pending'} className="text-[12px]" />
            {isPagado ? 'Acreditado' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Datos del Cliente y Fecha */}
      <div className="space-y-1.5 border-b border-dashed border-neutral-200 pb-3 text-[12px]">
        <div className="flex justify-between">
          <span className="text-neutral-500">Fecha de registro:</span>
          <span className="font-semibold text-neutral-800">{pedido.fecha}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Cliente solicitante:</span>
          <span className="font-semibold text-neutral-900">{pedido.clienteNombre}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">WhatsApp / Teléfono:</span>
          <span className="font-mono font-semibold text-neutral-800">+{pedido.clienteTelefono}</span>
        </div>
        {pedido.clienteCorreo && (
          <div className="flex justify-between">
            <span className="text-neutral-500">Correo registrado:</span>
            <span className="font-semibold text-neutral-800">{pedido.clienteCorreo}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-neutral-500">Modalidad de entrega:</span>
          <span className="font-semibold text-neutral-800 text-right max-w-[210px] truncate">
            {pedido.entrega === 'envio'
              ? `Domicilio CDMX (${pedido.direccion || 'Registrada'})`
              : `Pick-up (${pedido.sucursalNombre || 'Roma Norte'})`}
          </span>
        </div>
      </div>

      {/* Desglose de Artículos */}
      <div className="space-y-1.5 border-b border-dashed border-neutral-200 pb-3">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          Detalle del Encargo
        </span>
        <div className="flex justify-between text-[13px] items-start">
          <div className="max-w-[220px]">
            <p className="font-bold text-neutral-900 leading-snug">{pedido.productoNombre}</p>
            <p className="text-[11px] text-neutral-500">
              {pedido.productoPiezas} Rosas Satinadas Artesanales
            </p>
          </div>
          <span className="font-bold text-neutral-900">{formatMxn(pedido.total)}</span>
        </div>
      </div>

      {/* Desglose de Pago */}
      <div className="space-y-1.5 text-[12px]">
        <div className="flex justify-between">
          <span className="text-neutral-600">Total del encargo:</span>
          <span className="font-bold text-neutral-900">{formatMxn(pedido.total)} MXN</span>
        </div>
        <div className="flex justify-between text-[13px] bg-neutral-100 p-2.5 rounded-xl border border-neutral-200/60">
          <span className="font-bold text-primary">
            {pedido.modalidad === 'anticipo' ? 'Anticipo 50% (Hoy):' : 'Pago Total (Hoy):'}
          </span>
          <span className="font-bold text-primary">{formatMxnExact(pedido.pagadoHoy)} MXN</span>
        </div>
        {pedido.saldoRestante > 0 ? (
          <div className="flex justify-between text-[11px] text-neutral-600 pt-0.5">
            <span>Saldo al recibir en CDMX:</span>
            <span className="font-bold text-neutral-800">{formatMxn(pedido.saldoRestante)} MXN</span>
          </div>
        ) : (
          <div className="flex justify-between text-[11px] text-emerald-700 pt-0.5">
            <span>Saldo pendiente:</span>
            <span className="font-bold">$0.00 MXN (100% Liquidado)</span>
          </div>
        )}
      </div>

      {/* Pie de Ticket / Sello */}
      <div className="mt-1 flex flex-col items-center justify-center text-center border-t border-dashed border-neutral-300 pt-3">
        <span className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
          ★ HECHO A MANO EN CDMX ★
        </span>
        <p className="text-[10px] text-neutral-400 mt-0.5">
          Conserva este ticket para cualquier consulta o aclaración.
        </p>
      </div>
    </div>
  )
}

export function TicketModal({ pedido, onClose }: TicketModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Modal visible en pantalla centrado */}
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="relative flex w-full max-w-sm sm:max-w-md flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl ring-1 ring-surface-variant/80 my-auto">
          {/* Encabezado barra modal */}
          <div className="flex items-center justify-between border-b border-surface-variant/40 px-5 py-3.5 bg-surface-container-low">
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="receipt_long" className="text-[16px]" />
              Ticket / Recibo Digital
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar ticket"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-variant transition-colors"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>

          {/* Vista previa centrada */}
          <div className="p-4 sm:p-6 bg-surface-container-low/40 flex justify-center">
            <TicketContent pedido={pedido} />
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 p-4 bg-surface-container border-t border-surface-variant/40">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-on-primary shadow-sm hover:opacity-95 active:scale-95 transition-all"
            >
              <Icon name="print" className="text-[18px]" />
              Imprimir / Guardar PDF (1 Hoja)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center rounded-xl bg-surface-container-highest px-4 py-2.5 text-[13px] font-semibold text-on-surface hover:bg-surface-variant active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Portal directo en document.body para impresión limpia (1 sola hoja, visible y centrado) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div id="print-ticket-root">
            <TicketContent pedido={pedido} />
          </div>,
          document.body
        )}
    </>
  )
}
