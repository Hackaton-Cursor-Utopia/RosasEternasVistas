import { WHATSAPP_NUMBER } from './env'
import type { Sucursal } from '../types/models'

export const ATELIER = {
  nombre: 'Dulce Eternidad',
  razonSocial: 'Dulce Eternidad Atelier S.A.S.',
  banco: 'BBVA México',
  clabe: '012180015493291082',
  whatsapp: WHATSAPP_NUMBER,
  logoUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBfa-yedaMixzDTETod5d_lG26ba3dK0Kjnaf55L0i0WSF6B6SmHPJ4fzc45oLit5wMvzG6OgYj76rt9EqvI4-ZFHTP3JXWxUHzQDzD4uyuVK48OhZEnTOHVuodjfJHZZEdkPeF7lD8Gi_luhtS6h3o48xLv7aGbp-FFDLO6ASoEq50ZVVa7Dng_e105jBw7ZlGLsJoH6rBla_ZjoK8tARJMQ6bO3wQzWBQMfomhDg',
}

export const SUCURSALES: Sucursal[] = [
  {
    id: 'coyoacan',
    nombre: 'Atelier Coyoacán (Matriz)',
    direccion: 'Av. Francisco Sosa #124',
    horario: '11:00 AM - 7:00 PM',
  },
  {
    id: 'condesa',
    nombre: 'Punto de Entrega Condesa',
    direccion: 'Calle Amsterdam #88',
    horario: '12:00 PM - 7:00 PM',
  },
]

export const OCASIONES = [
  { id: 'todas', label: 'Todas', icon: 'arrow_back_ios_new' },
  { id: 'san-valentin', label: 'San Valentín', icon: 'favorite' },
  { id: 'navidad', label: 'Navidad', icon: 'forest' },
  { id: 'aniversarios', label: 'Aniversarios', icon: 'celebration' },
  { id: 'cumpleanos', label: 'Cumpleaños', icon: 'cake' },
] as const

export const COLECCIONES = [
  { id: 'clasicos', label: 'Clásicos Eternos' },
  { id: 'gigantes', label: 'Ramos Gigantes' },
  { id: 'cajas', label: 'Cajas Acrílicas' },
  { id: 'coreanos', label: 'Toques Coreanos' },
] as const

export const LISTONES = [
  { id: 'Vino Tinto Real', swatch: 'bg-primary-container' },
  { id: 'Rosa Pastel', swatch: 'bg-secondary-blush' },
  { id: 'Rojo Carmín', swatch: 'bg-error' },
  { id: 'Negro Satinado', swatch: 'bg-inverse-surface' },
] as const

export const PAPELES = [
  'Traslúcido con Borde Dorado',
  'Marfil Mate Texturizado',
  'Negro Imperial con Filo Plata',
] as const

export const RAMOS_EXPRESS = [
  { rosas: 6 as const, precioUnitario: 450, montoAnticipo: 225 },
  { rosas: 12 as const, precioUnitario: 850, montoAnticipo: 425 },
  { rosas: 24 as const, precioUnitario: 1480, montoAnticipo: 740 },
  { rosas: 50 as const, precioUnitario: 2750, montoAnticipo: 1375 },
]

export const ENVIO_CDMX = {
  precio: 120,
  anticipo: 60,
}
