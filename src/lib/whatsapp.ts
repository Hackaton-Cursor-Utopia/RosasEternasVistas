import { ATELIER } from './atelier'

export function waUrl(mensaje: string, telefono = ATELIER.whatsapp): string {
  const digits = telefono.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(mensaje)}`
}

export function abrirWhatsApp(mensaje: string, telefono?: string): void {
  window.open(waUrl(mensaje, telefono), '_blank', 'noopener,noreferrer')
}
