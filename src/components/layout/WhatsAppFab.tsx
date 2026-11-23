import { waUrl } from '../../lib/whatsapp'
import { Icon } from '../ui/Icon'

export function WhatsAppFab() {
  return (
    <>
      <div className="pointer-events-none fixed right-4 bottom-36 md:bottom-24 md:right-8 z-40 hidden sm:flex items-center gap-1.5 rounded-xl bg-surface-container-lowest/95 px-3 py-1.5 shadow-[0_4px_16px_rgba(0,78,72,0.18)] backdrop-blur-md ring-1 ring-tertiary/10">
        <span className="h-2 w-2 rounded-full bg-tertiary" />
        <span className="text-[11px] font-semibold text-on-surface">¿Dudas con tu ramo? Escríbenos</span>
      </div>
      <a
        aria-label="Atención personalizada por WhatsApp"
        className="soft-pulse group fixed right-4 bottom-24 md:bottom-8 md:right-8 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-tertiary text-on-tertiary shadow-[0_8px_20px_-4px_rgba(0,78,72,0.35)] transition-transform hover:scale-105 active:scale-95"
        href={waUrl('Hola Dulce Eternidad, tengo una duda sobre un ramo.')}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon name="chat" className="text-[26px]" />
      </a>
    </>
  )
}
