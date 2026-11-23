import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DeliveryModal } from '../components/catalog/DeliveryModal'
import { ProductCard } from '../components/catalog/ProductCard'
import { QuickViewModal } from '../components/catalog/QuickViewModal'
import { AppShell } from '../components/layout/AppShell'
import { Icon } from '../components/ui/Icon'
import { useCheckout } from '../context/CheckoutContext'
import { useCatalog } from '../hooks/useCatalog'
import { COLECCIONES, OCASIONES } from '../lib/atelier'
import type { MetodoEntrega, Producto } from '../types/models'

export function CatalogPage() {
  const navigate = useNavigate()
  const { startCheckout } = useCheckout()
  const {
    filtrados,
    loading,
    error,
    ocasion,
    setOcasion,
    coleccion,
    setColeccion,
    limpiarFiltros,
    recargar,
  } = useCatalog()

  const [deliveryById, setDeliveryById] = useState<Record<string, MetodoEntrega | null>>({})
  const [modalProduct, setModalProduct] = useState<Producto | null>(null)
  const [modalChoice, setModalChoice] = useState<MetodoEntrega>('envio')
  const [quickViewProduct, setQuickViewProduct] = useState<Producto | null>(null)

  const goCheckout = (product: Producto, entrega: MetodoEntrega) => {
    startCheckout(product, entrega)
    navigate('/checkout')
  }

  const onBuy = (product: Producto) => {
    const selected = deliveryById[product.id] ?? null
    if (selected) {
      goCheckout(product, selected)
      return
    }
    setModalChoice('envio')
    setModalProduct(product)
  }

  return (
    <AppShell kicker="Catálogo de Rosas">
      <div className="flex w-full flex-col gap-6 md:gap-8">
        {/* Franja Informativa Florería */}
        <div className="flex items-center justify-between rounded-2xl bg-secondary-container/30 px-4 py-2.5 shadow-xs">
          <div className="flex min-w-0 items-center gap-2">
            <Icon name="local_florist" className="shrink-0 text-[18px] text-primary" filled />
            <p className="truncate text-[11px] md:text-[12px] font-bold text-on-surface">
              Envíos en toda CDMX • Reserva con anticipación tus fechas especiales
            </p>
          </div>
          <span className="ml-2 shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] md:text-[11px] font-bold tracking-wide text-primary uppercase">
            Express 2 hrs
          </span>
        </div>

        {/* Hero Banner Taller Atelier 3D */}
        <Link
          to="/personalizar"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-primary to-secondary p-5 md:p-8 text-on-primary shadow-md active:scale-[0.99] hover:-translate-y-0.5 transition-all"
        >
          <div className="pointer-events-none absolute -right-6 -bottom-6 h-48 w-48 rounded-full bg-secondary-container/20 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0 max-w-xl">
              <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-container-lowest/20 px-2.5 py-1 backdrop-blur-md">
                <span className="h-2 w-2 animate-ping rounded-full bg-tertiary-fixed-dim" />
                <span className="text-[10px] md:text-[11px] font-bold tracking-wider text-on-primary uppercase">
                  Taller Atelier 3D CDMX
                </span>
              </div>
              <h2 className="font-headline text-2xl md:text-3xl leading-tight font-semibold">
                Diseña tu propio Ramo Eterno
              </h2>
              <p className="mt-1 text-[13px] md:text-[15px] text-on-primary-container">
                Pliegues coreanos, cinta satinada & perlas personalizadas a tu gusto.
              </p>
            </div>
            <div className="flex h-12 w-12 md:h-14 md:w-14 shrink-0 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-md">
              <Icon name="palette" className="text-[24px] md:text-[28px]" />
            </div>
          </div>
        </Link>

        {/* Filtros de Ocasión y Colección */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl md:text-2xl font-semibold text-primary">
              Colecciones Florales
            </h3>
            <span className="text-[11px] md:text-[12px] font-bold text-on-surface-variant">
              {filtrados.length} {filtrados.length === 1 ? 'ramo disponible' : 'ramos disponibles'}
            </span>
          </div>

          {/* Ocasiones: Píldoras con Icono */}
          <div className="no-scrollbar -mx-4 md:mx-0 flex items-center gap-1.5 overflow-x-auto md:overflow-visible md:flex-wrap px-4 md:px-0 pb-1">
            {OCASIONES.map((item) => {
              const active = ocasion === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOcasion(item.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-semibold transition-all ${
                    active
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-secondary-container/40'
                  }`}
                >
                  <Icon name={item.icon} className="text-[16px]" />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Colecciones: Píldoras limpias sin números confusos */}
          <div className="no-scrollbar -mx-4 md:mx-0 flex items-center gap-2 overflow-x-auto md:overflow-visible md:flex-wrap px-4 md:px-0 pb-1">
            <button
              type="button"
              onClick={() => setColeccion('todas')}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                coleccion === 'todas'
                  ? 'bg-surface-container-high text-primary ring-2 ring-primary shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${coleccion === 'todas' ? 'bg-primary' : 'bg-surface-variant'}`} />
              Todas las ediciones
            </button>

            {COLECCIONES.map((item) => {
              const active = coleccion === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setColeccion(item.id)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11px] font-bold transition-all ${
                    active
                      ? 'bg-surface-container-high text-primary ring-2 ring-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-primary' : 'bg-surface-variant'}`} />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Estado de Carga con Skeletons Shimmer */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest animate-pulse ring-1 ring-surface-variant/40 shadow-xs"
              >
                <div className="aspect-[4/5] w-full bg-surface-container-high" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-surface-container-high rounded-md w-3/4" />
                  <div className="h-4 bg-surface-container rounded-md w-full" />
                  <div className="h-11 bg-surface-container rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error de Conexión */}
        {error && (
          <div className="rounded-2xl bg-error-container p-6 text-on-error-container text-center">
            <p className="font-bold text-base">No pudimos mostrar el catálogo</p>
            <p className="mt-1 text-sm">{error}</p>
            <button
              type="button"
              onClick={() => void recargar()}
              className="mt-4 min-h-11 rounded-xl bg-primary px-6 text-[13px] font-bold text-on-primary shadow-sm hover:opacity-95"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado Vacío Amigable si los filtros no arrojan resultados */}
        {!loading && !error && filtrados.length === 0 && (
          <div className="mx-auto max-w-md w-full rounded-3xl bg-surface-container-lowest p-8 text-center shadow-xs ring-1 ring-surface-variant/60 my-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
              <Icon name="filter_alt_off" className="text-[28px]" />
            </div>
            <h4 className="font-headline text-xl font-bold text-on-surface mt-3">
              No hay ramos con esos filtros
            </h4>
            <p className="mt-1 text-[13px] text-on-surface-variant leading-relaxed">
              Prueba cambiando la ocasión o la edición para ver otros arreglos artesanales disponibles.
            </p>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-[13px] font-bold text-on-primary shadow-sm hover:opacity-95 transition-all"
            >
              <Icon name="refresh" className="text-[16px]" />
              Quitar filtros
            </button>
          </div>
        )}

        {/* Cuadrícula de Ramos: 1 col (móvil), 2 col (md), 3 col (lg) */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtrados.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                eager={index === 0}
                delivery={deliveryById[product.id] ?? null}
                onDelivery={(choice) =>
                  setDeliveryById((current) => ({ ...current, [product.id]: choice }))
                }
                onBuy={() => onBuy(product)}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

        {/* Banner Informativo Inferior */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface-container-low p-5 shadow-xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container/40 text-primary">
            <Icon name="all_inclusive" className="text-[26px]" />
          </div>
          <div>
            <p className="font-headline text-xl leading-none text-primary">Rosas que no marchitan jamás</p>
            <p className="mt-1 text-[13px] md:text-[14px] text-on-surface-variant leading-relaxed">
              Confeccionadas pétalo a pétalo en nuestro taller de la Ciudad de México. Duración superior a 3 años protegidas del sol directo y humedad.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Selección de Entrega */}
      {modalProduct && (
        <DeliveryModal
          product={modalProduct}
          choice={modalChoice}
          onChoice={setModalChoice}
          onClose={() => setModalProduct(null)}
          onConfirm={() => {
            goCheckout(modalProduct, modalChoice)
            setModalProduct(null)
          }}
        />
      )}

      {/* Modal de Vista Rápida */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          delivery={deliveryById[quickViewProduct.id] ?? null}
          onDelivery={(choice) =>
            setDeliveryById((current) => ({ ...current, [quickViewProduct.id]: choice }))
          }
          onClose={() => setQuickViewProduct(null)}
          onBuy={(prod, del) => goCheckout(prod, del)}
        />
      )}
    </AppShell>
  )
}
