import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { BouquetCanvas } from '../components/canvas/BouquetCanvas'
import { useCheckout } from '../context/CheckoutContext'
import {
  COLORES_MONO,
  ENVIO_CDMX,
  EXTRAS_LUJO,
  LISTONES,
  PAPELES,
  PRECIO_PLIEGO_COMBINADO,
  RAMOS_EXPRESS,
} from '../lib/atelier'
import { formatMxn } from '../lib/format'
import { waUrl } from '../lib/whatsapp'
import type { MetodoEntrega, Producto } from '../types/models'

export function PersonalizarPage() {
  const navigate = useNavigate()
  const { startCheckout } = useCheckout()

  // 1. Cantidad de rosas
  const [rosas, setRosas] = useState<6 | 12 | 24 | 50>(12)

  // 2. Color de rosas (máximo 2 colores combinados)
  const [rosaColor1Id, setRosaColor1Id] = useState<string>('Vino Tinto Real')
  const [combinarRosas, setCombinarRosas] = useState<boolean>(false)
  const [rosaColor2Id, setRosaColor2Id] = useState<string>('Rosa Pastel')

  // 3. Envoltura de papel coreano (máximo 2 colores combinados)
  const [papelColor1Id, setPapelColor1Id] = useState<string>('marfil')
  const [esPliegoCombinado, setEsPliegoCombinado] = useState<boolean>(false)
  const [papelColor2Id, setPapelColor2Id] = useState<string>('dorado')

  // 4. Color del moño / listón (independiente)
  const [monoColorId, setMonoColorId] = useState<string>('Vino Tinto Real')

  // 5. Extras de lujo
  const [extrasSeleccionados, setExtrasSeleccionados] = useState<string[]>([])

  // 6. Dedicatoria
  const [para, setPara] = useState('')
  const [de, setDe] = useState('')
  const [mensajeCaligrafia, setMensajeCaligrafia] = useState('')

  // 7. Entrega
  const [entrega, setEntrega] = useState<MetodoEntrega>('envio')

  // Búsqueda de objetos seleccionados
  const colorRosa1 = LISTONES.find((l) => l.id === rosaColor1Id) ?? LISTONES[0]
  const colorRosa2 = LISTONES.find((l) => l.id === rosaColor2Id) ?? LISTONES[3]
  const papel1 = PAPELES.find((p) => p.id === papelColor1Id) ?? PAPELES[0]
  const papel2 = PAPELES.find((p) => p.id === papelColor2Id) ?? PAPELES[4]
  const colorMono = COLORES_MONO.find((m) => m.id === monoColorId) ?? COLORES_MONO[0]

  // Formateo de descripciones de color
  const textoColorRosas =
    combinarRosas && rosaColor1Id !== rosaColor2Id
      ? `${colorRosa1.nombre} + ${colorRosa2.nombre} (Bicolor)`
      : colorRosa1.nombre

  const textoColorPapel =
    esPliegoCombinado && papelColor1Id !== papelColor2Id
      ? `${papel1.nombre} + ${papel2.nombre} (Bicolor)`
      : papel1.nombre

  // Cálculos de costos
  const ramoBase = RAMOS_EXPRESS.find((r) => r.rosas === rosas) ?? RAMOS_EXPRESS[1]
  const costoRamo = ramoBase.precioUnitario
  const costoPliegoCombinado = esPliegoCombinado ? PRECIO_PLIEGO_COMBINADO : 0
  const costoExtras = extrasSeleccionados.reduce((acc, id) => {
    const extra = EXTRAS_LUJO.find((e) => e.id === id)
    return acc + (extra ? extra.precio : 0)
  }, 0)
  const costoEnvio = entrega === 'envio' ? ENVIO_CDMX.precio : 0
  const total = costoRamo + costoPliegoCombinado + costoExtras + costoEnvio

  const toggleExtra = (id: string) => {
    setExtrasSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // Generar producto virtual personalizado para el Checkout
  const handleContinuarCheckout = () => {
    const extrasTexto =
      extrasSeleccionados.length > 0
        ? extrasSeleccionados
            .map((id) => EXTRAS_LUJO.find((e) => e.id === id)?.label)
            .filter(Boolean)
            .join(', ')
        : 'Sin extras'

    const productoPersonalizado: Producto = {
      id: `custom-${Date.now()}`,
      sku: `DE-CUSTOM-${rosas}`,
      nombre: `Ramo Personalizado ${rosas} Rosas (${textoColorRosas})`,
      descripcion: `Papel: ${textoColorPapel} • Moño: ${colorMono.nombre} • Extras: ${extrasTexto} • Dedicatoria: "${mensajeCaligrafia || 'Sin mensaje'}"`,
      tipo: 'arreglo',
      categoria: 'Personalizados',
      ocasion: 'todas',
      coleccion: 'coreanos',
      color: textoColorRosas,
      piezas: rosas,
      stock: 10,
      badge: 'Diseño Taller 3D',
      image_url:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBVYbOe-FfiYcIag0TEkc_uNkqoR7X8jqt0HeNNa_ss-7J2n0UksQnJd0TFKkokJgFpY66Fkafbf3AxikOhKbViA_7_lMEfPL4gRre6_AALy1UfQnutbzDUW3B0XZfWHZVoYAdQeCVGkHyZkw7J8Iqjj6RZanCKbOE1M3yinnp_hoEA3ZzNNGBHT0trWnFNWgxZaVukDX11C0vaGZkKvUCwvb7vip3Ilw-vWu8tjyU',
      estado: 'activo',
      precioUnitario: costoRamo + costoPliegoCombinado + costoExtras,
      montoAnticipo: Math.round((costoRamo + costoPliegoCombinado + costoExtras) / 2),
      tasaIva: 0.16,
      ivaIncluido: true,
      creadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    }

    startCheckout(productoPersonalizado, entrega)
    navigate('/checkout')
  }

  const mensajeWhatsApp = `🌸 *Cotización Ramo Personalizado - Atelier 3D CDMX*
Hola Dulce Eternidad, diseñé un ramo en su Taller 3D con estas especificaciones:
• *Cantidad:* ${rosas} Rosas Eternas
• *Color de rosas:* ${textoColorRosas}
• *Color de papel:* ${textoColorPapel}
• *Color del moño:* ${colorMono.nombre}
• *Extras de lujo:* ${
    extrasSeleccionados.length > 0
      ? extrasSeleccionados
          .map((id) => EXTRAS_LUJO.find((e) => e.id === id)?.label)
          .join(', ')
      : 'Ninguno'
  }
• *Entrega:* ${entrega === 'envio' ? 'Envío a domicilio CDMX' : 'Recoger en taller'}
• *Para:* ${para || 'N/A'} (De: ${de || 'N/A'})
• *Dedicatoria manuscrita:* "${mensajeCaligrafia || 'Sin dedicatoria'}"
• *Total estimado:* ${formatMxn(total)} MXN

¿Podrían confirmarme si pueden confeccionarlo? ✨`

  return (
    <AppShell kicker="Taller 3D" showFab={false}>
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
            Personaliza el tamaño, combinación de rosas, envoltura coreana y moño satinado con vista previa fotorrealista.
          </p>
        </div>

        {/* Layout en 2 Columnas en lg: */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUMNA IZQUIERDA (lg:col-span-5 lg:sticky lg:top-24): Visualizador por Capas */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="relative">
              {/* Bouquet Canvas: Teñido con el primer color seleccionado */}
              <BouquetCanvas
                cantidad={rosas}
                rosaColor={colorRosa1.hex}
                rosaColorNombre={textoColorRosas}
                papelColor1={papel1.hex}
                papelColor1Nombre={textoColorPapel}
                monoColor={colorMono.hex}
                monoColorNombre={colorMono.nombre}
                esPliegoCombinado={esPliegoCombinado}
                papelColor2={papel2.hex}
                papelColor2Nombre={papel2.nombre}
                extras={extrasSeleccionados}
              />

              {/* Badges Flotantes Informativos con Especificaciones Claras */}
              <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none z-50">
                <span className="rounded-full bg-surface-container-lowest/95 px-3 py-1 text-[11px] font-bold text-primary shadow-sm backdrop-blur-md">
                  🌹 {rosas} Rosas • {textoColorRosas}
                </span>
                <span className="rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                  📜 Papel: {textoColorPapel}
                </span>
                <span className="rounded-full bg-surface-container-lowest/95 px-2.5 py-0.5 text-[10px] font-bold text-on-surface shadow-sm backdrop-blur-md">
                  🎀 Moño: {colorMono.nombre}
                </span>
              </div>

              {/* Badges de Extras activos */}
              {extrasSeleccionados.length > 0 && (
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 pointer-events-none z-50">
                  {extrasSeleccionados.map((id) => {
                    const extra = EXTRAS_LUJO.find((e) => e.id === id)
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

          {/* COLUMNA DERECHA (lg:col-span-7): Formulario y Controles */}
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

            {/* 2. Color de las Rosas (1 o 2 colores combinados) */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    2. Color de las Flores (Rosas Eternas)
                  </label>
                  <span className="text-[11px] font-bold text-primary">
                    {textoColorRosas}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCombinarRosas(!combinarRosas)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    combinarRosas
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name={combinarRosas ? 'check_circle' : 'add_circle'} className="text-[14px]" />
                  <span>{combinarRosas ? 'Flores Bicolor (2 tonos)' : 'Combinar 2 colores'}</span>
                </button>
              </div>

              {/* Color Principal */}
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1.5">
                  Tono Principal de Rosas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LISTONES.map((item) => {
                    const selected = rosaColor1Id === item.id
                    return (
                      <button
                        key={`rosa1-${item.id}`}
                        type="button"
                        onClick={() => setRosaColor1Id(item.id)}
                        className={`flex items-center gap-2.5 rounded-xl p-2.5 text-left transition-all ${
                          selected
                            ? 'bg-secondary-container/30 ring-2 ring-primary shadow-sm'
                            : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                        }`}
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="truncate text-[12px] font-bold">{item.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Segundo Tono de Rosas (Solo si activa combinar, máximo 2 colores) */}
              {combinarRosas && (
                <div className="rounded-xl bg-secondary-container/20 border border-primary/20 p-3.5 flex flex-col gap-2 animate-fade-in">
                  <span className="text-[10px] font-bold text-primary uppercase">
                    Segundo Color Combinado de Rosas (Máx. 2 colores):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {LISTONES.map((item) => {
                      const selected = rosaColor2Id === item.id
                      return (
                        <button
                          key={`rosa2-${item.id}`}
                          type="button"
                          onClick={() => setRosaColor2Id(item.id)}
                          className={`flex items-center gap-2.5 rounded-xl p-2 text-left transition-all ${
                            selected
                              ? 'bg-primary text-on-primary shadow-xs ring-1 ring-primary'
                              : 'bg-surface-container-lowest text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                          }`}
                        >
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-white/60 shadow-xs"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* 3. Envoltura de Papel Coreano (1 o 2 colores combinados) */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                    3. Envoltura de Papel Coreano
                  </label>
                  <span className="text-[11px] font-bold text-primary">
                    {textoColorPapel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEsPliegoCombinado(!esPliegoCombinado)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    esPliegoCombinado
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name={esPliegoCombinado ? 'check_circle' : 'add_circle'} className="text-[14px]" />
                  <span>{esPliegoCombinado ? 'Papel Bicolor (+ $35)' : 'Combinar 2 papeles'}</span>
                </button>
              </div>

              {/* Pliego Principal */}
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1.5">
                  Pliego Principal de Papel:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PAPELES.map((item) => {
                    const selected = papelColor1Id === item.id
                    return (
                      <button
                        key={`papel1-${item.id}`}
                        type="button"
                        onClick={() => setPapelColor1Id(item.id)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all ${
                          selected
                            ? 'bg-secondary-container/30 text-on-surface ring-2 ring-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 shrink-0 rounded-full border border-black/20"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="text-[12px] font-bold">{item.nombre}</span>
                        </div>
                        <span className="text-[10px] font-bold text-on-surface-variant">Incluido</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Pliego Secundario (Si está activo el toggle, límite 2 papeles) */}
              {esPliegoCombinado && (
                <div className="rounded-xl bg-secondary-container/20 border border-primary/20 p-3.5 flex flex-col gap-2.5 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                      Pliego Secundario / Interior (Máx. 2 colores):
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      + {formatMxn(PRECIO_PLIEGO_COMBINADO)} MXN
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PAPELES.map((item) => {
                      const selected = papelColor2Id === item.id
                      return (
                        <button
                          key={`papel2-${item.id}`}
                          type="button"
                          onClick={() => setPapelColor2Id(item.id)}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                            selected
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container-lowest text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-4 w-4 shrink-0 rounded-full border border-black/20"
                              style={{ backgroundColor: item.hex }}
                            />
                            <span className="text-[11px] font-bold">{item.nombre}</span>
                          </div>
                          {selected && <Icon name="check" className="text-[15px]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* 4. Color del Moño de Satín (Selector independiente) */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  4. Color del Moño de Satín (Listón)
                </label>
                <span className="text-[11px] font-bold text-primary">
                  {colorMono.nombre}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {COLORES_MONO.map((item) => {
                  const selected = monoColorId === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMonoColorId(item.id)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left transition-all ${
                        selected
                          ? 'bg-secondary-container/30 ring-2 ring-primary shadow-sm'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/60 hover:bg-surface-container'
                      }`}
                    >
                      <span
                        className="h-5 w-5 shrink-0 rounded-full border-2 border-white shadow-sm ring-1 ring-black/10"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* 5. Toques de Lujo Artesanales (Opcional) */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                5. Toques de Lujo Artesanales (Opcional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {EXTRAS_LUJO.map((extra) => {
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

            {/* 6. Dedicatoria para Caligrafía */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                6. Dedicatoria Manuscrita
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

            {/* 7. Método de Entrega en CDMX */}
            <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-3">
                7. Método de Entrega en CDMX
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Cotización Total del Ramo
                  </span>
                  <p className="font-headline text-2xl font-bold text-primary">
                    {formatMxn(total)} <span className="text-[12px] font-normal text-on-surface-variant">MXN</span>
                  </p>
                </div>
                <div className="flex flex-col sm:items-end">
                  <span className="rounded-full bg-tertiary-fixed/40 px-3 py-1 text-[11px] font-bold text-tertiary">
                    Anticipo sugerido (50%): {formatMxn(Math.round(total / 2))} MXN
                  </span>
                  <span className="text-[10px] text-on-surface-variant mt-1">
                    {rosas} Rosas ({textoColorRosas}) • {esPliegoCombinado ? 'Papel Bicolor (+ $35)' : 'Papel único'}
                  </span>
                </div>
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
