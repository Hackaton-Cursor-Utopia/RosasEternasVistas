import { formatMxn } from '../../lib/format'
import type { MetodoEntrega, Producto } from '../../types/models'
import { Icon } from '../ui/Icon'
import { useFavorites } from '../../context/FavoritesContext'
import { waUrl } from '../../lib/whatsapp'

type ProductCardProps = {
  product: Producto
  eager?: boolean
  delivery: MetodoEntrega | null
  onDelivery: (choice: MetodoEntrega | null) => void
  onBuy: () => void
  onQuickView?: (product: Producto) => void
}

function badgeClass(badge?: string): string {
  if (badge === 'Edición Especial') return 'bg-secondary text-on-secondary'
  if (badge === 'Temporada Navideña') return 'bg-tertiary-container text-on-tertiary'
  if (badge === 'Detalle Express') return 'bg-secondary-container text-on-secondary-container'
  return 'bg-primary/90 text-on-primary'
}

export function ProductCard({
  product,
  eager = false,
  delivery,
  onDelivery,
  onBuy,
  onQuickView,
}: ProductCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(product.id)
  const isAgotado = product.stock === 0 || product.estado === 'agotado'
  const isPocasPiezas = !isAgotado && product.stock <= 3 && product.stock > 0

  const toggle = (choice: MetodoEntrega) => {
    onDelivery(delivery === choice ? null : choice)
  }

  const handleWhatsAppAvisar = () => {
    const mensaje = `Hola Dulce Eternidad, me interesa el ramo *${product.nombre}* que vi agotado en la tienda. ¿Podrían avisarme si lo tendrán disponible pronto?`
    window.open(waUrl(mensaje), '_blank', 'noopener,noreferrer')
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_8px_24px_-4px_rgba(154,59,90,0.06)] ring-1 ring-surface-variant/40 group transition-shadow hover:shadow-md">
      {/* Contenedor Foto 4:5 */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.nombre}
            onClick={() => onQuickView && onQuickView(product)}
            className={`h-full w-full object-cover transition-transform duration-500 ease-out cursor-pointer group-hover:scale-[1.03] ${
              isAgotado ? 'grayscale contrast-75 opacity-85' : ''
            }`}
            loading={eager ? 'eager' : 'lazy'}
          />
        ) : (
          <div
            onClick={() => onQuickView && onQuickView(product)}
            className="flex h-full items-center justify-center text-on-surface-variant cursor-pointer"
          >
            Sin foto
          </div>
        )}

        {/* Cinta Agotado si aplica */}
        {isAgotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <span className="rounded-full bg-error px-4 py-1.5 text-[11px] font-bold tracking-widest text-on-error uppercase shadow-lg">
              Agotado
            </span>
          </div>
        )}

        {/* Insignias superiores izquierdas */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1 pointer-events-none">
          {product.badge ? (
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm backdrop-blur-md ${badgeClass(product.badge)}`}
            >
              <Icon name="star" className="text-[12px]" filled />
              {product.badge}
            </span>
          ) : null}
          <span className="flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-0.5 text-[10px] font-bold text-tertiary backdrop-blur-md shadow-xs">
            <Icon name="handyman" className="text-[13px]" />
            Hecho a mano en CDMX
          </span>
        </div>

        {/* Botón Favoritos Corazón */}
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          aria-label={fav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 text-primary shadow-sm backdrop-blur-md active:scale-75 transition-all hover:bg-white"
        >
          <Icon name={fav ? 'favorite' : 'favorite_border'} className="text-[20px]" filled={fav} />
        </button>
      </div>

      {/* Datos del Ramo */}
      <div className="flex flex-col gap-2.5 p-4 md:p-5 flex-1 justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4
                onClick={() => onQuickView && onQuickView(product)}
                className="font-headline text-xl font-semibold text-on-surface line-clamp-2 cursor-pointer hover:text-primary transition-colors"
              >
                {product.nombre}
              </h4>
              <p className="mt-1 text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="font-headline text-xl md:text-2xl font-bold text-primary">
                {formatMxn(product.precioUnitario)}
              </span>
              <span className="block text-[10px] font-bold text-on-surface-variant uppercase">
                MXN
              </span>
              {isPocasPiezas && (
                <span className="mt-1 inline-block rounded-md bg-error-container px-1.5 py-0.5 text-[9px] font-bold text-on-error-container">
                  Últimas {product.stock} piezas
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {/* Selector de Entrega (Atajo opcional) */}
          {!isAgotado && (
            <div className="flex items-center rounded-xl bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => toggle('envio')}
                className={`flex-1 rounded-lg py-2 text-center text-[10px] md:text-[11px] font-bold transition-all ${
                  delivery === 'envio'
                    ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name="local_shipping" className="mr-0.5 align-middle text-[14px]" />
                Enviar a domicilio
              </button>
              <button
                type="button"
                onClick={() => toggle('recoger')}
                className={`flex-1 rounded-lg py-2 text-center text-[10px] md:text-[11px] font-bold transition-all ${
                  delivery === 'recoger'
                    ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name="storefront" className="mr-0.5 align-middle text-[14px]" />
                Recoger en taller
              </button>
            </div>
          )}

          {/* Botón de Compra o Avísame por WhatsApp */}
          {isAgotado ? (
            <button
              type="button"
              onClick={handleWhatsAppAvisar}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-2.5 text-[13px] font-bold text-on-surface shadow-sm hover:bg-surface-variant active:scale-[0.98] transition-all"
            >
              <Icon name="chat" className="text-[17px] text-tertiary" />
              Avísame por WhatsApp
            </button>
          ) : (
            <button
              type="button"
              onClick={onBuy}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[14px] font-bold text-on-primary shadow-sm hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Icon name="shopping_bag" className="text-[18px]" />
              Comprar Ahora • {formatMxn(product.precioUnitario)} MXN
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
