import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { formatMxn } from '../lib/format'
import {
  actualizarPedidoLocal,
  buscarPedidoLocal,
  obtenerPedidosLocales,
  type PedidoGuardado,
} from '../lib/ordersStorage'
import { PEDIDOS_MOCK } from '../mocks/sales.mock'
import { waUrl } from '../lib/whatsapp'
import { PaymentModal } from '../components/orders/PaymentModal'

const PASOS_SEGUIMIENTO = [
  { id: 'taller', label: 'En taller', desc: 'Confección y caligrafía' },
  { id: 'listo', label: 'Listo', desc: 'Empaque protector listo' },
  { id: 'envio', label: 'En ruta', desc: 'Con chofer en auto climatizado' },
  { id: 'entregado', label: 'Entregado', desc: 'Recibido con éxito' },
]

export function PedidosPage() {
  const [searchParams] = useSearchParams()
  const queryFolio = searchParams.get('folio')

  const [folioInput, setFolioInput] = useState(queryFolio || '')
  const [telefonoInput, setTelefonoInput] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoGuardado | null>(null)
  const [telefonoVerificado, setTelefonoVerificado] = useState(false)
  const [telefonoVerificacionInput, setTelefonoVerificacionInput] = useState('')
  const [errorVerificacionTelefono, setErrorVerificacionTelefono] = useState<string | null>(null)

  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [copiadoFolio, setCopiadoFolio] = useState(false)
  const [mostrarModalLiquidacion, setMostrarModalLiquidacion] = useState(false)

  // Pedidos del dispositivo activos (nunca borradores ni inactivos)
  const pedidosLocales = obtenerPedidosLocales().filter((p) => p.activo !== false)

  // Helper para normalizar dígitos de teléfono
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '')

  // Si entra con query param ?folio=...
  useEffect(() => {
    if (queryFolio) {
      const local = buscarPedidoLocal(queryFolio)
      if (local && local.activo !== false) {
        setPedidoSeleccionado(local)
        setTelefonoVerificado(false)
      } else {
        // Buscar en mocks del taller como respaldo
        const mockFound = PEDIDOS_MOCK.find(
          (p) => p.folio.toLowerCase() === queryFolio.toLowerCase()
        )
        if (mockFound) {
          setPedidoSeleccionado({
            id: mockFound.id,
            folio: mockFound.folio.replace('#', ''),
            fecha: 'Hoy',
            clienteNombre: mockFound.clienteNombre,
            clienteTelefono: mockFound.clienteTelefono,
            productoNombre: mockFound.descripcion,
            productoPiezas: 12,
            entrega: 'envio',
            direccion: mockFound.entregaEtiqueta,
            modalidad: mockFound.saldoPendiente > 0 ? 'anticipo' : 'completo',
            total: mockFound.total,
            pagadoHoy: mockFound.montoCobrado,
            saldoRestante: mockFound.saldoPendiente,
            estado: mockFound.estados.includes('envio') ? 'envio' : 'taller',
            referencia: `HBE-${mockFound.folio.replace(/\D/g, '')}`,
            activo: true,
          })
          setTelefonoVerificado(false)
        }
      }
    }
  }, [queryFolio])

  const handleBuscar = (e: FormEvent) => {
    e.preventDefault()
    setErrorBusqueda(null)
    setErrorVerificacionTelefono(null)

    const folioLimpio = folioInput.trim().toUpperCase()
    const telLimpio = cleanPhone(telefonoInput)

    // 1. Buscar en pedidos del dispositivo
    const encontradoLocal = buscarPedidoLocal(folioLimpio)
    if (encontradoLocal && encontradoLocal.activo !== false) {
      setPedidoSeleccionado(encontradoLocal)
      // Si el usuario ya proveyó el teléfono exacto en el formulario inicial y coincide:
      if (telLimpio && cleanPhone(encontradoLocal.clienteTelefono).endsWith(telLimpio.slice(-7))) {
        setTelefonoVerificado(true)
      } else {
        setTelefonoVerificado(false)
        setTelefonoVerificacionInput(telefonoInput)
      }
      return
    }

    // 2. Buscar en pedidos del taller (mocks)
    const encontradoMock = PEDIDOS_MOCK.find(
      (p) => p.folio.toUpperCase() === folioLimpio || p.folio.toUpperCase() === `#${folioLimpio}`
    )
    if (encontradoMock) {
      const pedidoMockGuardado: PedidoGuardado = {
        id: encontradoMock.id,
        folio: encontradoMock.folio.replace('#', ''),
        fecha: 'Hoy',
        clienteNombre: encontradoMock.clienteNombre,
        clienteTelefono: encontradoMock.clienteTelefono,
        productoNombre: encontradoMock.descripcion,
        productoPiezas: 12,
        entrega: 'envio',
        direccion: encontradoMock.entregaEtiqueta,
        modalidad: encontradoMock.saldoPendiente > 0 ? 'anticipo' : 'completo',
        total: encontradoMock.total,
        pagadoHoy: encontradoMock.montoCobrado,
        saldoRestante: encontradoMock.saldoPendiente,
        estado: encontradoMock.estados.includes('envio') ? 'envio' : 'taller',
        referencia: `HBE-${encontradoMock.folio.replace(/\D/g, '')}`,
        activo: true,
      }

      setPedidoSeleccionado(pedidoMockGuardado)
      if (telLimpio && cleanPhone(encontradoMock.clienteTelefono).endsWith(telLimpio.slice(-7))) {
        setTelefonoVerificado(true)
      } else {
        setTelefonoVerificado(false)
        setTelefonoVerificacionInput(telefonoInput)
      }
      return
    }

    setErrorBusqueda('No encontramos un encargo con ese folio de pedido.')
  }

  // Validación de seguridad y privacidad por teléfono
  const handleVerificarTelefono = (e: FormEvent) => {
    e.preventDefault()
    setErrorVerificacionTelefono(null)

    if (!pedidoSeleccionado) return

    const inputDigits = cleanPhone(telefonoVerificacionInput)
    const pedidoDigits = cleanPhone(pedidoSeleccionado.clienteTelefono)

    if (inputDigits.length < 4) {
      setErrorVerificacionTelefono('Ingresa tu número celular registrado (al menos los últimos 7 o 10 dígitos).')
      return
    }

    // Comprobar coincidencia de dígitos (los últimos 7 dígitos o exacto)
    if (
      pedidoDigits.endsWith(inputDigits.slice(-7)) ||
      inputDigits.endsWith(pedidoDigits.slice(-7)) ||
      pedidoDigits.includes(inputDigits)
    ) {
      setTelefonoVerificado(true)
    } else {
      setErrorVerificacionTelefono(
        'El número telefónico no coincide con el registrado en este encargo. Por privacidad de remitente y destinatario, la información se mantiene resguardada.'
      )
    }
  }

  const handleCopiarFolio = () => {
    if (!pedidoSeleccionado) return
    navigator.clipboard.writeText(pedidoSeleccionado.folio)
    setCopiadoFolio(true)
    setTimeout(() => setCopiadoFolio(false), 2000)
  }

  const getPasoIndice = (estado: string) => {
    if (estado === 'entregado') return 3
    if (estado === 'envio') return 2
    if (estado === 'listo') return 1
    return 0 // taller
  }

  return (
    <AppShell kicker="Mi pedido">
      <div className="flex flex-col gap-6 md:gap-8 pb-12">
        {/* Encabezado */}
        <div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary">
            Rastreo y Seguimiento
          </h2>
          <p className="mt-1 text-[13px] text-on-surface-variant">
            Consulta el estado de tu ramo artesanal en tiempo real y gestiona tu liquidación.
          </p>
        </div>

        {/* SI HAY UN PEDIDO SELECCIONADO */}
        {pedidoSeleccionado ? (
          <div className="flex flex-col gap-6">
            {/* COMPUERTA DE PRIVACIDAD SI AÚN NO SE HA VERIFICADO EL TELÉFONO */}
            {!telefonoVerificado ? (
              <div className="rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-md ring-1 ring-primary/20 max-w-xl mx-auto w-full animate-fade-in">
                <div className="flex flex-col items-center text-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/40 text-primary">
                    <Icon name="lock" className="text-[28px]" />
                  </span>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">
                      Verificación de Privacidad
                    </h3>
                    <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">
                      Para proteger los datos de entrega y el mensaje íntimo de la dedicatoria del
                      pedido <span className="font-mono font-bold text-primary">{pedidoSeleccionado.folio}</span>,
                      confirma el número celular registrado al momento de la compra.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleVerificarTelefono} className="mt-6 flex flex-col gap-4">
                  {errorVerificacionTelefono && (
                    <div className="rounded-xl bg-error-container p-3 text-[12px] font-semibold text-on-error-container">
                      {errorVerificacionTelefono}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                      Número Celular (10 dígitos):
                    </label>
                    <div className="flex items-center gap-2 rounded-xl bg-surface-container-low px-3.5 py-3 ring-1 ring-surface-variant/70 focus-within:ring-2 focus-within:ring-primary">
                      <Icon name="phone" className="text-[18px] text-primary" />
                      <input
                        type="tel"
                        required
                        autoFocus
                        placeholder="Ej. 55 4912 8840"
                        value={telefonoVerificacionInput}
                        onChange={(e) => setTelefonoVerificacionInput(e.target.value)}
                        className="w-full bg-transparent text-[14px] font-bold text-on-surface outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
                  >
                    <Icon name="verified_user" className="text-[18px]" />
                    Confirmar y Ver Mi Pedido
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPedidoSeleccionado(null)
                      setTelefonoVerificado(false)
                      setErrorVerificacionTelefono(null)
                    }}
                    className="text-center text-[12px] font-semibold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    ← Consultar otro folio
                  </button>
                </form>
              </div>
            ) : (
              /* DETALLE COMPLETO Y LÍNEA DE TIEMPO UNA VEZ CONFIRMADO EL TELÉFONO */
              <div className="rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-6 animate-fade-in">
                {/* Encabezado del Detalle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-variant/40 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xl md:text-2xl font-bold text-primary">
                        {pedidoSeleccionado.folio}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopiarFolio}
                        className="rounded-lg bg-surface-container-low px-2 py-1 text-[11px] font-bold text-primary hover:bg-surface-container"
                      >
                        {copiadoFolio ? '¡Copiado!' : 'Copiar'}
                      </button>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        <Icon name="check_circle" className="text-[12px]" />
                        Identidad Verificada
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant mt-0.5">
                      Registrado el {pedidoSeleccionado.fecha} • Cliente: {pedidoSeleccionado.clienteNombre}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPedidoSeleccionado(null)
                      setTelefonoVerificado(false)
                    }}
                    className="inline-flex w-fit items-center gap-1 text-[12px] font-bold text-primary hover:underline"
                  >
                    <Icon name="search" className="text-[15px]" />
                    Consultar otro folio
                  </button>
                </div>

                {/* Línea de Tiempo Visual */}
                <div>
                  <h3 className="font-headline text-base font-bold text-on-surface mb-4">
                    Estado de Confección & Entrega
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PASOS_SEGUIMIENTO.map((paso, idx) => {
                      const actualIdx = getPasoIndice(pedidoSeleccionado.estado)
                      const completado = idx <= actualIdx
                      const actual = idx === actualIdx

                      return (
                        <div
                          key={paso.id}
                          className={`rounded-2xl p-4 text-center transition-all ${
                            actual
                              ? 'bg-secondary-container/20 ring-2 ring-primary shadow-xs'
                              : completado
                                ? 'bg-tertiary-fixed/20 text-tertiary'
                                : 'bg-surface-container-low text-on-surface-variant/60 opacity-70'
                          }`}
                        >
                          <div
                            className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full text-[14px] font-bold ${
                              actual
                                ? 'bg-primary text-on-primary'
                                : completado
                                  ? 'bg-tertiary text-on-tertiary'
                                  : 'bg-surface-variant text-on-surface-variant'
                            }`}
                          >
                            {completado ? <Icon name="check" className="text-[18px]" /> : idx + 1}
                          </div>
                          <p className="text-[12px] font-bold text-on-surface">{paso.label}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{paso.desc}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Resumen del Ramo y Saldo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-2 text-[12px] rounded-2xl bg-surface-container-low p-4">
                    <h4 className="font-bold text-on-surface text-[13px] border-b border-surface-variant/40 pb-1.5">
                      Detalles del Encargo
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Ramo:</span>
                      <span className="font-bold text-on-surface">{pedidoSeleccionado.productoNombre}</span>
                    </div>
                    {pedidoSeleccionado.colorRosas && (
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Tono de Rosas:</span>
                        <span className="font-semibold text-on-surface">{pedidoSeleccionado.colorRosas}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Modalidad de Entrega:</span>
                      <span className="font-semibold text-on-surface text-right">
                        {pedidoSeleccionado.direccion || 'Atelier Roma Norte'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Total del Encargo:</span>
                      <span className="font-bold">{formatMxn(pedidoSeleccionado.total)} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Abonado:</span>
                      <span className="font-bold text-tertiary">{formatMxn(pedidoSeleccionado.pagadoHoy)} MXN</span>
                    </div>
                    {pedidoSeleccionado.saldoRestante > 0 && (
                      <div className="flex justify-between text-primary font-bold pt-1 border-t border-surface-variant/40">
                        <span>Saldo pendiente al recibir:</span>
                        <span>{formatMxn(pedidoSeleccionado.saldoRestante)} MXN</span>
                      </div>
                    )}
                  </div>

                  {/* Si hay saldo pendiente: Caja de Liquidación / Acelerar Pedido */}
                  {pedidoSeleccionado.saldoRestante > 0 ? (
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            Saldo Pendiente
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                            <Icon name="bolt" className="text-[12px]" />
                            Acelerar pedido
                          </span>
                        </div>
                        <p className="font-headline text-2xl font-bold text-primary mt-1">
                          {formatMxn(pedidoSeleccionado.saldoRestante)} MXN
                        </p>
                        <p className="text-[12px] text-on-surface-variant mt-1.5 leading-relaxed">
                          Acelera la entrega de tu ramo liquidando el saldo pendiente ahora con notificación directa CoDi a tu celular.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => setMostrarModalLiquidacion(true)}
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[13px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
                        >
                          <Icon name="send_to_mobile" className="text-[18px]" />
                          Enviar Liquidación a mi Celular ({formatMxn(pedidoSeleccionado.saldoRestante)})
                        </button>

                        <a
                          href={waUrl(
                            `Hola Dulce Eternidad, tengo una consulta sobre la liquidación del pedido ${pedidoSeleccionado.folio}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-center text-[11px] font-semibold text-on-surface-variant hover:text-primary transition-colors py-1"
                        >
                          ¿Dudas con tu saldo? Escríbenos por WhatsApp
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-tertiary-fixed/20 p-5 flex flex-col justify-center items-center text-center gap-2">
                      <Icon name="check_circle" className="text-[32px] text-tertiary" />
                      <p className="font-headline text-lg font-bold text-tertiary">100% Liquidado</p>
                      <p className="text-[12px] text-on-surface-variant font-medium">
                        Tu encargo está totalmente pagado.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dedicatoria Caligrafiada si existe (Privada) */}
                {(pedidoSeleccionado.dedicatoriaMensaje || pedidoSeleccionado.dedicatoriaPara) && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/70 p-4 space-y-2">
                    <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="history_edu" className="text-[16px]" />
                      Tarjeta Caligrafiada Manuscrita Incluida
                    </p>
                    <div className="flex items-center gap-4 text-[12px] text-amber-950">
                      {pedidoSeleccionado.dedicatoriaPara && (
                        <span>
                          Para: <strong>{pedidoSeleccionado.dedicatoriaPara}</strong>
                        </span>
                      )}
                      {pedidoSeleccionado.dedicatoriaDe && (
                        <span>
                          De: <strong>{pedidoSeleccionado.dedicatoriaDe}</strong>
                        </span>
                      )}
                    </div>
                    {pedidoSeleccionado.dedicatoriaMensaje && (
                      <p className="font-serif italic text-amber-950 text-[13px] bg-white/80 p-3 rounded-xl border border-amber-200/50 mt-1">
                        "{pedidoSeleccionado.dedicatoriaMensaje}"
                      </p>
                    )}
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex flex-wrap gap-2.5 pt-3 border-t border-surface-variant/40">
                  <a
                    href={waUrl(
                      `Hola Dulce Eternidad, quiero consultar el estado de mi pedido ${pedidoSeleccionado.folio}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-bold text-on-primary shadow-xs hover:opacity-95"
                  >
                    <Icon name="chat" className="text-[15px]" />
                    Escribir al atelier
                  </a>
                  <button
                    type="button"
                    onClick={handleCopiarFolio}
                    className="flex items-center gap-1.5 rounded-xl bg-surface-container px-4 py-2.5 text-[12px] font-bold text-on-surface hover:bg-surface-variant"
                  >
                    <Icon name="content_copy" className="text-[15px]" />
                    Copiar folio
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* FORMULARIO DE BÚSQUEDA Y PEDIDOS EN ESTE DISPOSITIVO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Formulario de Búsqueda */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <form
                onSubmit={handleBuscar}
                className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                    <Icon name="search" className="text-[18px]" />
                  </span>
                  <h3 className="font-headline text-lg font-bold text-on-surface">
                    Buscar un Pedido
                  </h3>
                </div>

                {errorBusqueda && (
                  <div className="rounded-xl bg-error-container p-3 text-[12px] font-semibold text-on-error-container">
                    {errorBusqueda}
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Folio de Pedido:
                  </label>
                  <input
                    type="text"
                    required
                    value={folioInput}
                    onChange={(e) => setFolioInput(e.target.value)}
                    placeholder="Ej. DE-261122-7K3Q o DE-EX-1234"
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 font-mono text-[13px] font-bold text-primary ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Teléfono Celular Registrado:
                  </label>
                  <input
                    type="tel"
                    value={telefonoInput}
                    onChange={(e) => setTelefonoInput(e.target.value)}
                    placeholder="Confirma tu número de 10 dígitos"
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  <Icon name="search" className="text-[18px]" />
                  Buscar Pedido
                </button>

                <p className="text-center text-[11px] text-on-surface-variant pt-2 border-t border-surface-variant/40">
                  ¿No encuentras tu folio?{' '}
                  <a
                    href={waUrl('Hola Dulce Eternidad, no encuentro mi folio de pedido. ¿Me pueden ayudar a rastrearlo?')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary hover:underline"
                  >
                    Escríbenos por WhatsApp
                  </a>
                </p>
              </form>
            </div>

            {/* Columna Derecha: Tus Pedidos en este Dispositivo */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Tus Pedidos en este Dispositivo
                </h3>
                <span className="text-[11px] font-bold text-on-surface-variant">
                  {pedidosLocales.length} guardados
                </span>
              </div>

              {pedidosLocales.length === 0 ? (
                <div className="rounded-3xl bg-surface-container-lowest p-6 text-center ring-1 ring-surface-variant/60 shadow-xs">
                  <p className="text-[13px] text-on-surface-variant">
                    No tienes pedidos registrados en este navegador aún. Cuando realices un encargo, aparecerá aquí automáticamente.
                  </p>
                  <Link
                    to="/"
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-primary px-5 text-[12px] font-bold text-on-primary shadow-xs"
                  >
                    Ver Catálogo Floral
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {pedidosLocales.map((ped) => (
                    <div
                      key={ped.folio}
                      className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-variant/60 flex items-center justify-between gap-3 hover:ring-primary transition-all"
                    >
                      <div className="min-w-0">
                        <span className="font-mono text-[13px] font-bold text-primary">
                          {ped.folio}
                        </span>
                        <p className="text-[12px] font-semibold text-on-surface truncate mt-0.5">
                          {ped.productoNombre}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {ped.fecha} • Total: {formatMxn(ped.total)} MXN
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPedidoSeleccionado(ped)
                          setTelefonoVerificado(false)
                          setTelefonoVerificacionInput('')
                          setErrorVerificacionTelefono(null)
                        }}
                        className="shrink-0 flex items-center gap-1 rounded-xl bg-surface-container-low px-3 py-2 text-[11px] font-bold text-primary hover:bg-primary hover:text-on-primary transition-all"
                      >
                        <span>Ver</span>
                        <Icon name="arrow_forward" className="text-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Liquidación con Notificación Push CoDi */}
      {mostrarModalLiquidacion && pedidoSeleccionado && (
        <PaymentModal
          pedido={{
            ...pedidoSeleccionado,
            pagadoHoy: pedidoSeleccionado.saldoRestante,
          }}
          onClose={() => setMostrarModalLiquidacion(false)}
          onSuccess={() => {
            const actualizado = actualizarPedidoLocal(pedidoSeleccionado.folio, {
              saldoRestante: 0,
              pagadoHoy: pedidoSeleccionado.total,
              estadoPago: 'pagado',
              fechaPago: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
            })
            if (actualizado) {
              setPedidoSeleccionado(actualizado)
            } else {
              setPedidoSeleccionado((prev) =>
                prev ? { ...prev, saldoRestante: 0, pagadoHoy: prev.total, estadoPago: 'pagado' } : null
              )
            }
            setMostrarModalLiquidacion(false)
          }}
        />
      )}
    </AppShell>
  )
}
