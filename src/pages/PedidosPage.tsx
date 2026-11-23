import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { ATELIER } from '../lib/atelier'
import { formatClabe, formatMxn } from '../lib/format'
import {
  buscarPedidoLocal,
  obtenerPedidosLocales,
  type PedidoGuardado,
} from '../lib/ordersStorage'
import { PEDIDOS_MOCK } from '../mocks/sales.mock'
import { waUrl } from '../lib/whatsapp'

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
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const [copiadoFolio, setCopiadoFolio] = useState(false)
  const [copiadoClabe, setCopiadoClabe] = useState(false)

  const pedidosLocales = obtenerPedidosLocales()

  // Si entra con query param ?folio=...
  useEffect(() => {
    if (queryFolio) {
      const local = buscarPedidoLocal(queryFolio)
      if (local) {
        setPedidoSeleccionado(local)
      } else {
        // Buscar en mocks del taller como respaldo
        const mockFound = PEDIDOS_MOCK.find(
          (p) => p.folio.toLowerCase() === queryFolio.toLowerCase()
        )
        if (mockFound) {
          setPedidoSeleccionado({
            id: mockFound.id,
            folio: mockFound.folio,
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
          })
        }
      }
    }
  }, [queryFolio])

  const handleBuscar = (e: FormEvent) => {
    e.preventDefault()
    setErrorBusqueda(null)

    const folioLimpio = folioInput.trim().toUpperCase()
    const telLimpio = telefonoInput.replace(/\D/g, '')

    // 1. Buscar en pedidos del dispositivo
    const encontradoLocal = buscarPedidoLocal(folioLimpio)
    if (encontradoLocal) {
      if (telLimpio && !encontradoLocal.clienteTelefono.includes(telLimpio)) {
        setErrorBusqueda('No encontramos un pedido con esos datos.')
        return
      }
      setPedidoSeleccionado(encontradoLocal)
      return
    }

    // 2. Buscar en pedidos del taller (mocks)
    const encontradoMock = PEDIDOS_MOCK.find(
      (p) => p.folio.toUpperCase() === folioLimpio || p.folio.toUpperCase() === `#${folioLimpio}`
    )
    if (encontradoMock) {
      setPedidoSeleccionado({
        id: encontradoMock.id,
        folio: encontradoMock.folio,
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
      })
      return
    }

    setErrorBusqueda('No encontramos un pedido con esos datos.')
  }

  const handleCopiarFolio = () => {
    if (!pedidoSeleccionado) return
    navigator.clipboard.writeText(pedidoSeleccionado.folio)
    setCopiadoFolio(true)
    setTimeout(() => setCopiadoFolio(false), 2000)
  }

  const handleCopiarClabe = () => {
    navigator.clipboard.writeText(ATELIER.clabe.replace(/\s/g, ''))
    setCopiadoClabe(true)
    setTimeout(() => setCopiadoClabe(false), 2000)
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
            Consulta el estado de tu ramo artesanal en tiempo real sin necesidad de iniciar sesión.
          </p>
        </div>

        {/* SI HAY UN PEDIDO SELECCIONADO, MOSTRAR SU DETALLE Y LÍNEA DE TIEMPO */}
        {pedidoSeleccionado ? (
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-6">
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
                  </div>
                  <p className="text-[12px] text-on-surface-variant mt-0.5">
                    Registrado el {pedidoSeleccionado.fecha} • Cliente: {pedidoSeleccionado.clienteNombre}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPedidoSeleccionado(null)}
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
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Entrega:</span>
                    <span className="font-semibold text-on-surface text-right">
                      {pedidoSeleccionado.direccion || 'Atelier Coyoacán'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Total:</span>
                    <span className="font-bold">{formatMxn(pedidoSeleccionado.total)} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Pagado al crear:</span>
                    <span className="font-bold text-tertiary">{formatMxn(pedidoSeleccionado.pagadoHoy)} MXN</span>
                  </div>
                  {pedidoSeleccionado.saldoRestante > 0 && (
                    <div className="flex justify-between text-primary font-bold pt-1 border-t border-surface-variant/40">
                      <span>Saldo pendiente al recibir:</span>
                      <span>{formatMxn(pedidoSeleccionado.saldoRestante)} MXN</span>
                    </div>
                  )}
                </div>

                {/* Si hay saldo pendiente: Caja de Liquidación */}
                {pedidoSeleccionado.saldoRestante > 0 ? (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase">Saldo Pendiente</span>
                      <p className="font-headline text-2xl font-bold text-primary mt-0.5">
                        {formatMxn(pedidoSeleccionado.saldoRestante)} MXN
                      </p>
                      <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                        Puedes liquidar al recibir tu ramo o por transferencia bancaria SPEI a BBVA:
                      </p>
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-surface-container-lowest px-2.5 py-1.5 text-[11px]">
                        <span className="font-mono font-bold">{formatClabe(ATELIER.clabe)}</span>
                        <button
                          type="button"
                          onClick={handleCopiarClabe}
                          className="font-bold text-primary hover:underline text-[10px]"
                        >
                          {copiadoClabe ? 'Copiado' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <a
                      href={waUrl(
                        `Hola Dulce Eternidad, tengo una duda o comprobante de saldo del pedido ${pedidoSeleccionado.folio}.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-tertiary px-4 py-2.5 text-[12px] font-bold text-on-tertiary shadow-sm hover:opacity-95"
                    >
                      <Icon name="chat" className="text-[16px]" />
                      Ya transferí, enviar comprobante por WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-tertiary-fixed/20 p-5 flex flex-col justify-center items-center text-center gap-2">
                    <Icon name="check_circle" className="text-[32px] text-tertiary" />
                    <p className="font-headline text-lg font-bold text-tertiary">100% Liquidado</p>
                    <p className="text-[12px] text-on-surface-variant">
                      Tu encargo está totalmente pagado. Te notificaremos cuando el chofer vaya en camino.
                    </p>
                  </div>
                )}
              </div>

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
                    placeholder="Ej. DE-261122-7K3Q"
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 font-mono text-[13px] font-bold text-primary ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Teléfono Celular (Opcional):
                  </label>
                  <input
                    type="tel"
                    value={telefonoInput}
                    onChange={(e) => setTelefonoInput(e.target.value)}
                    placeholder="El número con el que realizaste tu encargo"
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
                        onClick={() => setPedidoSeleccionado(ped)}
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
    </AppShell>
  )
}
