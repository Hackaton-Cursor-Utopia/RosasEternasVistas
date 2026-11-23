import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { useCheckout } from '../context/CheckoutContext'
import { ENVIO_CDMX, LISTONES, PAPELES, RAMOS_EXPRESS } from '../lib/atelier'
import { formatMxn } from '../lib/format'
import { waUrl } from '../lib/whatsapp'
import type { MetodoEntrega, Producto } from '../types/models'

const COLOR_TINTS: Record<string, { hex: string; filter: string; blend: string; opacity: number }> = {
  'Vino Tinto Real': {
    hex: '#7C2343',
    filter: 'hue-rotate(330deg) saturate(1.8) brightness(0.75)',
    blend: 'multiply',
    opacity: 0.55,
  },
  'Rosa Pastel': {
    hex: '#F4A7B9',
    filter: 'hue-rotate(320deg) saturate(1.2) brightness(1.2)',
    blend: 'screen',
    opacity: 0.45,
  },
  'Rojo Carmín': {
    hex: '#BA1A1A',
    filter: 'hue-rotate(350deg) saturate(2.2) brightness(0.85)',
    blend: 'color',
    opacity: 0.65,
  },
  'Negro Satinado': {
    hex: '#1A1C1B',
    filter: 'grayscale(1) brightness(0.4)',
    blend: 'color-burn',
    opacity: 0.7,
  },
}

const EXTRAS = [
  { id: 'perlas', label: 'Corona de Perlas Artesanal', precio: 150, icon: 'flare' },
  { id: 'mariposas', label: 'Mariposas Doradas 3D', precio: 90, icon: 'auto_awesome' },
  { id: 'luz', label: 'Guía de Micro LED Cálida', precio: 120, icon: 'lightbulb' },
]

export function PersonalizarPage() {
  const navigate = useNavigate()
  const { startCheckout } = useCheckout()

  const [rosas, setRosas] = useState<6 | 12 | 24 | 50>(12)
  const [liston, setListon] = useState<string>('Vino Tinto Real')
  const [papel, setPapel] = useState<string>('Traslúcido con Borde Dorado')
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([])
  const [para, setPara] = useState('')
  const [de, setDe] = useState('')
  const [mensajeCaligrafia, setMensajeCaligrafia] = useState('')
  const [entrega, setEntrega] = useState<MetodoEntrega>('envio')

  // Cálculos de costo
  const ramoBase = RAMOS_EXPRESS.find((r) => r.rosas === rosas) ?? RAMOS_EXPRESS[1]
  const costoRamo = ramoBase.precioUnitario
  const costoExtras = extrasSeleccionados.reduce((total, id) => {
    const extra = EXTRAS.find((e) => e.id === id)
    return total + (extra ? extra.precio : 0)
  }, 0)
  const costoEnvio = entrega === 'envio' ? ENVIO_CDMX.precio : 0
  const total = costoRamo + costoExtras + costoEnvio

  const tint = COLOR_TINTS[liston] ?? COLOR_TINTS['Vino Tinto Real']

  const toggleExtra = (id: string) => {
    setExtrasSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Generar producto virtual personalizado para el Checkout
  const handleContinuarCheckout = () => {
    const productoPersonalizado: Producto = {
      id: `custom-${Date.now()}`,
      sku: `DE-CUSTOM-${rosas}`,
      nombre: `Ramo Personalizado ${rosas} Rosas (${liston})`,
      descripcion: `${papel} • Dedicatoria: "${mensajeCaligrafia || 'Sin mensaje'}"`,
      tipo: 'arreglo',
      categoria: 'Personalizados',
      ocasion: 'todas',
      coleccion: 'coreanos',
      color: liston,
      piezas: rosas,
      stock: 10,
      badge: 'Diseño Taller 3D',
      image_url:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBVYbOe-FfiYcIag0TEkc_uNkqoR7X8jqt0HeNNa_ss-7J2n0UksQnJd0TFKkokJgFpY66Fkafbf3AxikOhKbViA_7_lMEfPL4gRre6_AALy1UfQnutbzDUW3B0XZfWHZVoYAdQeCVGkHyZkw7J8Iqjj6RZanCKbOE1M3yinnp_hoEA3ZzNNGBHT0trWnFNWgxZaVukDX11C0vaGZkKvUCwvb7vip3Ilw-vWu8tjyU',
      estado: 'activo',
      precioUnitario: costoRamo + costoExtras,
      montoAnticipo: Math.round((costoRamo + costoExtras) / 2),
      tasaIva: 0.16,
      ivaIncluido: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    }

    startCheckout(productoPersonalizado, entrega)
    navigate('/checkout')
  }

  const mensajeWhatsApp = `🌸 *Cotización Ramo Personalizado - Atelier 3D CDMX*
Hola Dulce Eternidad, diseñé un ramo en la web con estas especificaciones:
• *Cantidad:* ${rosas} Rosas Eternas
• *Color de cinta:* ${liston}
• *Papel coreano:* ${papel}
• *Extras:* ${extrasSeleccionados.length > 0 ? extrasSeleccionados.join(', ') : 'Ninguno'}
• *Entrega:* ${entrega === 'envio' ? 'Envío a domicilio CDMX' : 'Recoger en taller'}
• *Para:* ${para || 'N/A'} (De: ${de || 'N/A'})
• *Dedicatoria:* "${mensajeCaligrafia || 'Sin dedicatoria'}"
• *Total estimado:* ${formatMxn(total)} MXN

¿Podrían confirmarme si pueden confeccionarlo para esta semana? ✨`

  return (
    <AppShell kicker="Taller 3D">
      <div className="flex flex-col gap-6 md:gap-8 pb-12">
        {/* Encabezado */}
        <div className="flex flex-col gap-1">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 text-[11px] font-bold text-primary">
            <Icon name="palette" className="text-[16px]" />
            Configurador Artesanal en Tiempo Real
          </div>
          <h2 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">
            Diseña tu Propio Ramo Eterno
          </h2>
          <p className="text-[12px] md:text-[13px] text-on-surface-variant max-w-2xl leading-relaxed">
            Personaliza el tamaño, color del satín con tintado visual en vivo, envoltura de alta gama y dedicatoria manuscrita con caligrafía.
          </p>
        </div>

        {/* Layout en 2 Columnas en lg: */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA (lg:col-span-5 lg:sticky lg:top-24): Visualizador Reactivo en Vivo */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-surface-container shadow-xl ring-1 ring-surface-variant/80">
              {/* Imagen Base del Ramo */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVYbOe-FfiYcIag0TEkc_uNkqoR7X8jqt0HeNNa_ss-7J2n0UksQnJd0TFKkokJgFpY66Fkafbf3AxikOhKbViA_7_lMEfPL4gRre6_AALy1UfQnutbzDUW3B0XZfWHZVoYAdQeCVGkHyZkw7J8Iqjj6RZanCKbOE1M3yinnp_hoEA3ZzNNGBHT0trWnFNWgxZaVukDX11C0vaGZkKvUCwvb7vip3Ilw-vWu8tjyU"
                alt="Ramo base"
                className="h-full w-full object-cover transition-all duration-700"
                style={{
                  transform:
                    rosas === 6
                      ? 'scale(0.88)'
                      : rosas === 12
                        ? 'scale(1)'
                        : rosas === 24
                          ? 'scale(1.08)'
                          : 'scale(1.18)',
                }}
              />

              {/* Capa de Tintado CSS Reactivo */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  backgroundColor: tint.hex,
                  mixBlendMode: tint.blend as never,
                  opacity: tint.opacity,
                }}
              />

              {/* Badge Dinámico de Selección */}
              <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
                <span className="rounded-full bg-surface-container-lowest/90 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md">
                  {rosas} Rosas • {liston}
                </span>
                <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                  {papel}
                </span>
              </div>

              {/* Extras activos sobre la foto */}
              {extrasSeleccionados.length > 0 && (
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5 pointer-events-none">
                  {extrasSeleccionados.map((id) => {
                    const extra = EXTRAS.find((e) => e.id === id)
                    return (
                      <span
                        key={id}
                        className="rounded-full bg-surface-container-lowest/95 px-2.5 py-0.5 text-[9px] font-bold text-tertiary shadow-sm backdrop-blur-md"
                      >
                        ✓ {extra?.label}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Vista Previa de Tarjeta de Caligrafía */}
            <div className="rounded-2xl border border-secondary-container/50 bg-gradient-to-b from-[#FFFDF9] to-[#F7F2EB] p-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-surface-variant/40 pb-2 mb-2">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                  <Icon name="history_edu" className="text-[14px]" />
                  Tarjeta Caligrafiada Manuscrita
                </span>
                <span className="text-[10px] text-on-surface-variant font-medium">Incluida</span>
              </div>
              <p className="font-headline text-xs font-semibold text-primary">
                {para ? `Para: ${para}` : 'Para: Tu persona especial'}
              </p>
              <p className="mt-1 font-headline italic text-[13px] text-on-surface leading-snug">
                "{mensajeCaligrafia || 'Escribe aquí tu dedicatoria de amor, aniversario o felicitación...'}"
              </p>
              {de && (
                <p className="mt-1 text-right font-headline text-[11px] text-on-surface-variant">
                  — Con amor, {de}
                </p>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA (lg:col-span-7): Formulario Interactivo */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Cantidad de Rosas */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                1. ¿Cuántas rosas deseas en tu ramo?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {RAMOS_EXPRESS.map((item) => {
                  const selected = rosas === item.rosas
                  return (
                    <button
                      key={item.rosas}
                      type="button"
                      onClick={() => setRosas(item.rosas)}
                      className={`flex flex-col items-center justify-center rounded-2xl py-3 px-2 transition-all ${
                        selected
                          ? 'bg-secondary-container/30 text-primary ring-2 ring-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[18px] font-headline font-bold">{item.rosas}</span>
                      <span className="text-[10px] text-on-surface-variant font-bold">Rosas</span>
                      <span className="mt-1 text-[11px] font-bold text-primary">
                        {formatMxn(item.precioUnitario)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 2. Color de Listón Satinado */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                2. Color de Cinta Satinada (Tintado en vivo)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {LISTONES.map((item) => {
                  const selected = liston === item.id
                  const tintData = COLOR_TINTS[item.id] ?? COLOR_TINTS['Vino Tinto Real']
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setListon(item.id)}
                      className={`flex items-center gap-3 rounded-2xl p-3 text-left transition-all ${
                        selected
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border-2 border-white/60 shadow-sm"
                        style={{ backgroundColor: tintData.hex }}
                      />
                      <span className="truncate text-[12px] font-bold">{item.id}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 3. Envoltura Papel Coreano */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                3. Envoltura & Pliegues de Papel Coreano
              </label>
              <div className="flex flex-col gap-2">
                {PAPELES.map((item) => {
                  const selected = papel === item
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPapel(item)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-all ${
                        selected
                          ? 'bg-secondary-container/20 text-on-surface ring-2 ring-primary'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          name="layers"
                          className={`text-[17px] ${selected ? 'text-primary' : 'text-on-surface-variant'}`}
                        />
                        <span className="text-[12px] font-bold">{item}</span>
                      </div>
                      <span className="text-[10px] font-bold text-on-surface-variant">Incluido</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 4. Aditamentos de Lujo (Opcionales) */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                4. Toques de Lujo Artesanales (Opcional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EXTRAS.map((extra) => {
                  const active = extrasSeleccionados.includes(extra.id)
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra.id)}
                      className={`flex flex-col items-start rounded-xl p-3 text-left transition-all ${
                        active
                          ? 'bg-tertiary-fixed/30 text-tertiary ring-2 ring-tertiary shadow-xs'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon name={extra.icon} className="text-[16px]" />
                        <span className="text-[11px] font-bold leading-tight">{extra.label}</span>
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-primary">
                        + {formatMxn(extra.precio)} MXN
                      </span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 5. Dedicatoria para Caligrafía */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                5. Dedicatoria Manuscrita
              </label>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant">Para:</label>
                    <input
                      type="text"
                      value={para}
                      onChange={(e) => setPara(e.target.value)}
                      placeholder="Ej. Valeria"
                      className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/60 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-on-surface-variant">De parte de:</label>
                    <input
                      type="text"
                      value={de}
                      onChange={(e) => setDe(e.target.value)}
                      placeholder="Ej. Carlos"
                      className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/60 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant">Mensaje manuscrito:</label>
                  <textarea
                    rows={3}
                    value={mensajeCaligrafia}
                    onChange={(e) => setMensajeCaligrafia(e.target.value)}
                    placeholder="Escribe el mensaje que nuestra calígrafa plasmará en la tarjeta de regalo..."
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/60 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </section>

            {/* 6. Método de Entrega */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                6. Método de Entrega en CDMX
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEntrega('envio')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    entrega === 'envio'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-[12px] font-bold">🛵 Envío a Domicilio</span>
                  <span className={`text-[10px] mt-0.5 ${entrega === 'envio' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    + ${ENVIO_CDMX.precio} MXN (CDMX)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setEntrega('recoger')}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    entrega === 'recoger'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                  }`}
                >
                  <span className="text-[12px] font-bold">📦 Recoger en Atelier</span>
                  <span className={`text-[10px] mt-0.5 ${entrega === 'recoger' ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                    Sin Costo Extra
                  </span>
                </button>
              </div>
            </section>

            {/* Barra de Cotización en Vivo y Botones de Acción */}
            <div className="rounded-2xl bg-surface-container-low p-5 flex flex-col gap-3 ring-1 ring-surface-variant/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Cotización Total
                  </span>
                  <p className="font-headline text-2xl font-bold text-primary">
                    {formatMxn(total)} <span className="text-[12px] font-normal text-on-surface-variant">MXN</span>
                  </p>
                </div>
                <span className="rounded-full bg-tertiary-fixed/40 px-3 py-1 text-[11px] font-bold text-tertiary">
                  Anticipo sugerido: {formatMxn(Math.round(total / 2))} MXN
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-surface-variant/40">
                <button
                  type="button"
                  onClick={handleContinuarCheckout}
                  className="flex-1 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
                >
                  <Icon name="arrow_forward" className="text-[18px]" />
                  Continuar al Checkout
                </button>

                <a
                  href={waUrl(mensajeWhatsApp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-surface-container-lowest px-4 py-3 text-[13px] font-bold text-tertiary ring-1 ring-surface-variant hover:bg-surface-container active:scale-[0.98] transition-all"
                >
                  <Icon name="chat" className="text-[17px]" />
                  Cotizar vía WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
