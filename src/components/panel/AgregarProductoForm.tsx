import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react'
import {
  createProducto,
  uploadProductoImagen,
  obtenerProductosMemoria,
  toggleAgotadoProducto,
  actualizarProductoCatalogo,
} from '../../api/products'
import { isApiError } from '../../api/client'
import { Icon } from '../ui/Icon'
import { COLECCIONES, OCASIONES } from '../../lib/atelier'
import { formatMxn } from '../../lib/format'
import type { EstadoCatalogo, Producto } from '../../types/models'

type AgregarProductoFormProps = {
  onSuccess?: (producto: Producto) => void
  onCancel?: () => void
}

type TabVista = 'alta' | 'administrar'
type FiltroAdmin = 'todos' | 'disponibles' | 'agotados'

export function AgregarProductoForm({ onSuccess, onCancel }: AgregarProductoFormProps) {
  const [tabActual, setTabActual] = useState<TabVista>('alta')

  // Estados para Alta de Nuevo Ramo
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState<number>(850)
  const [piezas, setPiezas] = useState<number>(12)
  const [ocasion, setOcasion] = useState<string>('san-valentin')
  const [coleccion, setColeccion] = useState<string>('clasicos')

  // Disponibilidad y Stock al dar de alta
  const [estadoDisponibilidad, setEstadoDisponibilidad] = useState<EstadoCatalogo>('activo')
  const [stock, setStock] = useState<number>(1)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorSubida, setErrorSubida] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [creado, setCreado] = useState<Producto | null>(null)

  // Estados para Administrar Catálogo & Agotados
  const [catalogo, setCatalogo] = useState<Producto[]>([])
  const [filtroAdmin, setFiltroAdmin] = useState<FiltroAdmin>('todos')
  const [busquedaAdmin, setBusquedaAdmin] = useState('')
  const [mensajeAdmin, setMensajeAdmin] = useState<string | null>(null)

  const recargarCatalogo = () => {
    setCatalogo(obtenerProductosMemoria())
  }

  useEffect(() => {
    recargarCatalogo()
    const handleUpdate = () => recargarCatalogo()
    window.addEventListener('catalogo-updated', handleUpdate)
    return () => window.removeEventListener('catalogo-updated', handleUpdate)
  }, [])

  const handleToggleAgotado = (id: string, nombreRamo: string) => {
    const res = toggleAgotadoProducto(id)
    if (res) {
      recargarCatalogo()
      const nuevoEstadoTexto = res.estado === 'agotado' ? 'Agotado (WhatsApp activo)' : 'Disponible en tienda'
      setMensajeAdmin(`"${nombreRamo}" marcado como ${nuevoEstadoTexto}`)
      setTimeout(() => setMensajeAdmin(null), 3500)
    }
  }

  const handleCambiarStockManual = (id: string, nuevoStock: number) => {
    const estadoCalc: EstadoCatalogo = nuevoStock <= 0 ? 'agotado' : 'activo'
    actualizarProductoCatalogo(id, {
      stock: Math.max(0, nuevoStock),
      estado: estadoCalc,
      badge: estadoCalc === 'agotado' ? 'Agotado' : undefined,
    })
    recargarCatalogo()
  }

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setErrorSubida(null)

    if (file.size > 5 * 1024 * 1024) {
      setErrorSubida('La imagen supera el máximo de 5 MB.')
      return
    }

    setUploadingImage(true)
    try {
      const url = await uploadProductoImagen(file)
      setImageUrl(url)
    } catch (err: unknown) {
      if (isApiError(err)) {
        setErrorSubida(err.message)
      } else if (err instanceof Error) {
        setErrorSubida(err.message)
      } else {
        setErrorSubida('No se pudo subir la imagen. Intenta con JPG, PNG o WebP.')
      }
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      setErrorGeneral('Por favor ingresa el nombre del ramo.')
      return
    }

    setSubmitting(true)
    setErrorGeneral(null)

    const isAgotado = estadoDisponibilidad === 'agotado' || Number(stock) <= 0

    try {
      const nuevo = await createProducto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precioUnitario: Number(precioUnitario),
        piezas: Number(piezas),
        ocasion,
        coleccion,
        image_url: imageUrl,
        estado: isAgotado ? 'agotado' : 'activo',
        stock: isAgotado ? 0 : Number(stock),
      })

      setCreado(nuevo)
      recargarCatalogo()
      if (onSuccess) onSuccess(nuevo)
    } catch (err: unknown) {
      if (isApiError(err)) {
        setErrorGeneral(err.message)
      } else if (err instanceof Error) {
        setErrorGeneral(err.message)
      } else {
        setErrorGeneral('Error al guardar el nuevo ramo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setNombre('')
    setDescripcion('')
    setPrecioUnitario(850)
    setPiezas(12)
    setEstadoDisponibilidad('activo')
    setStock(1)
    setImageUrl(null)
    setCreado(null)
    setErrorSubida(null)
    setErrorGeneral(null)
  }

  if (creado) {
    const esAgotado = creado.estado === 'agotado' || creado.stock === 0
    return (
      <div className="mx-auto max-w-lg flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-6 md:p-8 text-center shadow-sm ring-1 ring-surface-variant/60">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
          esAgotado ? 'bg-amber-100 text-amber-800' : 'bg-tertiary-fixed/40 text-tertiary'
        }`}>
          <Icon name={esAgotado ? 'do_not_disturb_on' : 'check_circle'} className="text-[36px]" />
        </div>
        <div>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${
            esAgotado ? 'text-amber-800' : 'text-tertiary'
          }`}>
            {esAgotado ? '¡Ramo Agotado Registrado!' : '¡Alta Exitosa!'}
          </span>
          <h3 className="font-headline text-2xl font-bold text-on-surface mt-0.5">{creado.nombre}</h3>
          <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
            {esAgotado
              ? 'El ramo se guardó como AGOTADO. En la tienda web mostrará la insignia de Agotado, sin botón de compra y con aviso vía WhatsApp.'
              : 'El ramo ha sido agregado y ahora está disponible para compra directa en el catálogo del taller y la tienda web.'}
          </p>
        </div>

        {/* Vista previa 4:5 del producto creado */}
        <div className="relative aspect-[4/5] w-52 overflow-hidden rounded-2xl bg-surface-container shadow-md">
          {creado.image_url ? (
            <img
              src={creado.image_url}
              alt={creado.nombre}
              className={`h-full w-full object-cover ${esAgotado ? 'grayscale contrast-75' : ''}`}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-on-surface-variant">
              Sin foto
            </div>
          )}
          {esAgotado && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <span className="rounded-full bg-error px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-md">
                Agotado
              </span>
            </div>
          )}
          <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-black/60 px-2.5 py-1 text-[12px] font-bold text-white backdrop-blur-sm">
            {formatMxn(creado.precioUnitario)} MXN
          </span>
        </div>

        <div className="flex gap-3 w-full pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-xl bg-primary py-3 text-[13px] font-bold text-on-primary shadow-sm hover:opacity-95"
          >
            Agregar Otro Ramo
          </button>
          <button
            type="button"
            onClick={() => {
              handleReset()
              setTabActual('administrar')
            }}
            className="flex-1 rounded-xl bg-surface-container py-3 text-[13px] font-bold text-on-surface hover:bg-surface-variant"
          >
            Ver en Catálogo
          </button>
        </div>
      </div>
    )
  }

  // Filtrado de ramos para la pestaña de administración
  const ramosFiltradosAdmin = catalogo.filter((p) => {
    const esAgotado = p.estado === 'agotado' || p.stock === 0
    if (filtroAdmin === 'disponibles' && esAgotado) return false
    if (filtroAdmin === 'agotados' && !esAgotado) return false
    if (busquedaAdmin.trim()) {
      const q = busquedaAdmin.toLowerCase()
      return p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q)
    }
    return true
  })

  const totalAgotados = catalogo.filter((p) => p.estado === 'agotado' || p.stock === 0).length
  const totalDisponibles = catalogo.length - totalAgotados

  return (
    <div className="flex flex-col gap-5 pb-8">
      {/* Selector de Pestaña: Alta de Nuevo Ramo vs Administrar Ramos & Agotados */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/40 pb-3">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">
            Catálogo & Ramos del Atelier
          </h3>
          <p className="text-[12px] text-on-surface-variant">
            Administra existencias, añade nuevos diseños o marca ramos agotados en tienda y taller.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl bg-surface-container-high p-1">
            <button
              type="button"
              onClick={() => setTabActual('alta')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-all ${
                tabActual === 'alta'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="add_circle" className="text-[16px]" />
              <span>Agregar Nuevo Ramo</span>
            </button>

            <button
              type="button"
              onClick={() => setTabActual('administrar')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-bold transition-all ${
                tabActual === 'administrar'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name="inventory_2" className="text-[16px]" />
              <span>Gestionar Agotados ({totalAgotados})</span>
            </button>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl px-3 py-2 text-[12px] font-bold text-on-surface-variant hover:text-primary transition-colors"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* PESTAÑA 1: FORMULARIO ALTA DE NUEVO RAMO */}
      {tabActual === 'alta' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorGeneral && (
            <div className="rounded-xl bg-error-container p-3.5 text-[12px] text-on-error-container font-semibold">
              {errorGeneral}
            </div>
          )}

          {/* Grid Responsivo: 1 col (móvil), 2 col en lg: */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* COLUMNA FOTO 4:5 (lg:col-span-5) */}
            <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 lg:col-span-5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Fotografía del Ramo (Proporción 4:5)
              </label>

              <div className="relative aspect-[4/5] w-full max-w-sm mx-auto overflow-hidden rounded-2xl bg-surface-container ring-1 ring-surface-variant/80 flex items-center justify-center shadow-inner">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Vista previa"
                    className={`h-full w-full object-cover ${
                      estadoDisponibilidad === 'agotado' ? 'grayscale contrast-75' : ''
                    }`}
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-on-surface-variant">
                    <Icon name="photo_camera" className="text-[36px]" />
                    <span className="text-[11px] mt-1.5 font-bold">4:5 Vertical</span>
                    <span className="text-[10px] text-on-surface-variant/80 mt-0.5">
                      Las fotos se adaptan automáticamente a este formato vertical
                    </span>
                  </div>
                )}
                {estadoDisponibilidad === 'agotado' && imageUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <span className="rounded-full bg-error px-3 py-1 text-[11px] font-bold tracking-wider text-white uppercase shadow-md">
                      Agotado
                    </span>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white backdrop-blur-xs">
                    <Icon name="sync" className="animate-spin text-[28px]" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <p className="text-[11px] leading-relaxed text-on-surface-variant">
                  Formatos soportados: <strong>JPG, PNG o WebP</strong> (máx. 5 MB). Proporción <code>aspect-ratio: 4 / 5</code>.
                </p>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-secondary-container/40 px-4 py-2.5 text-[12px] font-bold text-primary hover:bg-secondary-container transition-all">
                  <Icon name="upload_file" className="text-[18px]" />
                  <span>{imageUrl ? 'Cambiar Fotografía' : 'Seleccionar Archivo de Foto'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                {errorSubida && (
                  <p className="text-[11px] font-bold text-error leading-tight mt-1">
                    {errorSubida}
                  </p>
                )}
              </div>
            </div>

            {/* COLUMNA CAMPOS DEL FORMULARIO (lg:col-span-7) */}
            <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-surface-variant/60 lg:col-span-7">
              {/* SELECTOR DE ESTADO / DISPONIBILIDAD (DISPONIBLE vs AGOTADO) */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
                <label className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                  Disponibilidad Inicial en Catálogo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEstadoDisponibilidad('activo')
                      if (stock <= 0) setStock(1)
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-[12px] font-bold transition-all ${
                      estadoDisponibilidad === 'activo'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="check_circle" className="text-[17px]" />
                    <span>Disponible en Tienda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEstadoDisponibilidad('agotado')
                      setStock(0)
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-xl p-2.5 text-[12px] font-bold transition-all ${
                      estadoDisponibilidad === 'agotado'
                        ? 'bg-error text-on-error shadow-sm ring-2 ring-error'
                        : 'bg-surface-container-lowest text-on-surface hover:bg-surface-variant/50'
                    }`}
                  >
                    <Icon name="do_not_disturb_on" className="text-[17px]" />
                    <span>Marcar como Agotado</span>
                  </button>
                </div>

                {estadoDisponibilidad === 'agotado' ? (
                  <p className="text-[11px] text-error font-medium leading-relaxed bg-error-container/30 rounded-lg p-2">
                    ⚠️ <strong>Ramo Agotado:</strong> Se publicará en la tienda web con etiqueta de Agotado. Desactiva la compra directa y muestra el botón para solicitar aviso vía WhatsApp.
                  </p>
                ) : (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-on-surface-variant font-semibold">Piezas disponibles en taller:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={stock}
                        onChange={(e) => setStock(Math.max(1, Number(e.target.value)))}
                        className="w-20 rounded-lg bg-surface-container-lowest px-2 py-1 text-center font-bold text-on-surface ring-1 ring-surface-variant outline-none"
                      />
                      <span className="text-on-surface-variant">pzas</span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">
                  Nombre del Ramo:
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Bouquet Eterno Borgoña Imperial"
                  className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-on-surface-variant">
                  Descripción o Especificaciones:
                </label>
                <textarea
                  rows={3}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. 12 rosas de satín artesanales • Envoltura multicapa marfil"
                  className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[12px] text-on-surface ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant">
                    Precio Unitario (MXN):
                  </label>
                  <div className="mt-1 flex items-center rounded-xl bg-surface-container-low px-3.5 py-2.5 ring-1 ring-surface-variant/70">
                    <span className="text-[12px] font-bold text-primary mr-1">$</span>
                    <input
                      type="number"
                      min={50}
                      required
                      value={precioUnitario}
                      onChange={(e) => setPrecioUnitario(Number(e.target.value))}
                      className="w-full bg-transparent text-[13px] font-bold text-on-surface outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant">
                    Cantidad de Rosas:
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={piezas}
                    onChange={(e) => setPiezas(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] font-bold text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant">
                    Ocasión / Temporada:
                  </label>
                  <select
                    value={ocasion}
                    onChange={(e) => setOcasion(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[12px] font-semibold text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  >
                    {OCASIONES.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant">
                    Colección:
                  </label>
                  <select
                    value={coleccion}
                    onChange={(e) => setColeccion(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[12px] font-semibold text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  >
                    {COLECCIONES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all"
              >
                <Icon name={submitting ? 'sync' : 'save'} className={`text-[19px] ${submitting ? 'animate-spin' : ''}`} />
                {submitting
                  ? 'Guardando en Taller...'
                  : estadoDisponibilidad === 'agotado'
                  ? 'Guardar Ramo como Agotado'
                  : 'Guardar Ramo en Catálogo'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* PESTAÑA 2: GESTIONAR RAMOS & AGOTADOS */}
      {tabActual === 'administrar' && (
        <div className="flex flex-col gap-4">
          {mensajeAdmin && (
            <div className="rounded-xl bg-tertiary-fixed/30 border border-tertiary/20 p-3 text-[12px] font-bold text-tertiary animate-fade-in flex items-center gap-2">
              <Icon name="info" className="text-[17px]" />
              <span>{mensajeAdmin}</span>
            </div>
          )}

          {/* Barra de Filtros y Búsqueda */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm ring-1 ring-surface-variant/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFiltroAdmin('todos')}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                  filtroAdmin === 'todos'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Todos ({catalogo.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroAdmin('disponibles')}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                  filtroAdmin === 'disponibles'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Disponibles ({totalDisponibles})
              </button>
              <button
                type="button"
                onClick={() => setFiltroAdmin('agotados')}
                className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                  filtroAdmin === 'agotados'
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Agotados ({totalAgotados})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Icon name="search" className="absolute left-3 top-2.5 text-[16px] text-on-surface-variant" />
              <input
                type="text"
                value={busquedaAdmin}
                onChange={(e) => setBusquedaAdmin(e.target.value)}
                placeholder="Buscar ramo..."
                className="w-full rounded-xl bg-surface-container-low pl-8 pr-3 py-1.5 text-[12px] text-on-surface ring-1 ring-surface-variant outline-none"
              />
            </div>
          </div>

          {/* Listado de Ramos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ramosFiltradosAdmin.length === 0 ? (
              <div className="col-span-full rounded-2xl bg-surface-container-low p-8 text-center text-[13px] text-on-surface-variant">
                No se encontraron ramos con los filtros seleccionados.
              </div>
            ) : (
              ramosFiltradosAdmin.map((ramo) => {
                const esAgotado = ramo.estado === 'agotado' || ramo.stock === 0
                return (
                  <article
                    key={ramo.id}
                    className="flex flex-col justify-between gap-3 rounded-2xl bg-surface-container-lowest p-3.5 shadow-sm ring-1 ring-surface-variant/60"
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail 4:5 */}
                      <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                        {ramo.image_url ? (
                          <img
                            src={ramo.image_url}
                            alt={ramo.nombre}
                            className={`h-full w-full object-cover ${esAgotado ? 'grayscale contrast-75' : ''}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-on-surface-variant">
                            Sin foto
                          </div>
                        )}
                        {esAgotado && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-bold text-white uppercase tracking-wider">
                            Agotado
                          </span>
                        )}
                      </div>

                      {/* Datos del ramo */}
                      <div className="flex flex-col justify-between min-w-0 flex-1">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-primary truncate">
                              {ramo.sku || 'DE-ART'}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                esAgotado
                                  ? 'bg-error-container text-on-error-container'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {esAgotado ? 'Agotado' : `${ramo.stock} en stock`}
                            </span>
                          </div>
                          <h4 className="font-headline text-[13px] font-bold text-on-surface truncate mt-0.5">
                            {ramo.nombre}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            {ramo.piezas} rosas • {ramo.ocasion}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="font-bold text-[12px] text-on-surface">
                            {formatMxn(ramo.precioUnitario)} MXN
                          </span>
                          {!esAgotado && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-on-surface-variant font-bold">Stock:</span>
                              <input
                                type="number"
                                min={0}
                                value={ramo.stock}
                                onChange={(e) => handleCambiarStockManual(ramo.id, Number(e.target.value))}
                                className="w-12 rounded bg-surface-container-low px-1 py-0.5 text-center text-[11px] font-bold text-on-surface ring-1 ring-surface-variant outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Alternancia de Estado */}
                    <div className="pt-2 border-t border-surface-variant/40 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-on-surface-variant">
                        Estado en tienda: <strong className={esAgotado ? 'text-error' : 'text-emerald-700'}>
                          {esAgotado ? 'Agotado (Aviso WhatsApp)' : 'Disponible (Compra activa)'}
                        </strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleAgotado(ramo.id, ramo.nombre)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all active:scale-95 ${
                          esAgotado
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                            : 'bg-error-container text-on-error-container hover:bg-error hover:text-white'
                        }`}
                      >
                        <Icon name={esAgotado ? 'check_circle' : 'do_not_disturb_on'} className="text-[14px]" />
                        <span>{esAgotado ? 'Marcar Disponible' : 'Marcar Agotado'}</span>
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
