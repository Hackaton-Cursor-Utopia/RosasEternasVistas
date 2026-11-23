import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/ui/Icon'
import { useCheckout } from '../context/CheckoutContext'
import { ATELIER, ENVIO_CDMX, SUCURSALES } from '../lib/atelier'
import { formatMxn } from '../lib/format'
import { guardarPedidoLocal } from '../lib/ordersStorage'
import { PRODUCTOS_MOCK } from '../mocks/products.mock'
import type { MetodoEntrega, ModalidadPago, Producto } from '../types/models'

export function CheckoutPage() {
  const navigate = useNavigate()
  const {
    product: contextProduct,
    entrega: contextEntrega,
    modalidad: contextModalidad,
    sucursalId,
    setEntrega,
    setModalidad,
    setSucursalId,
  } = useCheckout()

  // Respaldo por si entra directo
  const product: Producto = contextProduct ?? PRODUCTOS_MOCK[0]
  const entrega: MetodoEntrega = contextEntrega ?? 'envio'
  const modalidad: ModalidadPago = contextModalidad ?? 'completo'

  // Campos de Datos del Comprador
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [aceptaWhatsApp, setAceptaWhatsApp] = useState(false)

  // Campos de Envío
  const [calleNumero, setCalleNumero] = useState('')
  const [interior, setInterior] = useState('')
  const [colonia, setColonia] = useState('Roma Norte')
  const [codigoPostal, setCodigoPostal] = useState('06700')
  const [referencias, setReferencias] = useState('')

  // Estados de validación y confirmación
  const [tocadoNombre, setTocadoNombre] = useState(false)
  const [tocadoTelefono, setTocadoTelefono] = useState(false)
  const [tocadoCalle, setTocadoCalle] = useState(false)
  const [creando, setCreando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  // Cálculos de costo
  const precioProducto = product.precioUnitario
  const costoEnvio = entrega === 'envio' ? ENVIO_CDMX.precio : 0
  const total = precioProducto + costoEnvio
  const montoAnticipo = Math.round(total / 2)
  const montoCompleto = total
  const pagasHoy = modalidad === 'anticipo' ? montoAnticipo : montoCompleto
  const saldoAlRecibir = total - pagasHoy

  const sucursalSeleccionada = SUCURSALES.find((s) => s.id === sucursalId) ?? SUCURSALES[0]

  // Validaciones
  const errorNombre = !nombre.trim() && tocadoNombre ? 'Por favor escribe tu nombre.' : null
  const errorTelefono =
    telefono.replace(/\D/g, '').length < 10 && tocadoTelefono
      ? 'Ingresa un número celular de 10 dígitos.'
      : null
  const errorCalle =
    entrega === 'envio' && !calleNumero.trim() && tocadoCalle
      ? 'Por favor escribe tu calle y número.'
      : null

  const paso1Completado = Boolean(nombre.trim() && telefono.replace(/\D/g, '').length >= 10)
  const paso2Completado = entrega === 'recoger' || Boolean(calleNumero.trim() && colonia.trim())
  const paso3Completado = true

  // Formateador de WhatsApp con +52
  const handleTelefonoChange = (valor: string) => {
    const digitos = valor.replace(/\D/g, '').slice(0, 10)
    setTelefono(digitos)
  }

  const handleConfirmarPedido = (e?: FormEvent) => {
    if (e) e.preventDefault()
    setTocadoNombre(true)
    setTocadoTelefono(true)
    setTocadoCalle(true)

    if (!nombre.trim() || telefono.replace(/\D/g, '').length < 10) {
      setErrorGeneral('Por favor completa tus datos de contacto.')
      return
    }

    if (entrega === 'envio' && !calleNumero.trim()) {
      setErrorGeneral('Por favor ingresa la dirección completa de entrega.')
      return
    }

    setCreando(true)
    setErrorGeneral(null)

    // Generar Folio tipo DE-261122-7K3Q
    const fechaCode = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    const randCode = Math.random().toString(36).substring(2, 6).toUpperCase()
    const folio = `DE-${fechaCode}-${randCode}`
    const ref = `HBE-${folio.replace(/DE-/, '')}`

    const direccionCompleta =
      entrega === 'envio'
        ? `${calleNumero} ${interior ? `Int ${interior}` : ''}, Col. ${colonia}, C.P. ${codigoPostal}. Ref: ${referencias || 'Ninguna'}`
        : sucursalSeleccionada.direccion

    // Guardar en pedidos locales del dispositivo
    guardarPedidoLocal({
      id: crypto.randomUUID(),
      folio,
      fecha: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      clienteNombre: nombre.trim(),
      clienteTelefono: `52${telefono}`,
      clienteCorreo: correo.trim() || undefined,
      productoNombre: product.nombre,
      productoPiezas: product.piezas,
      entrega,
      direccion: direccionCompleta,
      sucursalNombre: sucursalSeleccionada.nombre,
      modalidad,
      total,
      pagadoHoy: pagasHoy,
      saldoRestante: saldoAlRecibir,
      estado: 'taller',
      referencia: ref,
    })

    setTimeout(() => {
      navigate(`/confirmacion/${folio}`)
    }, 600)
  }

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-[15px] leading-6 text-on-surface antialiased pb-24 lg:pb-12">
      {/* Cabecera simplificada sin cuenta */}
      <header className="sticky top-0 z-40 w-full border-b border-surface-variant/40 bg-surface/90 pt-safe backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-variant/40 active:scale-95 transition-all"
            aria-label="Regresar"
          >
            <Icon name="arrow_back_ios_new" className="text-[18px] text-on-surface" />
          </button>

          <div className="flex items-center gap-2">
            <img src={ATELIER.logoUrl} alt="Dulce Eternidad" className="h-6 w-auto object-contain" />
            <h1 className="font-headline text-lg md:text-xl font-semibold tracking-tight text-primary">
              Finalizar pedido
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-tertiary text-[12px] font-bold">
            <Icon name="lock" className="text-[16px]" filled />
            <span>Pago seguro</span>
          </div>
        </div>
      </header>

      {/* Indicador de Tres Pasos (Informativo y Orientativo) */}
      <div className="border-b border-surface-variant/30 bg-surface-container-low px-4 md:px-8 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-6 md:gap-12 text-[11px] md:text-[12px] font-bold">
          <span className={`flex items-center gap-1.5 ${paso1Completado ? 'text-tertiary' : 'text-primary'}`}>
            <Icon name={paso1Completado ? 'check_circle' : 'radio_button_checked'} className="text-[15px]" filled={paso1Completado} />
            1 Datos
          </span>
          <span className="text-surface-variant">•</span>
          <span className={`flex items-center gap-1.5 ${paso2Completado ? 'text-tertiary' : 'text-on-surface-variant'}`}>
            <Icon name={paso2Completado ? 'check_circle' : 'radio_button_unchecked'} className="text-[15px]" filled={paso2Completado} />
            2 Entrega
          </span>
          <span className="text-surface-variant">•</span>
          <span className={`flex items-center gap-1.5 ${paso3Completado ? 'text-primary' : 'text-on-surface-variant'}`}>
            <Icon name="radio_button_checked" className="text-[15px]" />
            3 Pago
          </span>
        </div>
      </div>

      {/* Contenido Principal en 2 Columnas en lg: */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-8 pt-6">
        {errorGeneral && (
          <div className="mb-6 rounded-2xl bg-error-container p-4 text-[13px] font-semibold text-on-error-container shadow-xs">
            {errorGeneral}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA (lg:col-span-7): Resumen, Datos, Entrega y Pago */}
          <div className="flex flex-col gap-6 lg:col-span-7">
            {/* 1. Resumen del Ramo con opción de cambiar */}
            <section className="flex items-center justify-between rounded-2xl bg-surface-container-lowest p-4 shadow-sm ring-1 ring-surface-variant/60">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-on-surface-variant">Sin foto</div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-headline text-base font-semibold text-on-surface truncate">
                    {product.nombre}
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">{product.piezas} Rosas Eternas</p>
                  <p className="font-headline text-base font-bold text-primary mt-0.5">
                    {formatMxn(product.precioUnitario)} MXN
                  </p>
                </div>
              </div>

              <Link
                to="/"
                className="shrink-0 text-[12px] font-bold text-primary hover:underline px-2 py-1"
              >
                Cambiar ramo
              </Link>
            </section>

            {/* 2. Tus Datos */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-3.5">
              <h2 className="font-headline text-base font-bold text-on-surface">
                1. Tus Datos
              </h2>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">
                  Nombre Completo:
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onBlur={() => setTocadoNombre(true)}
                  placeholder="Tu nombre o cómo llamarte"
                  className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                />
                {errorNombre && <p className="mt-1 text-[11px] font-bold text-error">{errorNombre}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">
                  WhatsApp (con clave lada):
                </label>
                <div className="mt-1 flex items-center rounded-xl bg-surface-container-low px-3.5 py-2.5 ring-1 ring-surface-variant/70">
                  <span className="text-[12px] font-bold text-on-surface-variant mr-1.5">+52</span>
                  <input
                    type="tel"
                    required
                    value={telefono}
                    onChange={(e) => handleTelefonoChange(e.target.value)}
                    onBlur={() => setTocadoTelefono(true)}
                    placeholder="55 1234 5678"
                    className="w-full bg-transparent text-[13px] text-on-surface outline-none"
                  />
                </div>
                {errorTelefono && <p className="mt-1 text-[11px] font-bold text-error">{errorTelefono}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">
                  Correo Electrónico (Opcional):
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Para enviarte copia del folio si deseas"
                  className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                />
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={aceptaWhatsApp}
                  onChange={(e) => setAceptaWhatsApp(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-[11px] text-on-surface-variant leading-relaxed">
                  Acepto recibir mensajes de WhatsApp sobre mi pedido (únicamente notificaciones sobre el estado de confección y llegada del chofer).
                </span>
              </label>

              <p className="text-[11px] text-on-surface-variant/80 border-t border-surface-variant/40 pt-2">
                🔒 Tu nombre y teléfono van en tu folio para que el atelier te identifique sin necesidad de crear cuenta ni contraseña.
              </p>
            </section>

            {/* 3. Entrega */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-3.5">
              <h2 className="font-headline text-base font-bold text-on-surface">
                2. Método de Entrega en CDMX
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEntrega('envio')}
                  className={`rounded-2xl p-4 text-left transition-all ${
                    entrega === 'envio'
                      ? 'bg-secondary-container/20 ring-2 ring-primary shadow-xs'
                      : 'bg-surface-container-low ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <p className="text-[13px] font-bold text-on-surface">🛵 Envío a domicilio CDMX</p>
                  <p className="text-[11px] text-primary font-bold mt-0.5">Express 2 hrs (+ ${ENVIO_CDMX.precio} MXN)</p>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    Chofer privado en auto climatizado para preservar los pétalos.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEntrega('recoger')}
                  className={`rounded-2xl p-4 text-left transition-all ${
                    entrega === 'recoger'
                      ? 'bg-secondary-container/20 ring-2 ring-primary shadow-xs'
                      : 'bg-surface-container-low ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <p className="text-[13px] font-bold text-on-surface">📦 Recoger en sucursal</p>
                  <p className="text-[11px] text-tertiary font-bold mt-0.5">Sin costo extra ($0 MXN)</p>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    Listo en empaque de regalo en Coyoacán o Condesa.
                  </p>
                </button>
              </div>

              {/* Subformulario según entrega */}
              {entrega === 'envio' ? (
                <div className="mt-2 space-y-3 rounded-2xl bg-surface-container-low p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-on-surface-variant">Calle y Número Exterior:</label>
                      <input
                        type="text"
                        value={calleNumero}
                        onChange={(e) => setCalleNumero(e.target.value)}
                        onBlur={() => setTocadoCalle(true)}
                        placeholder="Ej. Av. Álvaro Obregón 150"
                        className="mt-1 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                      />
                      {errorCalle && <p className="mt-1 text-[10px] font-bold text-error">{errorCalle}</p>}
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant">Interior (Opcional):</label>
                      <input
                        type="text"
                        value={interior}
                        onChange={(e) => setInterior(e.target.value)}
                        placeholder="Depto 4B"
                        className="mt-1 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant">Colonia / Alcaldía:</label>
                      <input
                        type="text"
                        value={colonia}
                        onChange={(e) => setColonia(e.target.value)}
                        placeholder="Ej. Roma Norte, Cuauhtémoc"
                        className="mt-1 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant">Código Postal:</label>
                      <input
                        type="text"
                        value={codigoPostal}
                        onChange={(e) => setCodigoPostal(e.target.value)}
                        placeholder="06700"
                        className="mt-1 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant">Referencias para el chofer:</label>
                    <input
                      type="text"
                      value={referencias}
                      onChange={(e) => setReferencias(e.target.value)}
                      placeholder="Ej. Fachada blanca, entre calle Mérida y Frontera"
                      className="mt-1 w-full rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                    />
                  </div>

                  <p className="text-[10px] text-on-surface-variant">
                    ℹ️ Envío coordinado por mensajería express o Didi Entregas. La tarifa exacta de traslado se confirma al validar número exterior en WhatsApp.
                  </p>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SUCURSALES.map((suc) => (
                    <button
                      key={suc.id}
                      type="button"
                      onClick={() => setSucursalId(suc.id)}
                      className={`rounded-2xl p-3.5 text-left transition-all ${
                        sucursalId === suc.id
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <p className="text-[12px] font-bold">{suc.nombre}</p>
                      <p className={`text-[11px] mt-0.5 ${sucursalId === suc.id ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                        {suc.direccion}
                      </p>
                      <p className={`text-[10px] mt-1 font-semibold ${sucursalId === suc.id ? 'text-on-primary/70' : 'text-tertiary'}`}>
                        Horario: {suc.horario}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Pago / Anticipo */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-3.5">
              <h2 className="font-headline text-base font-bold text-on-surface">
                3. Modalidad de Pago
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setModalidad('completo')}
                  className={`rounded-2xl p-4 text-center transition-all ${
                    modalidad === 'completo'
                      ? 'bg-primary/5 ring-2 ring-primary shadow-xs'
                      : 'bg-surface-container-low ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-on-surface-variant">Pago Completo 100%</span>
                  <p className="font-headline text-xl font-bold text-primary mt-0.5">
                    {formatMxn(montoCompleto)} MXN
                  </p>
                  <span className="text-[10px] text-tertiary font-bold mt-1 block">Listo para despacho</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalidad('anticipo')}
                  className={`rounded-2xl p-4 text-center transition-all ${
                    modalidad === 'anticipo'
                      ? 'bg-primary/5 ring-2 ring-primary shadow-xs'
                      : 'bg-surface-container-low ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-[11px] font-semibold text-on-surface-variant">Anticipo 50%</span>
                  <p className="font-headline text-xl font-bold text-primary mt-0.5">
                    {formatMxn(montoAnticipo)} MXN
                  </p>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-1 block">El resto al recibir</span>
                </button>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA (lg:col-span-5 lg:sticky lg:top-24): Resumen Financiero y Confirmación */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-5">
            <section className="rounded-3xl bg-surface-container-lowest p-6 shadow-md ring-1 ring-surface-variant/70 flex flex-col gap-4">
              <h3 className="font-headline text-lg font-bold text-on-surface border-b border-surface-variant/40 pb-2">
                Resumen del Pedido
              </h3>

              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">{product.nombre}</span>
                  <span className="font-semibold">{formatMxn(precioProducto)} MXN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Envío:</span>
                  <span className="font-semibold">
                    {entrega === 'envio' ? `+ ${formatMxn(costoEnvio)} MXN` : 'Sin costo extra ($0)'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-surface-variant/30 font-bold text-[14px]">
                  <span>Total:</span>
                  <span className="font-headline text-base text-on-surface">{formatMxn(total)} MXN</span>
                </div>
                <div className="flex justify-between text-primary font-bold text-[15px] pt-1">
                  <span>Pagas hoy:</span>
                  <span className="font-headline text-xl text-primary">{formatMxn(pagasHoy)} MXN</span>
                </div>
                {saldoAlRecibir > 0 && (
                  <div className="flex justify-between text-[11px] text-on-surface-variant">
                    <span>Saldo al recibir:</span>
                    <span className="font-semibold">{formatMxn(saldoAlRecibir)} MXN</span>
                  </div>
                )}
              </div>

              {/* 3 Sellos de Confianza */}
              <div className="space-y-1.5 py-3 border-y border-surface-variant/40 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <Icon name="verified_user" className="text-[15px] text-tertiary" />
                  <span>Pago 100% protegido con transferencia SPEI directa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="all_inclusive" className="text-[15px] text-primary" />
                  <span>Garantía floral de más de 3 años de duración</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="local_shipping" className="text-[15px] text-tertiary" />
                  <span>Entrega cuidadosa en CDMX con empaque rígido</span>
                </div>
              </div>

              {/* Botón Confirmar Pedido en Escritorio */}
              <div className="hidden lg:flex flex-col gap-2">
                <button
                  type="button"
                  disabled={creando}
                  onClick={() => handleConfirmarPedido()}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all"
                >
                  <Icon name={creando ? 'sync' : 'check'} className={`text-[18px] ${creando ? 'animate-spin' : ''}`} />
                  {creando ? 'Creando tu pedido...' : 'Confirmar Pedido'}
                </button>
                <p className="text-center text-[10px] text-on-surface-variant">
                  Al confirmar se genera tu folio y podrás enviarlo por WhatsApp.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Barra Fija Inferior en Móvil con Total y Botón Confirmar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-surface-variant/40 bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase">Total hoy:</span>
            <span className="font-headline text-lg font-bold text-primary">{formatMxn(pagasHoy)} MXN</span>
          </div>
          <button
            type="button"
            disabled={creando}
            onClick={() => handleConfirmarPedido()}
            className="flex-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            <Icon name={creando ? 'sync' : 'check'} className={`text-[17px] ${creando ? 'animate-spin' : ''}`} />
            {creando ? 'Creando...' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
