import { useState, useEffect, useRef } from 'react'
import { Icon } from '../ui/Icon'
import { formatMxnExact } from '../../lib/format'
import type { PedidoGuardado } from '../../lib/ordersStorage'
import { consultarEstadoPago, solicitarCobroPushCodi } from '../../api/payments'

type PaymentModalProps = {
  pedido: PedidoGuardado
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ pedido, onClose, onSuccess }: PaymentModalProps) {
  // Paso 1: Aviso de seguridad previo. Paso 2: Espera de autorización Push CoDi (Sin QR)
  const [paso, setPaso] = useState<'aviso' | 'push'>('aviso')
  const [enviandoPush, setEnviandoPush] = useState(false)
  const [toastMensaje, setToastMensaje] = useState<string | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Al pasar a paso 'push', disparamos la solicitud a la API y arrancamos el polling
  const handleAceptarAviso = async () => {
    setPaso('push')
    setEnviandoPush(true)

    try {
      await solicitarCobroPushCodi(pedido.folio, pedido.clienteTelefono, pedido.pagadoHoy)
      setToastMensaje(`Notificación CoDi enviada a +${pedido.clienteTelefono}`)
      setTimeout(() => setToastMensaje(null), 3500)
    } catch {
      // noop
    } finally {
      setEnviandoPush(false)
    }

    // Iniciar consulta periódica (polling) al backend de José para detectar cuando el cliente autorice
    if (pollingRef.current) clearInterval(pollingRef.current)
    pollingRef.current = setInterval(async () => {
      try {
        const respuesta = await consultarEstadoPago(pedido.folio)
        if (respuesta.estatus === 'APROBADO') {
          if (pollingRef.current) clearInterval(pollingRef.current)
          onSuccess()
        }
      } catch {
        // noop
      }
    }, 3000)
  }

  // Reenviar notificación push si el cliente no la vio
  const handleReenviarPush = async () => {
    setEnviandoPush(true)
    try {
      await solicitarCobroPushCodi(pedido.folio, pedido.clienteTelefono, pedido.pagadoHoy)
      setToastMensaje(`Notificación reenviada a +${pedido.clienteTelefono}`)
      setTimeout(() => setToastMensaje(null), 3000)
    } finally {
      setEnviandoPush(false)
    }
  }

  // Simulación de que el cliente autorizó en su app bancaria (para Demo de Hackathon)
  const handleSimularAutorizacionBanco = () => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setToastMensaje('¡Pago autorizado en la app del banco!')
    setTimeout(() => {
      onSuccess() // Quita la ventana emergente automáticamente y actualiza a pagado
    }, 800)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-inverse-surface/65 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex w-full max-w-sm sm:max-w-md flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl ring-1 ring-surface-variant/80 my-auto">
        {/* PASO 1: AVISO DE SEGURIDAD PREVIO */}
        {paso === 'aviso' && (
          <div className="p-6 md:p-8 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div className="flex items-center gap-2.5 text-primary">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Icon name="verified_user" className="text-[22px]" />
                </div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    Aviso de Cobro Digital
                  </h3>
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider">
                    CoDi Push • Banco de México
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar aviso"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-variant transition-colors"
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>

            <div className="space-y-3 text-[13px] text-on-surface-variant leading-relaxed">
              <div className="rounded-2xl bg-secondary-container/20 p-4 border border-primary/20">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">
                  Monto a Solicitar
                </span>
                <p className="font-headline text-2xl font-bold text-primary mt-0.5">
                  {formatMxnExact(pedido.pagadoHoy)} MXN
                </p>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Correspondiente al encargo <strong>{pedido.productoNombre}</strong> (Folio: <span className="font-mono font-bold">{pedido.folio}</span>).
                </p>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl bg-surface-container-low p-3.5 text-[12px]">
                <Icon name="notifications_active" className="text-[20px] text-primary shrink-0 mt-0.5" />
                <p>
                  Al pulsar <strong>Aceptar y Enviar a mi Celular</strong>, tu banco te enviará una notificación directa CoDi al número <strong>+{pedido.clienteTelefono}</strong>. Solo deberás abrirla en tu celular y confirmar con tu huella o FaceID.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleAceptarAviso}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
              >
                <Icon name="send_to_mobile" className="text-[18px]" />
                Aceptar y Enviar a mi Celular
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-surface-container px-4 py-2.5 text-[13px] font-semibold text-on-surface-variant hover:bg-surface-variant active:scale-95 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: VENTANA EMERGENTE PUSH CODI (SIN QR) */}
        {paso === 'push' && (
          <div className="p-6 flex flex-col gap-4">
            {/* Encabezado con X para cerrar en cualquier momento */}
            <div className="flex items-center justify-between border-b border-surface-variant/40 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  CoDi Push • Banco de México
                </span>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Solicitud Enviada a tu Celular
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ventana emergente"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors active:scale-95"
              >
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>

            {/* Toast o aviso si reenvió */}
            {toastMensaje && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5 animate-fade-in">
                <Icon name="check_circle" className="text-[14px] text-emerald-600 shrink-0" />
                <span>{toastMensaje}</span>
              </div>
            )}

            {/* Monto y Folio */}
            <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-2xl">
              <div>
                <span className="block text-[9px] font-bold uppercase text-on-surface-variant">Monto a Cobrar</span>
                <span className="font-headline text-xl font-bold text-primary">
                  {formatMxnExact(pedido.pagadoHoy)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-bold uppercase text-on-surface-variant">Folio</span>
                <span className="font-mono text-xs font-bold text-primary">{pedido.folio}</span>
              </div>
            </div>

            {/* Gráfico Animado de Notificación en Teléfono Móvil */}
            <div className="flex flex-col items-center justify-center py-3 bg-surface-container-lowest rounded-2xl border border-surface-variant/60 p-4">
              <div className="relative flex items-center justify-center mb-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Icon name="notifications_active" className="text-[34px] animate-bounce" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-tertiary" />
                </span>
              </div>

              {/* Vista previa de la notificación */}
              <div className="w-full rounded-xl bg-surface-container-low p-3 text-left border border-surface-variant/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1">
                    <Icon name="lock" className="text-[12px]" />
                    Notificación Bancaria CoDi
                  </span>
                  <span className="text-[9px] text-on-surface-variant">Ahora</span>
                </div>
                <p className="text-[12px] font-bold text-on-surface">
                  Dulce Eternidad Atelier CDMX
                </p>
                <p className="text-[11px] text-on-surface-variant leading-snug">
                  Solicitud de cobro por <strong>{formatMxnExact(pedido.pagadoHoy)} MXN</strong> enviada a tu número +{pedido.clienteTelefono}.
                </p>
              </div>

              {/* 2 Pasos Claros */}
              <div className="mt-3.5 space-y-2 text-left w-full text-[11px] text-on-surface-variant">
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                    1
                  </span>
                  <span>Revisa tu celular y entra a la notificación de tu app bancaria (BBVA, Banorte, Nu, Santander, etc.).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-on-primary">
                    2
                  </span>
                  <span>Presiona <strong>Autorizar</strong> en tu banco con tu huella digital o FaceID.</span>
                </div>
              </div>
            </div>

            {/* Estado de Detección en Tiempo Real */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-secondary-container/20 py-2.5 px-3 text-[12px] text-primary font-semibold">
              <span className="h-2.5 w-2.5 rounded-full bg-primary animate-ping" />
              <span>Esperando tu autorización en la app de tu banco...</span>
            </div>

            {/* Botón Reenviar Push si no le llegó */}
            <button
              type="button"
              onClick={handleReenviarPush}
              disabled={enviandoPush}
              className="flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-surface-container-high px-4 py-2.5 text-[12px] font-bold text-on-surface hover:bg-surface-variant active:scale-95 transition-all"
            >
              <Icon name="refresh" className={`text-[16px] ${enviandoPush ? 'animate-spin' : ''}`} />
              ¿No te llegó la notificación? Reenviar a mi celular
            </button>

            {/* Botón de prueba para demostración en Hackathon */}
            <div className="text-center pt-1 border-t border-surface-variant/40">
              <button
                type="button"
                onClick={handleSimularAutorizacionBanco}
                className="text-[11px] text-primary hover:underline font-semibold"
              >
                ⚡ Simular que el cliente autorizó en su app bancaria (Demo)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
