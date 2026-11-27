import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Icon } from '../ui/Icon'
import {
  COLORES_MONO,
  ENVIO_CDMX,
  LISTONES,
  PAPELES,
  RAMOS_EXPRESS,
} from '../../lib/atelier'
import { formatMxn, formatMxnExact } from '../../lib/format'
import { waUrl } from '../../lib/whatsapp'
import { obtenerProductosMemoria } from '../../api/products'
import { solicitarQrCobroCodi } from '../../api/payments'
import { createPedido } from '../../api/orders'
import { fetchCatalogos, type CatalogosAgrupados } from '../../api/catalogos'
import { guardarPedidoLocal, type PedidoGuardado } from '../../lib/ordersStorage'
import type { MetodoEntrega, ModalidadPago } from '../../types/models'

export function VendedorExpress() {
  // Catálogo reactivo con existencias del taller
  const [catalogoTaller, setCatalogoTaller] = useState(() => obtenerProductosMemoria())
  const [catalogosBD, setCatalogosBD] = useState<CatalogosAgrupados>({})

  useEffect(() => {
    fetchCatalogos().then(setCatalogosBD)
    const handleCat = () => fetchCatalogos().then(setCatalogosBD)
    window.addEventListener('catalogos-updated', handleCat)
    return () => window.removeEventListener('catalogos-updated', handleCat)
  }, [])

  useEffect(() => {
    const handleUpdate = () => setCatalogoTaller(obtenerProductosMemoria())
    window.addEventListener('catalogo-updated', handleUpdate)
    return () => window.removeEventListener('catalogo-updated', handleUpdate)
  }, [])

  const listaRosas = (catalogosBD.ColoresRosas && catalogosBD.ColoresRosas.length > 0
    ? catalogosBD.ColoresRosas
    : LISTONES
  ).map((c) => ({
    id: c.nombre || (c as any).id,
    nombre: c.nombre,
    hex: c.valorhex || (c as any).hex || '#6b1d2f',
  }))

  const listaPapeles = (catalogosBD.Papeles && catalogosBD.Papeles.length > 0
    ? catalogosBD.Papeles
    : PAPELES
  ).map((p) => ({
    id: p.clave || (p as any).id,
    nombre: p.nombre,
    hex: p.valorhex || (p as any).hex || '#f5efe6',
  }))

  const listaMonos = (catalogosBD.Listones && catalogosBD.Listones.length > 0
    ? catalogosBD.Listones
    : COLORES_MONO
  ).map((m) => ({
    id: m.nombre || (m as any).id,
    nombre: m.nombre,
    hex: m.valorhex || (m as any).hex || '#6b1d2f',
  }))

  const ramosExistencia = catalogoTaller.filter((p) => p.stock > 0 && p.estado !== 'agotado')

  // Pestaña principal: Ramos en Existencia (Mostrador) vs Encargo por Confeccionar
  const [tabTipoVenta, setTabTipoVenta] = useState<'existencia' | 'encargo'>('existencia')

  // Estado para Ramo en Existencia (Mostrador)
  const [productoExistenciaId, setProductoExistenciaId] = useState<string>(
    ramosExistencia[0]?.id || '1'
  )

  // ==========================================
  // ESTADOS PARA ENCARGO POR CONFECCIONAR
  // ==========================================
  // 1. Cantidad de rosas
  const [rosas, setRosas] = useState<6 | 12 | 24 | 50>(12)

  // 2. Color de rosas (máximo 2 colores combinados)
  const [rosaColor1, setRosaColor1] = useState<string>('Vino Tinto Real')
  const [combinarRosas, setCombinarRosas] = useState<boolean>(false)
  const [rosaColor2, setRosaColor2] = useState<string>('Rosa Pastel')

  // 3. Color de papel coreano (máximo 2 colores combinados)
  const [papelId1, setPapelId1] = useState<string>('marfil')
  const [combinarPapel, setCombinarPapel] = useState<boolean>(false)
  const [papelId2, setPapelId2] = useState<string>('dorado')

  // 4. Color del moño / listón (independiente)
  const [monoColor, setMonoColor] = useState<string>('Vino Tinto Real')

  // Dedicatoria manuscrita
  const [dedicatoriaPara, setDedicatoriaPara] = useState('')
  const [dedicatoriaDe, setDedicatoriaDe] = useState('')
  const [dedicatoriaMensaje, setDedicatoriaMensaje] = useState('')

  // Datos comunes de cliente y logística
  const [clienteNombre, setClienteNombre] = useState('Cliente Mostrador')
  const [clienteTelefono, setClienteTelefono] = useState('55 4912 8840')
  const [fechaEntrega, setFechaEntrega] = useState('Entrega inmediata')
  const [entrega, setEntrega] = useState<MetodoEntrega>('recoger')
  const [modalidad, setModalidad] = useState<ModalidadPago>('completo')
  const [notaInterna, setNotaInterna] = useState('')

  // Control de generación del QR bajo demanda (vía API)
  const [qrGenerado, setQrGenerado] = useState(false)
  const [cargandoQr, setCargandoQr] = useState(false)
  const [horaGeneracionQr, setHoraGeneracionQr] = useState<string | null>(null)
  const [qrStringApi, setQrStringApi] = useState<string | null>(null)

  // Feedback de guardado
  const [pedidoGuardadoExito, setPedidoGuardadoExito] = useState<PedidoGuardado | null>(null)

  const tarjetaRef = useRef<HTMLDivElement>(null)

  // Búsqueda de objetos seleccionados
  const productoExistencia =
    ramosExistencia.find((p) => p.id === productoExistenciaId) || ramosExistencia[0]
  const ramoSeleccionadoExpress =
    RAMOS_EXPRESS.find((r) => r.rosas === rosas) ?? RAMOS_EXPRESS[1]

  const papelObj1 = listaPapeles.find((p) => p.id === papelId1) ?? listaPapeles[0] ?? { nombre: 'Traslúcido Marfil' }
  const papelObj2 = listaPapeles.find((p) => p.id === papelId2) ?? listaPapeles[4] ?? listaPapeles[0] ?? { nombre: 'Dorado Champán' }

  // Formateo de texto de colores para encargo
  const textoColorRosas =
    combinarRosas && rosaColor1 !== rosaColor2
      ? `${rosaColor1} + ${rosaColor2} (Bicolor)`
      : rosaColor1

  const textoColorPapel =
    combinarPapel && papelId1 !== papelId2
      ? `${papelObj1.nombre} + ${papelObj2.nombre} (Bicolor)`
      : papelObj1.nombre

  // Cálculos dinámicos
  const esExistencia = tabTipoVenta === 'existencia'
  const precioRamo = esExistencia
    ? productoExistencia.precioUnitario
    : ramoSeleccionadoExpress.precioUnitario
  const piezasRosas = esExistencia ? productoExistencia.piezas : rosas
  const nombreRamo = esExistencia
    ? productoExistencia.nombre
    : `Ramo ${rosas} Rosas Eternas (${textoColorRosas})`

  const costoEnvio = entrega === 'envio' ? ENVIO_CDMX.precio : 0
  const total = precioRamo + costoEnvio
  const montoAnticipo = Math.round(total / 2)
  const montoCompleto = total
  const montoATransferir = modalidad === 'anticipo' ? montoAnticipo : montoCompleto

  const referencia = `DE-${Date.now().toString().slice(-6)}`

  // Si es existencia, solo se muestra dedicatoria cuando entrega === 'envio'
  // Si es encargo, la dedicatoria siempre está disponible
  const mostrarDedicatoria = esExistencia ? entrega === 'envio' : true

  // Petición a la API para generar el Código QR de Cobro
  const handleSolicitarQrApi = async () => {
    setCargandoQr(true)
    try {
      const res = await solicitarQrCobroCodi(referencia, montoATransferir, `Cobro ${nombreRamo}`)
      if (res && res.qrString) {
        setQrStringApi(res.qrString)
      }
      setQrGenerado(true)
      setHoraGeneracionQr(
        new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      )
      tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      console.warn('Error al solicitar QR a la API:', err)
      setQrGenerado(true)
    } finally {
      setCargandoQr(false)
    }
  }

  // Registrar Pedido en el Libro de Pedidos y sincronizar con la API
  const handleRegistrarVenta = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const nuevoFolio = esExistencia ? `DE-EX-${randomSuffix}` : `DE-EN-${randomSuffix}`

    const nuevoPedido: PedidoGuardado = {
      id: String(Date.now()),
      folio: nuevoFolio,
      fecha: 'Hoy',
      clienteNombre: clienteNombre.trim() || 'Cliente Mostrador',
      clienteTelefono: clienteTelefono.trim() || '5500000000',
      productoNombre: nombreRamo,
      productoPiezas: piezasRosas,
      colorRosas: esExistencia ? productoExistencia.color : textoColorRosas,
      colorPapel: esExistencia ? 'Papel Coreano de Exhibición' : textoColorPapel,
      colorMono: esExistencia ? 'Listón de Mostrador' : monoColor,
      entrega,
      direccion: entrega === 'envio' ? 'Envío programado en CDMX' : 'Mostrador Atelier Roma Norte',
      sucursalNombre: 'Atelier Roma Norte',
      modalidad,
      total,
      pagadoHoy: montoATransferir,
      saldoRestante: modalidad === 'completo' ? 0 : total - montoAnticipo,
      estado: esExistencia ? 'listo' : 'taller',
      referencia,
      estadoPago: modalidad === 'completo' ? 'pagado' : 'pendiente',
      fechaPago:
        modalidad === 'completo'
          ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
          : undefined,
      tipoVenta: esExistencia ? 'existencia' : 'encargo',
      notaInterna:
        notaInterna.trim() ||
        (esExistencia
          ? 'Venta directa en mostrador con ramo en existencia.'
          : `Encargo: ${piezasRosas} rosas (${textoColorRosas}), papel (${textoColorPapel}), moño (${monoColor}).`),
      dedicatoriaPara: mostrarDedicatoria && dedicatoriaPara.trim() ? dedicatoriaPara.trim() : undefined,
      dedicatoriaDe: mostrarDedicatoria && dedicatoriaDe.trim() ? dedicatoriaDe.trim() : undefined,
      dedicatoriaMensaje:
        mostrarDedicatoria && dedicatoriaMensaje.trim() ? dedicatoriaMensaje.trim() : undefined,
      activo: true,
    }

    createPedido(nuevoPedido)
    setPedidoGuardadoExito(nuevoPedido)
    tarjetaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Datos optimizados para el escaneo del cliente con su propio celular
  const qrData = `https://dulceeternidad.com/pago-directo?folio=${referencia}&monto=${montoATransferir}&tipo=${tabTipoVenta}`

  const mensajeCobro = `🌸 *DULCE ETERNIDAD - ATELIER CDMX*
Resumen de compra en mostrador:

💐 *Ramo:* ${nombreRamo} (${piezasRosas} Rosas)
${
  esExistencia
    ? `🎨 *Diseño en vitrina:* ${productoExistencia.color}\n`
    : `🌹 *Rosas:* ${textoColorRosas}
📜 *Papel:* ${textoColorPapel}
🎀 *Moño:* ${monoColor}\n`
}📅 *Fecha:* ${fechaEntrega}
🚚 *Modalidad:* ${entrega === 'envio' ? `Envío CDMX (+$${ENVIO_CDMX.precio} MXN)` : 'Entrega en mostrador / Atelier ($0 MXN)'}
${mostrarDedicatoria && dedicatoriaMensaje ? `💌 *Dedicatoria:* "${dedicatoriaMensaje}"\n` : ''}
━━━━━━━━━━━━━━━━━━━━━
💰 *Total:* ${formatMxn(total)} MXN
💳 *Monto pagado:* ${formatMxnExact(montoATransferir)} (${modalidad === 'anticipo' ? 'Anticipo 50%' : '100% Liquidado'})
${modalidad === 'anticipo' ? `📦 *Saldo al entregar:* ${formatMxn(total - montoAnticipo)} MXN\n` : ''}━━━━━━━━━━━━━━━━━━━━━
¡Gracias por tu compra en Dulce Eternidad! ✨`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pb-8">
      {/* ============================================================== */}
      {/* COLUMNA IZQUIERDA: Formulario de Configuración y Selección     */}
      {/* En móvil va primero (arriba), en desktop ocupa col-span-7     */}
      {/* ============================================================== */}
      <div className="flex flex-col gap-6 lg:col-span-7 order-1">
        {/* SELECTOR DE PESTAÑA PRINCIPAL */}
        <div className="flex rounded-2xl bg-surface-container-high p-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTabTipoVenta('existencia')
              setModalidad('completo')
              setEntrega('recoger')
              setFechaEntrega('Entrega inmediata en mostrador')
              setQrGenerado(false)
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition-all ${
              tabTipoVenta === 'existencia'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="inventory_2" className="text-[18px]" />
            <span>Ramos en Existencia (Mostrador)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTabTipoVenta('encargo')
              setModalidad('anticipo')
              setFechaEntrega('Mañana, 4:30 PM')
              setQrGenerado(false)
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold transition-all ${
              tabTipoVenta === 'encargo'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="design_services" className="text-[18px]" />
            <span>Encargo por Confeccionar</span>
          </button>
        </div>

        {/* FEEDBACK DE PEDIDO REGISTRADO CON ÉXITO */}
        {pedidoGuardadoExito && (
          <div className="rounded-2xl border border-tertiary/30 bg-tertiary-fixed/20 p-4 shadow-sm flex items-start justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-tertiary text-on-tertiary">
                <Icon name="check" className="text-[20px]" />
              </span>
              <div>
                <p className="font-headline text-[15px] font-bold text-on-surface">
                  ¡Venta registrada con éxito! Folio:{' '}
                  <span className="text-primary font-mono">{pedidoGuardadoExito.folio}</span>
                </p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Registrado en Libro de Pedidos como:{' '}
                  <strong className="text-on-surface uppercase">
                    {pedidoGuardadoExito.estado === 'listo' ? 'Listo en Vitrina' : 'En Taller'}
                  </strong>
                  .
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPedidoGuardadoExito(null)}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <Icon name="close" className="text-[18px]" />
            </button>
          </div>
        )}

        {/* PESTAÑA 1: RAMOS EN EXISTENCIA (MOSTRADOR) */}
        {tabTipoVenta === 'existencia' ? (
          <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-sm ring-1 ring-surface-variant/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                  <Icon name="storefront" className="text-[17px]" />
                </span>
                <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
                  Ramos Disponibles en Mostrador
                </h3>
              </div>
              <span className="rounded-full bg-secondary-container/40 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                {ramosExistencia.length} en stock
              </span>
            </div>

            <p className="text-[12px] text-on-surface-variant">
              Elige el ramo físico de vitrina para cobrarlo inmediatamente con el código QR:
            </p>

            {/* Cuadrícula de Ramos en Existencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ramosExistencia.map((prod) => {
                const selected = productoExistenciaId === prod.id
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setProductoExistenciaId(prod.id)
                      setQrGenerado(false)
                    }}
                    className={`flex items-center gap-3.5 rounded-2xl p-3 text-left transition-all ${
                      selected
                        ? 'bg-secondary-container/30 ring-2 ring-primary shadow-sm'
                        : 'bg-surface-container-low ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                    }`}
                  >
                    <img
                      src={prod.image_url || ''}
                      alt={prod.nombre}
                      className="h-16 w-16 rounded-xl object-cover shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-[13px] font-bold text-on-surface">
                          {prod.nombre}
                        </span>
                        <span className="shrink-0 rounded-full bg-tertiary-fixed/40 px-1.5 py-0.2 text-[9px] font-bold text-tertiary">
                          {prod.stock} disp.
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {prod.piezas} rosas • {prod.color}
                      </p>
                      <p className="font-headline text-[14px] font-bold text-primary mt-1">
                        {formatMxn(prod.precioUnitario)} MXN
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ) : (
          /* PESTAÑA 2: ENCARGO POR CONFECCIONAR (SIN PREVISUALIZACIÓN VISUAL) */
          <section className="flex flex-col gap-5 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-sm ring-1 ring-surface-variant/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                  <Icon name="content_cut" className="text-[17px]" />
                </span>
                <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
                  Encargo para Confección en Taller
                </h3>
              </div>
              <span className="rounded-full bg-secondary-container/40 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                Toma ágil sin visor
              </span>
            </div>

            {/* 1. CANTIDAD DE FLORES */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                <span>1. Cantidad de Flores (Rosas Eternas)</span>
                <span className="text-primary font-bold">{rosas} Rosas</span>
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {RAMOS_EXPRESS.map((item) => {
                  const selected = rosas === item.rosas
                  return (
                    <button
                      key={item.rosas}
                      type="button"
                      onClick={() => {
                        setRosas(item.rosas)
                        setQrGenerado(false)
                      }}
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

            {/* 2. COLOR DE LAS FLORES (MÁXIMO 2 COLORES COMBINADOS) */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  2. Color de las Flores (Rosas)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCombinarRosas(!combinarRosas)
                    setQrGenerado(false)
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    combinarRosas
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name={combinarRosas ? 'check_circle' : 'add_circle'} className="text-[14px]" />
                  <span>{combinarRosas ? 'Flores Bicolor (2 colores)' : 'Combinar 2 colores'}</span>
                </button>
              </div>

              {/* Tono Principal de Rosas */}
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1.5">
                  Color Principal de las Rosas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {listaRosas.map((item) => {
                    const selected = rosaColor1 === item.id
                    return (
                      <button
                        key={`rosa1-${item.id}`}
                        type="button"
                        onClick={() => {
                          setRosaColor1(item.id)
                          setQrGenerado(false)
                        }}
                        className={`flex items-center gap-2 rounded-xl p-2.5 text-left transition-all ${
                          selected
                            ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                            : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 shadow-xs"
                          style={{ backgroundColor: item.hex }}
                        />
                        <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Segundo Tono de Rosas (Solo si activar combinación, límite 2 colores) */}
              {combinarRosas && (
                <div className="mt-1 rounded-2xl bg-secondary-container/20 border border-primary/20 p-3.5 animate-fade-in">
                  <span className="text-[10px] font-bold text-primary uppercase block mb-1.5">
                    Segundo Color Combinado de las Rosas (Máx. 2 colores):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {listaRosas.map((item) => {
                      const selected = rosaColor2 === item.id
                      return (
                        <button
                          key={`rosa2-${item.id}`}
                          type="button"
                          onClick={() => {
                            setRosaColor2(item.id)
                            setQrGenerado(false)
                          }}
                          className={`flex items-center gap-2 rounded-xl p-2 text-left transition-all ${
                            selected
                              ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                              : 'bg-surface-container-lowest text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                          }`}
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-white/50 shadow-xs"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. COLOR DEL PAPEL COREANO (MÁXIMO 2 COLORES COMBINADOS) */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-surface-variant/40">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  3. Color del Papel Coreano (Envoltura)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCombinarPapel(!combinarPapel)
                    setQrGenerado(false)
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
                    combinarPapel
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name={combinarPapel ? 'check_circle' : 'add_circle'} className="text-[14px]" />
                  <span>{combinarPapel ? 'Papel Bicolor (2 pliegos)' : 'Combinar 2 papeles'}</span>
                </button>
              </div>

              {/* Pliego 1 */}
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase block mb-1.5">
                  Pliego Principal de Papel:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {listaPapeles.map((item) => {
                    const selected = papelId1 === item.id
                    return (
                      <button
                        key={`papel1-${item.id}`}
                        type="button"
                        onClick={() => {
                          setPapelId1(item.id)
                          setQrGenerado(false)
                        }}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all ${
                          selected
                            ? 'bg-secondary-container/30 text-on-surface ring-2 ring-primary shadow-xs'
                            : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20"
                            style={{ backgroundColor: item.hex }}
                          />
                          <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                        </div>
                        <Icon
                          name="check"
                          className={`text-[15px] ${selected ? 'text-primary' : 'opacity-0'}`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Pliego 2 (Solo si activa combinar, límite 2 papeles) */}
              {combinarPapel && (
                <div className="mt-1 rounded-2xl bg-secondary-container/20 border border-primary/20 p-3.5 animate-fade-in">
                  <span className="text-[10px] font-bold text-primary uppercase block mb-1.5">
                    Segundo Pliego de Papel (Máx. 2 colores):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {listaPapeles.map((item) => {
                      const selected = papelId2 === item.id
                      return (
                        <button
                          key={`papel2-${item.id}`}
                          type="button"
                          onClick={() => {
                            setPapelId2(item.id)
                            setQrGenerado(false)
                          }}
                          className={`flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                            selected
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container-lowest text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full border border-black/20"
                              style={{ backgroundColor: item.hex }}
                            />
                            <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                          </div>
                          <Icon
                            name="check"
                            className={`text-[14px] ${selected ? 'text-on-primary' : 'opacity-0'}`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. COLOR DEL MOÑO (INDEPENDIENTE DE ROSAS Y PAPEL) */}
            <div className="flex flex-col gap-2 pt-2 border-t border-surface-variant/40">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                <span>4. Color del Moño de Satín (Listón)</span>
                <span className="text-primary font-bold">{monoColor}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {listaMonos.map((item) => {
                  const selected = monoColor === item.id
                  return (
                    <button
                      key={`mono-${item.id}`}
                      type="button"
                      onClick={() => {
                        setMonoColor(item.id)
                        setQrGenerado(false)
                      }}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left transition-all ${
                        selected
                          ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                          : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/50 shadow-xs"
                        style={{ backgroundColor: item.hex }}
                      />
                      <span className="truncate text-[11px] font-bold">{item.nombre}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. DEDICATORIA CALIGRAFIADA EN TARJETA */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-surface-variant/40">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                <Icon name="history_edu" className="text-[16px] text-primary" />
                5. Dedicatoria Caligrafiada en Tarjeta (Opcional)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Para: (ej. Valeria)"
                  value={dedicatoriaPara}
                  onChange={(e) => setDedicatoriaPara(e.target.value)}
                  className="rounded-xl bg-surface-container-low px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                />
                <input
                  type="text"
                  placeholder="De parte de: (ej. Carlos)"
                  value={dedicatoriaDe}
                  onChange={(e) => setDedicatoriaDe(e.target.value)}
                  className="rounded-xl bg-surface-container-low px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                />
              </div>

              <textarea
                rows={2}
                placeholder="Escribe el mensaje manuscrito que caligrafiará el taller..."
                value={dedicatoriaMensaje}
                onChange={(e) => setDedicatoriaMensaje(e.target.value)}
                className="rounded-xl bg-surface-container-low p-3 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none resize-none"
              />
            </div>
          </section>
        )}

        {/* SECCIÓN 2: DATOS DEL CLIENTE, LOGÍSTICA Y NOTA INTERNA */}
        <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-4 md:p-6 shadow-sm ring-1 ring-surface-variant/60">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
              <Icon name="badge" className="text-[17px]" />
            </span>
            <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
              Datos del Cliente & Logística
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
                <label className="text-[11px] font-bold text-on-surface-variant">WhatsApp / Celular (10 dígitos):</label>
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
                    placeholder={esExistencia ? 'Inmediato en mostrador' : 'Mañana 4:30 PM'}
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
                  onClick={() => {
                    setEntrega('recoger')
                    setQrGenerado(false)
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    entrega === 'recoger'
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[12px] font-bold">
                    <Icon name="storefront" className="text-[16px]" />
                    Mostrador / Atelier
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      entrega === 'recoger' ? 'text-on-primary/80' : 'text-on-surface-variant'
                    }`}
                  >
                    Sin Costo Extra ($0 MXN)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEntrega('envio')
                    setQrGenerado(false)
                  }}
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
                  <span
                    className={`text-[10px] mt-0.5 ${
                      entrega === 'envio' ? 'text-on-primary/80' : 'text-on-surface-variant'
                    }`}
                  >
                    + ${ENVIO_CDMX.precio} MXN
                  </span>
                </button>
              </div>
            </div>

            {/* Dedicatoria condicional para Ramos de Existencia si se eligió Envío */}
            {esExistencia && entrega === 'envio' && (
              <div className="flex flex-col gap-2.5 rounded-2xl bg-secondary-container/20 border border-primary/20 p-4 animate-fade-in">
                <label className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="history_edu" className="text-[16px]" />
                  Tarjeta de Dedicatoria Caligrafiada (Envío a Domicilio)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Para: (ej. Valeria)"
                    value={dedicatoriaPara}
                    onChange={(e) => setDedicatoriaPara(e.target.value)}
                    className="rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="De: (ej. Carlos)"
                    value={dedicatoriaDe}
                    onChange={(e) => setDedicatoriaDe(e.target.value)}
                    className="rounded-xl bg-surface-container-lowest px-3 py-2 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Mensaje de amor, felicitación o dedicatoria para incluir con el ramo..."
                  value={dedicatoriaMensaje}
                  onChange={(e) => setDedicatoriaMensaje(e.target.value)}
                  className="rounded-xl bg-surface-container-lowest p-3 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none resize-none"
                />
              </div>
            )}

            {/* Nota Interna del Vendedor / Taller */}
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1.5">
                <Icon name="sticky_note_2" className="text-[15px] text-tertiary" />
                Nota Interna del Taller (Instrucciones para floristas):
              </label>
              <input
                type="text"
                value={notaInterna}
                onChange={(e) => setNotaInterna(e.target.value)}
                placeholder="Ej. Entregar en bolsa especial, cliente recoge 5pm, añadir listón largo..."
                className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
              />
            </div>

            {/* Esquema de Cobro */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Esquema de Cobro
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalidad('completo')
                    setQrGenerado(false)
                  }}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                    modalidad === 'completo'
                      ? 'bg-secondary-container/40 text-primary ring-2 ring-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface ring-1 ring-surface-variant/70 hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-bold">
                    <Icon name="check_circle" className="text-[15px]" />
                    Pago Total 100% {esExistencia && '(Recomendado)'}
                  </div>
                  <span className="text-[12px] font-headline font-bold text-primary mt-0.5">
                    {formatMxn(montoCompleto)} MXN
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalidad('anticipo')
                    setQrGenerado(false)
                  }}
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
              </div>
            </div>

            {/* BOTONES DE ACCIÓN: Generar QR & Registrar Pedido */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleSolicitarQrApi}
                disabled={cargandoQr}
                className="flex flex-1 min-h-12 items-center justify-center gap-2 rounded-xl bg-tertiary px-4 py-3 text-[13px] font-bold text-on-tertiary shadow-md hover:bg-tertiary/95 active:scale-[0.98] transition-all disabled:opacity-70"
              >
                {cargandoQr ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Conectando con API CoDi...</span>
                  </>
                ) : (
                  <>
                    <Icon name="qr_code_2" className="text-[20px]" />
                    <span>{qrGenerado ? 'Actualizar QR con API' : 'Generar QR de Cobro (API)'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRegistrarVenta}
                className="flex flex-1 min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[13px] font-bold text-on-primary shadow-md hover:bg-primary/95 active:scale-[0.98] transition-all"
              >
                <Icon name="save" className="text-[20px]" />
                <span>
                  {esExistencia ? 'Registrar Venta Mostrador' : 'Registrar Encargo Taller'}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* COLUMNA DERECHA: Tarjeta de Cobro por QR para el Cliente       */}
      {/* En desktop (lg+) queda a la derecha fija (sticky).             */}
      {/* En móvil queda abajo (order-2), después del formulario.        */}
      {/* ============================================================== */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 order-2 w-full">
        <section
          ref={tarjetaRef}
          className="flex flex-col gap-4 rounded-3xl bg-surface-container-lowest p-5 md:p-6 shadow-md ring-1 ring-surface-variant/70"
        >
          {/* Encabezado de la Tarjeta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
                <Icon name="qr_code_scanner" className="text-[18px]" />
              </span>
              <h3 className="font-headline text-base md:text-lg font-bold text-on-surface">
                Cobro por Código QR
              </h3>
            </div>
            {qrGenerado ? (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                QR Activo
              </span>
            ) : (
              <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
                En espera de solicitud
              </span>
            )}
          </div>

          {/* Tarjeta Visual de Cobro */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-surface-container-lowest via-surface-container-low to-surface-container-low p-5 shadow-sm flex flex-col items-center text-center gap-4">
            {/* Título de Marca */}
            <div>
              <p className="font-headline text-lg font-bold text-primary">Dulce Eternidad</p>
              <p className="text-[10px] text-on-surface-variant">Atelier Floral CDMX • Rosas Eternas</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold text-primary uppercase">
                {esExistencia ? 'Venta de Mostrador' : 'Encargo en Taller'}
              </span>
            </div>

            {/* SI EL QR YA FUE GENERADO POR LA API: MOSTRAR EL QR LISTO PARA ESCANEO */}
            {qrGenerado ? (
              <div className="flex flex-col items-center justify-center gap-3 w-full animate-fade-in">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/10">
                  <QRCodeSVG
                    value={qrStringApi || qrData}
                    size={175}
                    level="M"
                    marginSize={1}
                    className="rounded-lg"
                  />
                  <div className="mt-2.5 flex items-center gap-1.5 text-zinc-600">
                    <Icon name="photo_camera" className="text-[14px]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Escanear con tu celular
                    </span>
                  </div>
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-[11px] font-semibold text-emerald-800 flex items-center justify-center gap-1">
                    <Icon name="check_circle" className="text-[13px]" />
                    Código generado por la API ({horaGeneracionQr})
                  </p>
                  <p className="text-[11px] text-on-surface-variant max-w-[240px] leading-tight">
                    El cliente puede apuntar la cámara de su teléfono para pagar directamente.
                  </p>
                </div>
              </div>
            ) : (
              /* ESTADO PREVIO: PLACEHOLDER HASTA QUE SE PRESIONE EL BOTÓN DE GENERACIÓN */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-surface-variant/80 bg-surface-container-lowest/60 p-6 w-full text-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-container/30 text-primary">
                  <Icon name="point_of_sale" className="text-[30px]" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-on-surface">
                    QR de Cobro no solicitado aún
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-1 max-w-[220px]">
                    Presiona el botón para solicitar el código de cobro a la API y mostrarlo en pantalla.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSolicitarQrApi}
                  disabled={cargandoQr}
                  className="flex items-center gap-2 rounded-xl bg-tertiary px-4 py-2.5 text-[12px] font-bold text-on-tertiary shadow-sm hover:opacity-95 active:scale-95 transition-all disabled:opacity-60"
                >
                  {cargandoQr ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="bolt" className="text-[16px]" />
                      <span>Generar Código QR Ahora</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Desglose del Ramo */}
            <div className="w-full space-y-2 border-t border-surface-variant/50 pt-3 text-left text-[12px]">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-on-surface truncate max-w-[190px]">
                  {nombreRamo}
                </span>
                <span className="font-headline font-bold text-primary shrink-0">
                  {formatMxn(precioRamo)} MXN
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="font-medium">Flores:</span>{' '}
                  <span className="font-semibold text-on-surface text-right">
                    {piezasRosas} rosas • {esExistencia ? productoExistencia.color : textoColorRosas}
                  </span>
                </div>
                {!esExistencia && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Papel:</span>{' '}
                      <span className="font-semibold text-on-surface text-right truncate max-w-[180px]">
                        {textoColorPapel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Moño:</span>{' '}
                      <span className="font-semibold text-on-surface text-right">
                        {monoColor}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Entrega:</span>{' '}
                  <span className="font-semibold text-on-surface text-right">{fechaEntrega}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Modalidad:</span>{' '}
                  <span className="font-semibold text-on-surface text-right">
                    {entrega === 'envio' ? `Envío ($${ENVIO_CDMX.precio})` : 'Mostrador ($0)'}
                  </span>
                </div>
              </div>

              {/* Monto a Cobrar Destacado */}
              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-surface-container-lowest p-3.5 ring-1 ring-surface-variant/70">
                <div>
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Monto a cobrar:
                  </span>
                  <span className="font-headline text-2xl font-bold text-primary">
                    {formatMxn(montoATransferir)} <span className="text-[11px] font-normal">MXN</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                    Total:
                  </span>
                  <span className="text-[13px] font-bold text-on-surface">
                    {formatMxn(total)} MXN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón WhatsApp para compartir resumen al comprador */}
          <a
            href={waUrl(mensajeCobro, clienteTelefono || undefined)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-tertiary px-4 py-3 text-[13px] font-bold text-on-tertiary shadow-md transition-transform hover:opacity-95 active:scale-[0.98]"
          >
            <Icon name="chat" className="text-[18px]" />
            Compartir Resumen por WhatsApp
          </a>

          {pedidoGuardadoExito && (
            <p className="text-center text-[11px] font-semibold text-tertiary">
              ✓ Pedido registrado con folio {pedidoGuardadoExito.folio}.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
