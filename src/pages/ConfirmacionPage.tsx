import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { ATELIER } from '../lib/atelier'
import { formatMxn, formatMxnExact } from '../lib/format'
import {
  actualizarPedidoLocal,
  buscarPedidoLocal,
  generarTextoTicket,
  type EstadoPago,
  type PedidoGuardado,
} from '../lib/ordersStorage'
import { TicketModal } from '../components/orders/TicketModal'
import { PaymentModal } from '../components/orders/PaymentModal'

export function ConfirmacionPage() {
  const { folio } = useParams<{ folio: string }>()
  const pedidoInicial = folio ? buscarPedidoLocal(folio) : undefined

  const [pedido, setPedido] = useState<PedidoGuardado | undefined>(pedidoInicial)
  const [copiadoFolio, setCopiadoFolio] = useState(false)
  const [mostrarModalPago, setMostrarModalPago] = useState(false)
  const [mostrarTicketModal, setMostrarTicketModal] = useState(false)

  // Sincronizar si cambia el folio
  useEffect(() => {
    if (folio) {
      const p = buscarPedidoLocal(folio)
      setPedido(p)
    }
  }, [folio])

  const handleCopiarFolio = () => {
    if (!folio) return
    navigator.clipboard.writeText(folio)
    setCopiadoFolio(true)
    setTimeout(() => setCopiadoFolio(false), 2000)
  }

  // Si no se encuentra el pedido en este dispositivo
  if (!pedido) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center bg-surface p-4 text-center">
        <div className="w-full max-w-md rounded-3xl bg-surface-container-lowest p-8 shadow-md ring-1 ring-surface-variant/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
            <Icon name="search_off" className="text-[30px]" />
          </div>
          <h2 className="font-headline text-xl font-bold text-on-surface mt-3">
            No encontramos los datos en este dispositivo
          </h2>
          <p className="text-[13px] text-on-surface-variant mt-1.5 leading-relaxed">
            Es posible que el pedido se haya generado desde otro navegador o se hayan borrado los datos locales.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              to="/pedidos"
              className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-[13px] font-bold text-on-primary shadow-sm"
            >
              Buscar con folio y teléfono
            </Link>
            <Link
              to="/"
              className="flex min-h-11 items-center justify-center rounded-xl bg-surface-container px-4 text-[13px] font-semibold text-on-surface hover:bg-surface-variant"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const estadoPago: EstadoPago = pedido.estadoPago || 'pendiente'
  const isPagado = estadoPago === 'pagado'

  // Enviar recibo/ticket al cliente por WhatsApp
  const handleEnviarReciboWhatsApp = () => {
    const textoTicket = generarTextoTicket(pedido)
    const telLimpio = pedido.clienteTelefono.replace(/\D/g, '')
    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(textoTicket)}`
    window.open(url, '_blank', 'noopener,noreferrer')

    const fechaEnvio = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    const actualizado = actualizarPedidoLocal(pedido.folio, {
      reciboEnviadoWhatsApp: fechaEnvio,
    })
    if (actualizado) setPedido(actualizado)
  }

  // Enviar recibo al cliente por Correo
  const handleEnviarReciboCorreo = () => {
    const textoTicket = generarTextoTicket(pedido)
    const destinatario = pedido.clienteCorreo || ''
    const asunto = `Comprobante Oficial Dulce Eternidad - Folio ${pedido.folio}`
    const mailto = `mailto:${destinatario}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(textoTicket)}`
    window.location.href = mailto

    const fechaEnvio = new Date().toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
    const actualizado = actualizarPedidoLocal(pedido.folio, {
      reciboEnviadoCorreo: fechaEnvio,
    })
    if (actualizado) setPedido(actualizado)
  }

  return (
    <div className="min-h-dvh flex flex-col bg-surface text-on-surface antialiased">
      {/* Cabecera limpia */}
      <header className="border-b border-surface-variant/40 bg-surface/90 pt-safe backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src={ATELIER.logoUrl} alt="Dulce Eternidad" className="h-7 w-auto object-contain" />
            <span className="font-headline text-lg font-bold text-primary">Dulce Eternidad</span>
          </Link>
          <span className="flex items-center gap-1 text-[11px] font-bold text-tertiary">
            <Icon name="verified" className="text-[16px]" filled />
            Atelier CDMX
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        {/* Éxito y Folio */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/40 text-tertiary shadow-sm">
            <Icon name="check_circle" className="text-[38px]" />
          </div>
          <span className="mt-3 text-[11px] font-bold text-tertiary uppercase tracking-wider">
            Confirmación Exitosa
          </span>
          <h1 className="font-headline text-3xl font-bold text-on-surface mt-0.5">
            ¡Pedido creado!
          </h1>
          <p className="text-[13px] text-on-surface-variant mt-1">
            Tu encargo artesanal ha sido registrado y entra al taller de confección.
          </p>

          {/* Folio Enorme */}
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface-container-low px-5 py-3 ring-1 ring-surface-variant/80">
            <span className="font-mono text-xl md:text-2xl font-bold tracking-wider text-primary">
              {pedido.folio}
            </span>
            <button
              type="button"
              onClick={handleCopiarFolio}
              className="flex items-center gap-1 rounded-lg bg-surface-container-lowest px-2.5 py-1.5 text-[11px] font-bold text-primary shadow-xs hover:bg-primary hover:text-on-primary transition-all active:scale-95"
            >
              <Icon name={copiadoFolio ? 'check' : 'content_copy'} className="text-[14px]" />
              {copiadoFolio ? '¡Copiado!' : 'Copiar'}
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-on-surface-variant">
            <span>{pedido.fecha}</span>
            <span>•</span>
            <span className="rounded-full bg-secondary-container/40 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
              En taller
            </span>
          </div>
        </div>

        {/* Tarjeta Resumen */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 space-y-3">
          <h2 className="font-headline text-base font-bold text-on-surface border-b border-surface-variant/40 pb-2">
            Resumen del Encargo
          </h2>
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Ramo:</span>
              <span className="font-bold text-on-surface">{pedido.productoNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Entrega:</span>
              <span className="font-semibold text-on-surface text-right">
                {pedido.entrega === 'envio' ? `Domicilio (${pedido.direccion})` : `Pick-up (${pedido.sucursalNombre})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Modalidad:</span>
              <span className="font-semibold text-on-surface">
                {pedido.modalidad === 'anticipo' ? 'Anticipo 50%' : 'Pago Completo 100%'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-variant/30 text-[13px]">
              <span className="font-bold text-on-surface">Total:</span>
              <span className="font-headline font-bold text-on-surface">{formatMxn(pedido.total)} MXN</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="font-bold text-primary">Monto a pagar hoy:</span>
              <span className="font-headline font-bold text-primary">{formatMxn(pedido.pagadoHoy)} MXN</span>
            </div>
            {pedido.saldoRestante > 0 && (
              <div className="flex justify-between text-[11px] text-on-surface-variant">
                <span>Saldo al recibir:</span>
                <span className="font-semibold">{formatMxn(pedido.saldoRestante)} MXN</span>
              </div>
            )}
          </div>
        </div>

        {/* CAJA DE PAGO LIMPIA Y SEGURA */}
        <div className="rounded-2xl border border-primary/20 bg-surface-container-low p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-variant/60 pb-3">
            <div>
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">
                Monto a Pagar
              </span>
              <p className="font-headline text-2xl font-bold text-primary">
                {formatMxnExact(pedido.pagadoHoy)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">
                Folio del Pedido
              </span>
              <p className="font-mono text-[13px] font-bold text-primary">
                {pedido.folio}
              </p>
            </div>
          </div>

          {/* Sello si ya está pagado */}
          {isPagado ? (
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-center animate-fade-in">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white mb-2 shadow-sm">
                <Icon name="check_circle" className="text-[28px]" />
              </div>
              <h4 className="font-headline text-base font-bold text-emerald-950">
                ¡Pago Acreditado Exitosamente!
              </h4>
              <p className="text-[12px] text-emerald-800/90 mt-1">
                Acreditado a las {pedido.fechaPago || 'recientemente'}. Tu ramo artesanal ha entrado a confección inmediata en el taller.
              </p>
            </div>
          ) : (
            /* Botón Principal para Iniciar Pago con Aviso Previo y Ventana Emergente */
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setMostrarModalPago(true)}
                className="flex min-h-12 w-full flex-col items-center justify-center rounded-2xl bg-primary px-4 py-3.5 text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
              >
                <span className="flex items-center gap-2 text-[15px] font-bold">
                  <Icon name="send_to_mobile" className="text-[20px]" />
                  Enviar Cobro a mi Celular con CoDi ({formatMxnExact(pedido.pagadoHoy)})
                </span>
                <span className="text-[11px] text-on-primary/80 font-normal mt-0.5">
                  Recibe la notificación en tu app bancaria y autoriza con tu huella
                </span>
              </button>
            </div>
          )}
        </div>

        {/* SECCIÓN DE ENTREGA DE RECIBO / COMPROBANTE AL CLIENTE */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Comprobante Oficial
              </span>
              <h3 className="font-headline text-base font-bold text-on-surface">
                Enviar Recibo al Cliente Solicitante
              </h3>
              <p className="text-[12px] text-on-surface-variant mt-0.5">
                Como empresa enviamos el ticket formal de compra con todos los detalles a quien realizó el encargo.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container/40 text-primary">
              <Icon name="receipt_long" className="text-[20px]" />
            </div>
          </div>

          {/* Tarjeta con los datos del comprador destinatario */}
          <div className="rounded-xl bg-surface-container-low p-3 text-[12px] space-y-1">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Cliente Comprador:</span>
              <span className="font-semibold text-on-surface">{pedido.clienteNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">WhatsApp Registrado:</span>
              <span className="font-mono font-semibold text-on-surface">+{pedido.clienteTelefono}</span>
            </div>
            {pedido.clienteCorreo && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Correo Electrónico:</span>
                <span className="font-semibold text-on-surface">{pedido.clienteCorreo}</span>
              </div>
            )}
          </div>

          {/* Validaciones de envío */}
          <div className="flex flex-col gap-1.5">
            {pedido.reciboEnviadoWhatsApp && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <Icon name="check_circle" className="text-[14px]" />
                Recibo enviado por WhatsApp a +{pedido.clienteTelefono} el {pedido.reciboEnviadoWhatsApp}
              </span>
            )}
            {pedido.reciboEnviadoCorreo && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <Icon name="check_circle" className="text-[14px]" />
                Recibo enviado por Correo a {pedido.clienteCorreo} el {pedido.reciboEnviadoCorreo}
              </span>
            )}
          </div>

          {/* Botones de Envío y Descarga del Recibo */}
          <div className="flex flex-col gap-2.5 pt-1">
            {/* 1. Enviar recibo al WhatsApp del cliente */}
            <button
              type="button"
              onClick={handleEnviarReciboWhatsApp}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
            >
              <Icon name="chat" className="text-[20px]" />
              Enviar mi recibo / ticket por WhatsApp
            </button>

            {/* 2. Enviar por correo si no tiene WhatsApp o como respaldo */}
            <button
              type="button"
              onClick={handleEnviarReciboCorreo}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-surface-container px-4 py-2.5 text-[13px] font-semibold text-on-surface hover:bg-surface-variant active:scale-[0.98] transition-all"
            >
              <Icon name="mail" className="text-[18px] text-primary" />
              Enviar comprobante por Correo Electrónico
            </button>

            {/* 3. Ver / Imprimir Ticket Digital */}
            <button
              type="button"
              onClick={() => setMostrarTicketModal(true)}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-surface-variant/80 px-4 py-2.5 text-[13px] font-bold text-primary hover:bg-surface-container-high transition-all"
            >
              <Icon name="receipt" className="text-[18px]" />
              Ver / Imprimir Ticket Digital de Compra
            </button>
          </div>
        </div>

        {/* Acciones de Navegación Finales */}
        <div className="flex flex-col gap-2">
          {/* Rastrear mi pedido */}
          <Link
            to={`/pedidos?folio=${pedido.folio}`}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-surface-container-high px-4 py-2.5 text-[12px] font-bold text-on-surface hover:bg-surface-variant transition-all"
          >
            <Icon name="local_shipping" className="text-[16px] text-tertiary" />
            Rastrear progreso de mi ramo en taller
          </Link>

          {/* Volver a la tienda */}
          <Link
            to="/"
            className="text-center text-[12px] font-semibold text-on-surface-variant hover:text-primary py-2"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>

      {/* MODAL DE PAGO: AVISO DE SEGURIDAD + VENTANA EMERGENTE PUSH CODI (SIN QR) */}
      {mostrarModalPago && (
        <PaymentModal
          pedido={pedido}
          onClose={() => setMostrarModalPago(false)}
          onSuccess={() => {
            const actualizado = actualizarPedidoLocal(pedido.folio, {
              estadoPago: 'pagado',
              fechaPago: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            })
            if (actualizado) setPedido(actualizado)
            setMostrarModalPago(false)
          }}
        />
      )}

      {/* MODAL DEL TICKET DIGITAL IMPRIMIBLE EN 1 SOLA HOJA */}
      {mostrarTicketModal && (
        <TicketModal pedido={pedido} onClose={() => setMostrarTicketModal(false)} />
      )}
    </div>
  )
}
