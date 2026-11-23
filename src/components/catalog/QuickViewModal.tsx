import { useEffect } from 'react'
import { Icon } from '../ui/Icon'
import { formatMxn } from '../../lib/format'
import { useFavorites } from '../../context/FavoritesContext'
import { waUrl } from '../../lib/whatsapp'
import type { MetodoEntrega, Producto } from '../../types/models'

type QuickViewModalProps = {
  product: Producto
  delivery: MetodoEntrega | null
  onDelivery: (choice: MetodoEntrega | null) => void
  onClose: () => void
  onBuy: (product: Producto, delivery: MetodoEntrega) => void
}

export function QuickViewModal({
  product,
  delivery,
  onDelivery,
  onClose,
  onBuy,
}: QuickViewModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(product.id)
  const isAgotado = product.stock === 0 || product.estado === 'agotado'
  const isPocasPiezas = !isAgotado && product.stock <= 3 && product.stock > 0

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleComprar = () => {
    onBuy(product, delivery ?? 'envio')
    onClose()
  }

  const handleWhatsAppAvisar = () => {
    const mensaje = `Hola Dulce Eternidad, me interesa el ramo *${product.nombre}* que vi agotado en la tienda. ¿Podrían avisarme si lo tendrán disponible pronto?`
    window.open(waUrl(mensaje), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-inverse-surface/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative flex w-full max-w-2xl max-h-[90dvh] flex-col overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-surface-container-lowest p-5 pb-10 sm:p-6 shadow-2xl ring-1 ring-surface-variant/80">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista rápida"
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-surface-variant transition-all"
        >
          <Icon name="close" className="text-[20px]" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          {/* Foto 4:5 */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-surface-container shadow-inner">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.nombre}
                className={`h-full w-full object-cover ${isAgotado ? 'grayscale contrast-75' : ''}`}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-on-surface-variant">
                Sin foto
              </div>
            )}

            {/* Corazón */}
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest/90 text-primary shadow-sm backdrop-blur-md active:scale-75 transition-all"
            >
              <Icon name={fav ? 'favorite' : 'favorite_border'} className="text-[20px]" filled={fav} />
            </button>
          </div>

          {/* Información y Compra */}
          <div className="flex flex-col gap-3 justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary">
                <Icon name="handyman" className="text-[14px]" />
                Hecho a mano en CDMX
              </span>
              <h3 className="font-headline text-2xl font-bold text-on-surface mt-1 leading-tight">
                {product.nombre}
              </h3>
              <p className="mt-2 text-[13px] text-on-surface-variant leading-relaxed">
                {product.descripcion}
              </p>
            </div>

            <div className="space-y-1.5 py-2 border-y border-surface-variant/50 text-[12px]">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Composición floral:</span>
                <span className="font-bold text-on-surface">{product.piezas} Rosas Eternas de Satín</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Durabilidad:</span>
                <span className="font-bold text-tertiary">Más de 3 años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Disponibilidad:</span>
                <span className="font-bold text-on-surface">
                  {isAgotado ? (
                    <span className="text-error">Agotado</span>
                  ) : isPocasPiezas ? (
                    <span className="text-error">Últimas {product.stock} piezas</span>
                  ) : (
                    'En stock (Atelier CDMX)'
                  )}
                </span>
              </div>
            </div>

            {/* Precio */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase">Precio Final</span>
                <p className="font-headline text-2xl font-bold text-primary">
                  {formatMxn(product.precioUnitario)} <span className="text-[12px] font-normal text-on-surface-variant">MXN</span>
                </p>
              </div>
            </div>

            {/* Selector de entrega */}
            {!isAgotado && (
              <div className="flex items-center rounded-xl bg-surface-container-low p-1">
                <button
                  type="button"
                  onClick={() => onDelivery(delivery === 'envio' ? null : 'envio')}
                  className={`flex-1 rounded-lg py-2 text-center text-[11px] font-bold transition-all ${
                    delivery === 'envio'
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name="local_shipping" className="mr-1 align-middle text-[14px]" />
                  A domicilio
                </button>
                <button
                  type="button"
                  onClick={() => onDelivery(delivery === 'recoger' ? null : 'recoger')}
                  className={`flex-1 rounded-lg py-2 text-center text-[11px] font-bold transition-all ${
                    delivery === 'recoger'
                      ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Icon name="storefront" className="mr-1 align-middle text-[14px]" />
                  En taller
                </button>
              </div>
            )}

            {/* Botón de acción */}
            {isAgotado ? (
              <button
                type="button"
                onClick={handleWhatsAppAvisar}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-container-high px-4 py-3 text-[14px] font-bold text-on-surface hover:bg-surface-variant transition-all"
              >
                <Icon name="chat" className="text-[18px] text-tertiary" />
                Avísame por WhatsApp
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComprar}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <Icon name="shopping_bag" className="text-[18px]" />
                Comprar Ahora
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
