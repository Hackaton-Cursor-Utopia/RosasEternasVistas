import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from '../components/ui/Icon'
import { ATELIER } from '../lib/atelier'
import { formatClabe, formatMxn, formatMxnExact } from '../lib/format'
import { buscarPedidoLocal, type PedidoGuardado } from '../lib/ordersStorage'
import { waUrl } from '../lib/whatsapp'

export function ConfirmacionPage() {
  const { folio } = useParams<{ folio: string }>()
  const pedido: PedidoGuardado | undefined = folio ? buscarPedidoLocal(folio) : undefined

  const [copiadoFolio, setCopiadoFolio] = useState(false)
  const [copiadoClabe, setCopiadoClabe] = useState(false)

  const handleCopiarFolio = () => {
    if (!folio) return
    navigator.clipboard.writeText(folio)
    setCopiadoFolio(true)
    setTimeout(() => setCopiadoFolio(false), 2000)
  }

  const handleCopiarClabe = () => {
    navigator.clipboard.writeText(ATELIER.clabe.replace(/\s/g, ''))
    setCopiadoClabe(true)
    setTimeout(() => setCopiadoClabe(false), 2000)
  }

  // Si no se encuentra el pedido en este dispositivo (recarga sin caché o URL compartida)
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

  const qrData = `SPEI|${ATELIER.banco}|${ATELIER.clabe}|${pedido.pagadoHoy}|${pedido.referencia}|${ATELIER.razonSocial}`

  // 1. Mensaje para enviar al atelier
  const mensajeAtelier = `🌸 *¡Hola Dulce Eternidad! Creé mi pedido en la web:*
• *Folio:* ${pedido.folio}
• *Cliente:* ${pedido.clienteNombre} (${pedido.clienteTelefono})
• *Ramo:* ${pedido.productoNombre}
• *Entrega:* ${pedido.entrega === 'envio' ? `A domicilio (${pedido.direccion})` : `Recoger en ${pedido.sucursalNombre}`}
• *Monto a liquidar hoy:* ${formatMxnExact(pedido.pagadoHoy)} (${pedido.modalidad === 'anticipo' ? 'Anticipo 50%' : 'Pago 100%'})
• *Referencia:* ${pedido.referencia}

Adjunto mi comprobante de transferencia bancaria SPEI para iniciar la confección. ✨`

  // 2. Mensaje para guardar en su propio WhatsApp
  const mensajeAutoguardado = `📦 *Mi Folio Dulce Eternidad Atelier CDMX:*
Folio: ${pedido.folio}
Ramo: ${pedido.productoNombre}
Total: ${formatMxn(pedido.total)} MXN
${pedido.saldoRestante > 0 ? `Saldo restante al recibir: ${formatMxn(pedido.saldoRestante)} MXN` : 'Liquidado 100%'}
Rastrea tu ramo aquí: ${window.location.origin}/pedidos?folio=${pedido.folio}`

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

        {/* Caja de Pago con QR CoDi/SPEI */}
        <div className="rounded-2xl border border-primary/20 bg-surface-container-low p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-surface-variant/60 pb-3">
            <div>
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">
                Monto a Transferir
              </span>
              <p className="font-headline text-2xl font-bold text-primary">
                {formatMxnExact(pedido.pagadoHoy)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold tracking-wider text-on-surface-variant uppercase">
                Referencia SPEI
              </span>
              <p className="font-mono text-[13px] font-bold text-on-surface">
                {pedido.referencia}
              </p>
            </div>
          </div>

          {/* QR */}
          <div className="my-4 flex flex-col items-center justify-center">
            <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5">
              <QRCodeSVG value={qrData} size={150} level="M" />
            </div>
            <span className="mt-2 text-[10px] font-bold tracking-wider text-on-surface-variant uppercase">
              [C] CoDi / SPEI
            </span>
          </div>

          {/* Datos Bancarios */}
          <div className="space-y-1.5 rounded-xl bg-surface-container-lowest p-3 text-[12px]">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Banco:</span>
              <span className="font-semibold text-on-surface">{ATELIER.banco}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Beneficiario:</span>
              <span className="font-semibold text-on-surface">{ATELIER.razonSocial}</span>
            </div>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-container-low px-3 py-1.5">
              <div>
                <span className="block text-[8px] font-bold text-on-surface-variant uppercase">
                  CLABE Interbancaria
                </span>
                <span className="font-mono text-[12px] font-bold text-on-surface">
                  {formatClabe(ATELIER.clabe)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopiarClabe}
                className="flex items-center gap-1 rounded-md bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold text-primary shadow-xs hover:bg-primary hover:text-on-primary transition-all active:scale-95"
              >
                <Icon name={copiadoClabe ? 'check' : 'content_copy'} className="text-[13px]" />
                {copiadoClabe ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* 3 Pasos */}
          <div className="mt-4 space-y-2 text-[11px] text-on-surface-variant">
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                1
              </span>
              <span>Transfiere el monto desde la app de tu banco con la referencia indicada.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                2
              </span>
              <span>Envía tu comprobante o captura por WhatsApp con el botón principal.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                3
              </span>
              <span>¡Tu ramo entra de inmediato a la mesa de confección y caligrafía!</span>
            </div>
          </div>
        </div>

        {/* 4 Botones en Orden Estricto de Jerarquía */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* 1. Enviar mi pedido por WhatsApp (Vino, grande) */}
          <a
            href={waUrl(mensajeAtelier)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Icon name="chat" className="text-[20px]" />
            Enviar mi pedido por WhatsApp
          </a>

          {/* 2. Guardar mi folio en WhatsApp (Crema / secundario) */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensajeAutoguardado)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container px-4 py-3 text-[13px] font-bold text-on-surface hover:bg-surface-variant active:scale-[0.98] transition-all"
          >
            <Icon name="share" className="text-[18px] text-primary" />
            Guardar mi folio en WhatsApp
          </a>

          {/* 3. Rastrear mi pedido */}
          <Link
            to={`/pedidos?folio=${pedido.folio}`}
            className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-surface-variant/80 px-4 py-2 text-[12px] font-bold text-on-surface hover:bg-surface-container transition-all"
          >
            <Icon name="local_shipping" className="text-[16px] text-tertiary" />
            Rastrear mi pedido
          </Link>

          {/* 4. Volver a la tienda */}
          <Link
            to="/"
            className="text-center text-[12px] font-semibold text-on-surface-variant hover:text-primary py-1"
          >
            Volver a la tienda
          </Link>
        </div>

        {/* Recordatorio pequeño */}
        <p className="text-center text-[11px] text-on-surface-variant/80">
          También puedes encontrar este pedido en la sección <strong>Mi pedido</strong> en este dispositivo.
        </p>
      </main>
    </div>
  )
}
