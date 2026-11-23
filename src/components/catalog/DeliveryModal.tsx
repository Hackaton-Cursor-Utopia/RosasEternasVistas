import type { MetodoEntrega, Producto } from '../../types/models'
import { Icon } from '../ui/Icon'

type DeliveryModalProps = {
  product: Producto
  choice: MetodoEntrega
  onChoice: (choice: MetodoEntrega) => void
  onClose: () => void
  onConfirm: () => void
}

export function DeliveryModal({ product, choice, onChoice, onClose, onConfirm }: DeliveryModalProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-inverse-surface/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex w-full max-w-lg flex-col gap-4 rounded-t-3xl sm:rounded-2xl bg-surface-container-lowest p-6 pb-10 sm:pb-6 shadow-2xl max-h-[90dvh] overflow-y-auto">
        <div className="mx-auto mb-1 h-1.5 w-12 rounded-full bg-surface-variant shrink-0" />
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wide text-primary uppercase">Confirmar Entrega</span>
            <h3 className="font-headline text-xl font-semibold text-on-surface">{product.nombre}</h3>
          </div>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-variant active:scale-95 transition-all"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <p className="text-[12px] font-semibold text-on-surface">¿Cómo deseas recibir tu ramo?</p>
          <button
            type="button"
            onClick={() => onChoice('envio')}
            className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all active:scale-[0.99] ${
              choice === 'envio'
                ? 'bg-secondary-container/30 ring-2 ring-primary shadow-xs'
                : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon name="local_shipping" className="text-[20px]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-on-surface">Envío a Domicilio en CDMX</p>
              <p className="text-[12px] text-on-surface-variant leading-snug">
                Entrega asegurada en caja protectora con chofer privado
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChoice('recoger')}
            className={`flex items-center gap-3 rounded-2xl p-3.5 text-left transition-all active:scale-[0.99] ${
              choice === 'recoger'
                ? 'bg-secondary-container/30 ring-2 ring-primary shadow-xs'
                : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
              <Icon name="storefront" className="text-[20px]" />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-on-surface">Pick-up en Atelier (Col. Roma Norte)</p>
              <p className="text-[12px] text-on-surface-variant leading-snug">Sin costo adicional, listo para entrega en mano</p>
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-bold text-on-primary shadow-md active:scale-[0.98] transition-all hover:bg-primary/95"
        >
          Continuar al Pago Seguro
          <Icon name="arrow_forward" className="text-[18px]" />
        </button>
      </div>
    </div>
  )
}
