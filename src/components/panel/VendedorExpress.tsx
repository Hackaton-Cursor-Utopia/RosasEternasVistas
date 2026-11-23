import { useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from '../ui/Icon'
import { ATELIER, ENVIO_CDMX, LISTONES, PAPELES, RAMOS_EXPRESS } from '../../lib/atelier'
import { formatClabe, formatMxn, formatMxnExact } from '../../lib/format'
import { waUrl } from '../../lib/whatsapp'
import type { MetodoEntrega, ModalidadPago } from '../../types/models'

const LISTON_COLORS: Record<string, string> = {
  'Vino Tinto Real': '#7C2343',
  'Rosa Pastel': '#F4A7B9',
  'Rojo Carmín': '#BA1A1A',
  'Negro Satinado': '#1A1C1B',
}

export function VendedorExpress() {
  const [rosas, setRosas] = useState<6 | 12 | 24 | 50>(12)
  const [liston, setListon] = useState<string>('Vino Tinto Real')
  const [papel, setPapel] = useState<string>('Traslúcido con Borde Dorado')

  const [clienteNombre, setClienteNombre] = useState('Valeria Domínguez')
  const [clienteTelefono, setClienteTelefono] = useState('55 4912 8840')
  const [fechaEntrega, setFechaEntrega] = useState('Mañana, 4:30 PM')
  const [entrega, setEntrega] = useState<MetodoEntrega>('envio')
  const [modalidad, setModalidad] = useState<ModalidadPago>('anticipo')

  const [copiadoClabe, setCopiadoClabe] = useState(false)
  const [generado, setGenerado] = useState(false)

  const tarjetaRef = useRef<HTMLDivElement>(null)

  // Precios
  const ramoSeleccionado = RAMOS_EXPRESS.find((r) => r.rosas === rosas) ?? RAMOS_EXPRESS[1]
  const precioRamo = ramoSeleccionado.precioUnitario
  const costoEnvio = entrega === 'envio' ? ENVIO_CDMX.precio : 0
  const total = precioRamo + costoEnvio
  const montoAnticipo = Math.round(total / 2)
  const montoCompleto = total
  const montoATransferir = modalidad === 'anticipo' ? montoAnticipo : montoCompleto

  const referencia = `DE-2409`

  const handleCopiarClabe = () => {
    navigator.clipboard.writeText(ATELIER.clabe.replace(/\s/g, ''))
    setCopiadoClabe(true)
    setTimeout(() => setCopiadoClabe(false), 2200)
  }

  const handleGenerarTarjeta = () => {
    setGenerado(true)
    tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const mensajeCobro = `🌸 *DULCE ETERNIDAD - TARJETA DE COBRO DIGITAL*
Atelier Floral CDMX • Rosas Eternas

Hola *${clienteNombre || 'Cliente'}*, te compartimos el resumen y datos de pago de tu encargo:

💐 *Ramo:* ${rosas} Rosas Eternas de Listón Satinado
🎀 *Color:* ${liston}
📜 *Papel:* ${papel}
📅 *Entrega Programada:* ${fechaEntrega}
🚚 *Servicio:* ${entrega === 'envio' ? `Envío a domicilio CDMX (+$${ENVIO_CDMX.precio} MXN)` : 'Recoger en Atelier ($0 MXN)'}

━━━━━━━━━━━━━━━━━━━━━
💰 *Total del encargo:* ${formatMxn(total)} MXN
💳 *Monto a liquidar hoy:* ${formatMxnExact(montoATransferir)} (${modalidad === 'anticipo' ? 'Anticipo 50%' : 'Pago Total 100%'})
${modalidad === 'anticipo' ? `📦 *Saldo restante al recibir:* ${formatMxn(total - montoAnticipo)} MXN\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
🏦 *DATOS DE TRANSFERENCIA SPEI:*
• *Banco:* ${ATELIER.banco}
• *Beneficiario:* ${ATELIER.razonSocial}
• *CLABE:* ${formatClabe(ATELIER.clabe)}
• *Referencia:* ${referencia}

Por favor envíanos la captura de tu transferencia por este medio para iniciar la confección artesanal de tu ramo. ✨`

  const qrData = `SPEI|${ATELIER.banco}|${ATELIER.clabe}|${montoATransferir}|${referencia}|${ATELIER.razonSocial}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-8">
      {/* COLUMNA IZQUIERDA (lg:col-span-7): Confección Express + Datos del Cliente */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        {/* 1. SECCIÓN: CONFECCIÓN EXPRESS */}
        <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-sm ring-1 ring-surface-variant/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                <Icon name="auto_awesome" className="text-[17px]" />
              </span>
              <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
                Confección Express
              </h3>
            </div>
            <span className="rounded-full bg-secondary-container/40 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              Diseño al instante
            </span>
          </div>

          {/* 1. Cantidad de Rosas */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              1. Cantidad de Rosas Eternas
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {RAMOS_EXPRESS.map((item) => {
                const selected = rosas === item.rosas
                return (
                  <button
                    key={item.rosas}
                    type="button"
                    onClick={() => setRosas(item.rosas)}
                    className={`flex flex-col items-center justify-center rounded-xl py-3 px-1.5 transition-all ${
                      selected
                        ? 'bg-secondary-container/30 text-primary ring-2 ring-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="text-[15px] font-bold">{item.rosas}</span>
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      {formatMxn(item.precioUnitario)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. Color de Cinta Satinada */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              2. Color de Cinta Satinada
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {LISTONES.map((item) => {
                const selected = liston === item.id
                const hexColor = LISTON_COLORS[item.id] ?? '#7C2343'
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setListon(item.id)}
                    className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                      selected
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                    }`}
                  >
                    <span
                      className="h-4 w-4 shrink-0 rounded-full border border-white/40 shadow-sm"
                      style={{ backgroundColor: hexColor }}
                    />
                    <span className="truncate text-[12px] font-bold">{item.id}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 3. Envoltura Papel Coreano */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              3. Envoltura Papel Coreano
            </label>
            <div className="flex flex-col gap-2">
              {PAPELES.map((item) => {
                const selected = papel === item
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPapel(item)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                      selected
                        ? 'bg-secondary-container/20 text-on-surface ring-2 ring-primary'
                        : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        name="layers"
                        className={`text-[17px] ${selected ? 'text-primary' : 'text-on-surface-variant'}`}
                      />
                      <span className="truncate text-[12px] font-bold">{item}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-on-surface-variant">
                      Incluido
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* 2. SECCIÓN: DATOS DEL CLIENTE & LOGÍSTICA */}
        <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-sm ring-1 ring-surface-variant/60">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
              <Icon name="badge" className="text-[17px]" />
            </span>
            <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
              Datos del Cliente
            </h3>
          </div>

          <div className="flex flex-col gap-3.5">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant">
                Nombre o Apodo del Comprador:
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 ring-1 ring-surface-variant/70">
                <Icon name="person" className="text-[18px] text-primary" />
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre completo o cómo llamarle"
                  className="w-full bg-transparent text-[13px] text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">WhatsApp / Cel:</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 ring-1 ring-surface-variant/70">
                  <Icon name="chat" className="text-[17px] text-tertiary" />
                  <input
                    type="text"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    placeholder="55..."
                    className="w-full bg-transparent text-[13px] text-on-surface outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">Fecha & Hora Entrega:</label>
                <div className="mt-1 flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-2.5 ring-1 ring-surface-variant/70">
                  <Icon name="schedule" className="text-[17px] text-primary" />
                  <input
                    type="text"
                    value={fechaEntrega}
                    onChange={(e) => setFechaEntrega(e.target.value)}
                    placeholder="Mañana 4:30 PM"
                    className="w-full bg-transparent text-[13px] text-on-surface outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modalidad de Entrega */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Modalidad de Entrega
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setEntrega('envio')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    entrega === 'envio'
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold">
                    <Icon name="local_shipping" className="text-[16px]" />
                    Envío Domicilio CDMX
                  </div>
                  <span className={`text-[10px] mt-0.5 ${entrega === 'envio' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    + ${ENVIO_CDMX.precio} MXN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEntrega('recoger')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    entrega === 'recoger'
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold">
                    <Icon name="storefront" className="text-[16px]" />
                    Recoger en Atelier
                  </div>
                  <span className={`text-[10px] mt-0.5 ${entrega === 'recoger' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    Sin Costo Extra
                  </span>
                </button>
              </div>
            </div>

            {/* Esquema de Cobro */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Esquema de Cobro
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalidad('anticipo')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    modalidad === 'anticipo'
                      ? 'bg-secondary-container/40 text-primary ring-2 ring-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <Icon name="donut_large" className="text-[15px]" />
                    Anticipo 50%
                  </div>
                  <span className="text-[12px] font-headline font-bold text-primary mt-0.5">
                    {formatMxn(montoAnticipo)} MXN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalidad('completo')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    modalidad === 'completo'
                      ? 'bg-secondary-container/40 text-primary ring-2 ring-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <Icon name="check_circle" className="text-[15px]" />
                    Pago Total 100%
                  </div>
                  <span className="text-[12px] font-headline font-bold text-primary mt-0.5">
                    {formatMxn(montoCompleto)} MXN
                  </span>
                </button>
              </div>
            </div>

            {/* Botón: Generar Imagen de Cobro para WhatsApp */}
            <button
              type="button"
              onClick={handleGenerarTarjeta}
              className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-4 py-3 text-[14px] font-bold text-on-tertiary shadow-md transition-transform hover:opacity-95 active:scale-[0.98]"
            >
              <Icon name="receipt" className="text-[20px]" />
              Generar Imagen de Cobro para WhatsApp
            </button>
          </div>
        </section>
      </div>

      {/* COLUMNA DERECHA (lg:col-span-5 lg:sticky lg:top-24): Tarjeta de Cobro Digital en vivo */}
      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <section
          ref={tarjetaRef}
          className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-md ring-1 ring-surface-variant/70"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                <Icon name="qr_code_2" className="text-[18px]" />
              </span>
              <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
                Tarjeta de Cobro Digital
              </h3>
            </div>
            <span className="rounded-full bg-tertiary-fixed/30 px-2.5 py-0.5 text-[10px] font-bold text-tertiary">
              En tiempo real
            </span>
          </div>

          {/* Tarjeta Visual de Cobro */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container-low p-4 md:p-5 shadow-sm">
            {/* Header de la tarjeta */}
            <div className="flex items-center justify-between border-b border-surface-variant/60 pb-3">
              <div>
                <p className="font-headline text-lg font-bold text-primary">Dulce Eternidad</p>
                <p className="text-[10px] text-on-surface-variant">Atelier Floral CDMX • Rosas Eternas</p>
              </div>
              <div className="rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-black/5">
                <QRCodeSVG value={qrData} size={54} level="M" />
              </div>
            </div>

            {/* Desglose */}
            <div className="mt-3.5 space-y-2 text-[12px]">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-on-surface">
                  Ramo {rosas} Rosas Eternas de Listón
                </span>
                <span className="font-headline font-bold text-primary">
                  {formatMxn(precioRamo)} MXN
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 text-[11px] text-on-surface-variant">
                <div>
                  <span className="font-medium">Color listón:</span>{' '}
                  <span className="font-semibold text-on-surface">{liston}</span>
                </div>
                <div>
                  <span className="font-medium">Papel:</span>{' '}
                  <span className="font-semibold text-on-surface truncate">{papel}</span>
                </div>
                <div>
                  <span className="font-medium">Entrega:</span>{' '}
                  <span className="font-semibold text-on-surface">{fechaEntrega}</span>
                </div>
                <div>
                  <span className="font-medium">Servicio:</span>{' '}
                  <span className="font-semibold text-on-surface">
                    {entrega === 'envio' ? `Envío CDMX ($${ENVIO_CDMX.precio})` : 'Atelier ($0)'}
                  </span>
                </div>
              </div>

              {/* Monto a liquidar */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-lowest p-3.5 ring-1 ring-surface-variant/70">
                <div>
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Monto a liquidar hoy:
                  </span>
                  <span className="font-headline text-2xl font-bold text-primary">
                    {formatMxn(montoATransferir)} <span className="text-[11px] font-normal">MXN</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Total encargo:
                  </span>
                  <span className="text-[13px] font-bold text-on-surface">
                    {formatMxn(total)} MXN
                  </span>
                </div>
              </div>

              {/* Datos Bancarios y Copiar CLABE */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2 text-[11px]">
                <div>
                  <span className="block text-[8px] font-bold text-on-surface-variant uppercase">
                    SPEI / BBVA ATELIER
                  </span>
                  <span className="font-mono text-[11px] font-bold tracking-tight text-on-surface">
                    {formatClabe(ATELIER.clabe)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopiarClabe}
                  className="flex items-center gap-1 rounded-md bg-surface-container-lowest px-2.5 py-1 text-[10px] font-bold text-primary shadow-sm hover:bg-primary hover:text-on-primary active:scale-95 transition-all"
                >
                  <Icon name={copiadoClabe ? 'check' : 'content_copy'} className="text-[13px]" />
                  {copiadoClabe ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={waUrl(mensajeCobro, clienteTelefono || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-4 py-3 text-[14px] font-bold text-on-tertiary shadow-md transition-transform hover:opacity-95 active:scale-[0.98]"
          >
            <Icon name="chat" className="text-[19px]" />
            Copiar texto y enviar por WhatsApp
          </a>

          {generado && (
            <p className="text-center text-[11px] font-semibold text-tertiary">
              ✓ Tarjeta actualizada y lista para compartir con {clienteNombre || 'el cliente'}.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
