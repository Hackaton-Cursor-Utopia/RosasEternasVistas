import { Link } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProductCard } from '../components/catalog/ProductCard'
import { Icon } from '../components/ui/Icon'
import { useFavorites } from '../context/FavoritesContext'
import { useCheckout } from '../context/CheckoutContext'
import { useNavigate } from 'react-router-dom'
import { PRODUCTOS_MOCK } from '../mocks/products.mock'
import { waUrl } from '../lib/whatsapp'
import { formatMxn } from '../lib/format'
import type { MetodoEntrega, Producto } from '../types/models'
import { useState } from 'react'
import { DeliveryModal } from '../components/catalog/DeliveryModal'

export function FavoritosPage() {
  const navigate = useNavigate()
  const { favorites } = useFavorites()
  const { startCheckout } = useCheckout()
  const [deliveryById, setDeliveryById] = useState<Record<string, MetodoEntrega | null>>({})
  const [modalProduct, setModalProduct] = useState<Producto | null>(null)
  const [modalChoice, setModalChoice] = useState<MetodoEntrega>('envio')

  const ramosFavoritos = PRODUCTOS_MOCK.filter((p) => favorites.includes(p.id))

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

  // Mensaje para compartir lista por WhatsApp
  const mensajeCompartir = `🌸 *Mis Ramos Favoritos - Dulce Eternidad CDMX*
Mira los ramos eternos que guardé:

${ramosFavoritos
  .map(
    (r, i) => `${i + 1}. *${r.nombre}* (${formatMxn(r.precioUnitario)} MXN)`
  )
  .join('\n')}

✨ Confeccionados a mano en satín de lujo: ${window.location.origin}`

  return (
    <AppShell kicker="Mis favoritos">
      <div className="flex flex-col gap-6 md:gap-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary">
              Mis Favoritos
            </h2>
            <p className="mt-0.5 text-[12px] md:text-[13px] text-on-surface-variant">
              Guardados en este dispositivo sin necesidad de crear una cuenta.
            </p>
          </div>

          {ramosFavoritos.length > 0 && (
            <a
              href={waUrl(mensajeCompartir)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary-container/40 px-4 py-2 text-[12px] font-bold text-primary hover:bg-secondary-container transition-all"
            >
              <Icon name="share" className="text-[16px]" />
              Compartir mi lista por WhatsApp
            </a>
          )}
        </div>

        {/* Estado Vacío o Cuadrícula */}
        {ramosFavoritos.length === 0 ? (
          <div className="mx-auto max-w-md w-full rounded-2xl bg-surface-container-lowest p-8 text-center shadow-sm ring-1 ring-surface-variant/60">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container/30 text-primary">
              <Icon name="favorite_border" className="text-[32px]" />
            </div>
            <h3 className="font-headline mt-3 text-xl font-bold text-on-surface">
              Aún no tienes favoritos
            </h3>
            <p className="mt-2 text-[13px] text-on-surface-variant leading-relaxed">
              Toca el corazón en cualquier ramo para guardarlo aquí y revisarlo cuando quieras.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-[13px] font-bold text-on-primary shadow-sm hover:opacity-95"
            >
              Explorar el Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ramosFavoritos.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                delivery={deliveryById[product.id] ?? null}
                onDelivery={(choice) =>
                  setDeliveryById((current) => ({ ...current, [product.id]: choice }))
                }
                onBuy={() => onBuy(product)}
              />
            ))}
          </div>
        )}
      </div>

      {modalProduct ? (
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
      ) : null}
    </AppShell>
  )
}
