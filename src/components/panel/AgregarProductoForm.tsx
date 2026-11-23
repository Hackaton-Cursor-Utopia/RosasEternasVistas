import { useState, type ChangeEvent, type FormEvent } from 'react'
import { createProducto, uploadProductoImagen } from '../../api/products'
import { isApiError } from '../../api/client'
import { Icon } from '../ui/Icon'
import { COLECCIONES, OCASIONES } from '../../lib/atelier'
import { formatMxn } from '../../lib/format'
import type { Producto } from '../../types/models'

type AgregarProductoFormProps = {
  onSuccess?: (producto: Producto) => void
  onCancel?: () => void
}

export function AgregarProductoForm({ onSuccess, onCancel }: AgregarProductoFormProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioUnitario, setPrecioUnitario] = useState<number>(850)
  const [piezas, setPiezas] = useState<number>(12)
  const [ocasion, setOcasion] = useState<string>('san-valentin')
  const [coleccion, setColeccion] = useState<string>('clasicos')

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorSubida, setErrorSubida] = useState<string | null>(null)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [creado, setCreado] = useState<Producto | null>(null)

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

    try {
      const nuevo = await createProducto({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precioUnitario: Number(precioUnitario),
        piezas: Number(piezas),
        ocasion,
        image_url: imageUrl,
      })

      setCreado(nuevo)
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
    setImageUrl(null)
    setCreado(null)
    setErrorSubida(null)
    setErrorGeneral(null)
  }

  if (creado) {
    return (
      <div className="mx-auto max-w-lg flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-6 md:p-8 text-center shadow-sm ring-1 ring-surface-variant/60">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed/40 text-tertiary">
          <Icon name="check_circle" className="text-[36px]" />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-tertiary uppercase">¡Alta Exitosa!</span>
          <h3 className="font-headline text-2xl font-bold text-on-surface mt-0.5">{creado.nombre}</h3>
          <p className="text-[13px] text-on-surface-variant mt-1 leading-relaxed">
            El ramo ha sido agregado y ahora está disponible en el catálogo del taller en Cloudflare R2 y la tienda web.
          </p>
        </div>

        {/* Vista previa 4:5 del producto creado */}
        <div className="relative aspect-[4/5] w-52 overflow-hidden rounded-2xl bg-surface-container shadow-md">
          {creado.image_url ? (
            <img
              src={creado.image_url}
              alt={creado.nombre}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-on-surface-variant">
              Sin foto
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
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-xl bg-surface-container py-3 text-[13px] font-bold text-on-surface hover:bg-surface-variant"
            >
              Volver al Panel
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">Agregar Nuevo Ramo</h3>
          <p className="text-[12px] text-on-surface-variant">Alta al catálogo artesanal y sincronización en Cloudflare R2</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[12px] font-bold text-on-surface-variant hover:text-primary"
          >
            Cancelar
          </button>
        )}
      </div>

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
                className="h-full w-full object-cover"
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
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white backdrop-blur-xs">
                <Icon name="sync" className="animate-spin text-[28px]" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              Formatos soportados: <strong>JPG, PNG o WebP</strong> (máx. 5 MB). Redimensionado automático a 1200 px para evitar saltos de pantalla con <code>aspect-ratio: 4 / 5</code>.
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
            {submitting ? 'Guardando en Taller...' : 'Guardar Ramo en Catálogo'}
          </button>
        </div>
      </div>
    </form>
  )
}
