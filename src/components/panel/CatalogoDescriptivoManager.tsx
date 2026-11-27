import { useEffect, useState } from 'react'
import { Icon } from '../ui/Icon'
import { formatMxn } from '../../lib/format'
import {
  fetchCatalogos,
  crearItemCatalogo,
  actualizarItemCatalogo,
  desactivarItemCatalogo,
  type CatalogosAgrupados,
  type ItemCatalogo,
} from '../../api/catalogos'

type CategoriaClave = 'ColoresRosas' | 'Papeles' | 'Listones' | 'Extras'

const TABS: Array<{ id: CategoriaClave; label: string; icon: string; desc: string }> = [
  {
    id: 'ColoresRosas',
    label: 'Colores de Rosas',
    icon: 'palette',
    desc: 'Colores eternos disponibles para confeccionar ramos (sólidos o combinados).',
  },
  {
    id: 'Papeles',
    label: 'Papeles Coreanos',
    icon: 'layers',
    desc: 'Papeles coreanos impermeables y texturas para la envoltura de alta gama.',
  },
  {
    id: 'Listones',
    label: 'Listones y Moños',
    icon: 'styler',
    desc: 'Cintas y listones satinados para el atado artesanal de los ramos.',
  },
  {
    id: 'Extras',
    label: 'Accesorios Extras',
    icon: 'auto_awesome',
    desc: 'Aditamentos de lujo añadidos al pedido (perlas, mariposas 3D, micro LEDs).',
  },
]

export function CatalogoDescriptivoManager() {
  const [tabActual, setTabActual] = useState<CategoriaClave>('ColoresRosas')
  const [catalogos, setCatalogos] = useState<CatalogosAgrupados>({})
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  // Formulario para nuevo elemento
  const [nombre, setNombre] = useState('')
  const [colorHex, setColorHex] = useState('#c81d25')
  const [precioExtra, setPrecioExtra] = useState<number>(0)
  const [icono, setIcono] = useState('auto_awesome')
  const [guardando, setGuardando] = useState(false)

  const recargar = async () => {
    setCargando(true)
    try {
      const datos = await fetchCatalogos()
      setCatalogos(datos)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    recargar()
    const handleUpdate = () => recargar()
    window.addEventListener('catalogos-updated', handleUpdate)
    return () => window.removeEventListener('catalogos-updated', handleUpdate)
  }, [])

  const itemsActuales: ItemCatalogo[] = catalogos[tabActual] || []

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setGuardando(true)
    const nuevo = await crearItemCatalogo(tabActual, {
      nombre: nombre.trim(),
      valorhex: tabActual !== 'Extras' ? colorHex : undefined,
      precioextra: precioExtra,
      icono: tabActual === 'Extras' ? icono : undefined,
    })

    if (nuevo) {
      setNombre('')
      setPrecioExtra(0)
      setMensaje(`¡"${nuevo.nombre}" agregado con éxito al catálogo!`)
      setTimeout(() => setMensaje(null), 3500)
      recargar()
    }
    setGuardando(false)
  }

  const handleToggleActivo = async (item: ItemCatalogo) => {
    const res = await actualizarItemCatalogo(item.id, { activo: !item.activo })
    if (res) {
      setMensaje(`"${item.nombre}" ${res.activo ? 'activado' : 'pausado'} para clientes.`)
      setTimeout(() => setMensaje(null), 3000)
      recargar()
    }
  }

  const tabInfo = TABS.find((t) => t.id === tabActual) ?? TABS[0]

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Selector de pestañas de catálogos */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-container-high p-1.5 shadow-inner">
        {TABS.map((tab) => {
          const activo = tabActual === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setTabActual(tab.id)
                setNombre('')
                setPrecioExtra(0)
              }}
              className={`flex flex-1 min-w-[130px] items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-[13px] font-bold transition-all ${
                activo
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={tab.icon} className="text-[17px]" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Banner descriptivo */}
      <div className="rounded-2xl border border-primary/20 bg-secondary-container/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-xs">
            <Icon name={tabInfo.icon} className="text-[22px]" />
          </span>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">{tabInfo.label}</h3>
            <p className="text-[12px] text-on-surface-variant">{tabInfo.desc}</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[11px] font-bold text-primary">
          {itemsActuales.length} elementos
        </span>
      </div>

      {/* Feedback toast */}
      {mensaje && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-[13px] font-bold text-emerald-800 animate-fade-in">
          {mensaje}
        </div>
      )}

      {/* Grid: Formulario de Alta a la izquierda, Lista a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario para agregar nuevo elemento */}
        <div className="lg:col-span-5 rounded-3xl bg-surface-container-lowest p-5 md:p-6 shadow-sm ring-1 ring-surface-variant/70 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-surface-variant/40 pb-3">
            <Icon name="add_circle" className="text-primary text-[20px]" />
            <h4 className="font-headline text-[15px] font-bold text-on-surface">
              Agregar a {tabInfo.label}
            </h4>
          </div>

          <form onSubmit={handleCrear} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                Nombre del Elemento:
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={
                  tabActual === 'ColoresRosas'
                    ? 'Ej. Lila Francés, Amarillo Radiante'
                    : tabActual === 'Papeles'
                      ? 'Ej. Kraft Premium, Traslúcido Rosa'
                      : tabActual === 'Extras'
                        ? 'Ej. Corona Diamante, Chocolates Ferrero'
                        : 'Ej. Listón Champagne, Moño Negro'
                }
                className="w-full rounded-xl bg-surface-container-low px-3.5 py-2.5 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Muestra de Color (para Rosas, Papeles y Listones) */}
            {tabActual !== 'Extras' && (
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Color / Muestra Hexadecimal:
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#c81d25"
                    className="flex-1 rounded-xl bg-surface-container-low px-3 py-2 text-[13px] font-mono text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                  <span
                    className="h-9 w-9 rounded-xl border border-white/40 shadow-xs"
                    style={{ backgroundColor: colorHex }}
                  />
                </div>
              </div>
            )}

            {/* Ícono de Material (para Extras) */}
            {tabActual === 'Extras' && (
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Ícono Material Symbols:
                </label>
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary-container/30 text-primary">
                    <Icon name={icono} className="text-[20px]" />
                  </span>
                  <input
                    type="text"
                    value={icono}
                    onChange={(e) => setIcono(e.target.value)}
                    placeholder="flare, favorite, cake, celebration"
                    className="flex-1 rounded-xl bg-surface-container-low px-3.5 py-2 text-[13px] text-on-surface ring-1 ring-surface-variant/70 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Precio Adicional (para Extras y Papeles) */}
            {(tabActual === 'Extras' || tabActual === 'Papeles') && (
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                  Precio Extra / Costo Adicional ($ MXN):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[13px] text-on-surface-variant font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={precioExtra}
                    onChange={(e) => setPrecioExtra(Number(e.target.value))}
                    className="w-full rounded-xl bg-surface-container-low pl-7 pr-3.5 py-2.5 text-[13px] font-bold text-on-surface ring-1 ring-surface-variant/70 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={guardando || !nombre.trim()}
              className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-bold text-on-primary shadow-sm hover:bg-primary/95 transition-all disabled:opacity-60"
            >
              {guardando ? (
                <span>Guardando en BD...</span>
              ) : (
                <>
                  <Icon name="save" className="text-[18px]" />
                  <span>Guardar en Base de Datos</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de elementos existentes */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider">
              Elementos Activos en Base de Datos
            </h4>
            <button
              type="button"
              onClick={recargar}
              className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <Icon name="refresh" className="text-[14px]" />
              <span>Actualizar</span>
            </button>
          </div>

          {itemsActuales.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface-variant/80 bg-surface-container-lowest p-8 text-center text-on-surface-variant">
              <Icon name="inventory_2" className="text-[32px] mx-auto text-on-surface-variant/60 mb-2" />
              <p className="text-[13px] font-bold text-on-surface">No hay elementos registrados aún.</p>
              <p className="text-[11px] mt-1">Usa el formulario para dar de alta el primero en esta categoría.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {itemsActuales.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-all ring-1 ${
                    item.activo
                      ? 'bg-surface-container-lowest ring-surface-variant/70 shadow-xs'
                      : 'bg-surface-container-low opacity-60 ring-surface-variant/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.valorhex ? (
                      <span
                        className="h-8 w-8 shrink-0 rounded-xl border border-white/50 shadow-xs"
                        style={{ backgroundColor: item.valorhex }}
                      />
                    ) : item.icono ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary-container/40 text-primary">
                        <Icon name={item.icono} className="text-[17px]" />
                      </span>
                    ) : (
                      <span className="h-8 w-8 shrink-0 rounded-xl bg-surface-variant" />
                    )}

                    <div className="min-w-0 truncate">
                      <p className="text-[13px] font-bold text-on-surface truncate">{item.nombre}</p>
                      <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
                        {item.valorhex && <span className="font-mono">{item.valorhex}</span>}
                        {item.precioextra > 0 && (
                          <span className="font-bold text-primary">+{formatMxn(item.precioextra)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleActivo(item)}
                    className={`flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-bold transition-all ${
                      item.activo
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <Icon name={item.activo ? 'check' : 'pause'} className="text-[14px]" />
                    <span>{item.activo ? 'Activo' : 'Pausado'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
