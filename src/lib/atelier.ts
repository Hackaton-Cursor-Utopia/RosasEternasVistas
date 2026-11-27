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
  { id: 'Vino Tinto Real', nombre: 'Vino Tinto', hex: '#6b1d2f', swatch: 'bg-[#6b1d2f]' },
  { id: 'Rojo Carmín', nombre: 'Rojo Carmín', hex: '#c81d25', swatch: 'bg-[#c81d25]' },
  { id: 'Azul Rey', nombre: 'Azul Rey', hex: '#1d4ed8', swatch: 'bg-[#1d4ed8]' },
  { id: 'Rosa Pastel', nombre: 'Rosa Pastel', hex: '#f4a6b8', swatch: 'bg-[#f4a6b8]' },
  { id: 'Negro Satinado', nombre: 'Negro Satinado', hex: '#1f1f1f', swatch: 'bg-[#1f1f1f]' },
  { id: 'Morado', nombre: 'Morado Real', hex: '#6d28d9', swatch: 'bg-[#6d28d9]' },
  { id: 'Blanco Perla', nombre: 'Blanco Puro', hex: '#ffffff', swatch: 'bg-[#ffffff]' },
] as const

export const COLORES_MONO = [
  { id: 'Vino Tinto Real', nombre: 'Vino Tinto', hex: '#6b1d2f', swatch: 'bg-[#6b1d2f]' },
  { id: 'Rojo Carmín', nombre: 'Rojo Carmín', hex: '#c81d25', swatch: 'bg-[#c81d25]' },
  { id: 'Azul Rey', nombre: 'Azul Rey', hex: '#1d4ed8', swatch: 'bg-[#1d4ed8]' },
  { id: 'Rosa Pastel', nombre: 'Rosa Pastel', hex: '#f4a6b8', swatch: 'bg-[#f4a6b8]' },
  { id: 'Negro Satinado', nombre: 'Negro Satinado', hex: '#1f1f1f', swatch: 'bg-[#1f1f1f]' },
  { id: 'Morado', nombre: 'Morado Real', hex: '#6d28d9', swatch: 'bg-[#6d28d9]' },
  { id: 'Dorado Champán', nombre: 'Dorado Champán', hex: '#d4af37', swatch: 'bg-[#d4af37]' },
  { id: 'Blanco Perla', nombre: 'Blanco Puro', hex: '#ffffff', swatch: 'bg-[#ffffff]' },
] as const

export const PAPELES = [
  { id: 'marfil', nombre: 'Traslúcido Marfil', hex: '#f5efe6', borde: '#d4af37' },
  { id: 'negro', nombre: 'Negro Imperial', hex: '#18181b', borde: '#94a3b8' },
  { id: 'rosa', nombre: 'Rosa Blush', hex: '#fbcfe8', borde: '#f43f5e' },
  { id: 'morado', nombre: 'Morado Imperial', hex: '#581c87', borde: '#c084fc' },
  { id: 'dorado', nombre: 'Dorado Champán', hex: '#d4af37', borde: '#fef08a' },
] as const

export const PRECIO_PLIEGO_COMBINADO = 35

export const EXTRAS_LUJO = [
  { id: 'perlas', label: 'Corona de Perlas Artesanal', precio: 150, icon: 'flare', asset: '/assets/ramo/extra-perlas.png' },
  { id: 'mariposas', label: 'Mariposas Doradas 3D', precio: 90, icon: 'auto_awesome', asset: '/assets/ramo/extra-mariposas.png' },
  { id: 'led', label: 'Guía de Micro LED Cálida', precio: 120, icon: 'lightbulb', asset: '/assets/ramo/extra-led.png' },
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
