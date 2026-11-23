/**
 * Contrato Dulce Eternidad.
 * Montos (`precioUnitario`, `montoAnticipo`, `total`, `montoCobrado`,
 * `saldoPendiente`, `montoATransferir`) los calcula el servidor.
 * `image_url` es la URL pública de R2 (`products/<UUID>.webp`).
 */

export type TipoCatalogo = 'producto' | 'arreglo'
export type EstadoCatalogo = 'activo' | 'inactivo' | 'agotado'
export type MetodoEntrega = 'envio' | 'recoger'
export type ModalidadPago = 'completo' | 'anticipo'
export type EstadoPedido = 'taller' | 'envio' | 'liquidar' | 'entregado' | 'cancelado'

export interface ListaRespuesta<T> {
  datos: T[]
  total: number
}

export interface Producto {
  id: string
  sku: string
  nombre: string
  descripcion: string
  tipo: TipoCatalogo
  categoria: string
  ocasion: string
  coleccion: string
  color?: string
  piezas: number
  stock: number
  badge?: string
  image_url: string | null
  estado: EstadoCatalogo
  precioUnitario: number
  montoAnticipo: number
  tasaIva: number
  ivaIncluido: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface Arreglo extends Producto {
  tipo: 'arreglo'
}

export interface Sucursal {
  id: string
  nombre: string
  direccion: string
  horario: string
}

export interface CotizacionPago {
  referencia: string
  precioProducto: number
  envio: number
  total: number
  montoAnticipo: number
  montoCompleto: number
  montoATransferir: number
  modalidad: ModalidadPago
}

export interface CheckoutDraft {
  productId: string
  entrega: MetodoEntrega
  sucursalId?: string
  direccion?: string
  modalidad: ModalidadPago
}

export interface PedidoOperativo {
  id: string
  folio: string
  clienteNombre: string
  clienteTelefono: string
  descripcion: string
  entregaEtiqueta: string
  hora: string
  estados: EstadoPedido[]
  badge: string
  badgeTone: 'taller' | 'listo' | 'pendiente'
  total: number
  montoCobrado: number
  saldoPendiente: number
  nota: string
}

export interface DashboardMetricas {
  ventasMes: number
  ventasMesDelta: string
  ramosTaller: number
  porCobrar: number
  anticiposAbiertos: number
  enviosHoy: number
  demanda: Array<{ etiqueta: string; porcentaje: number; pedidos: number; color: string }>
  mesasActivas: number
  mesasTotales: number
}

export interface ConfeccionExpressInput {
  rosas: 6 | 12 | 24 | 50
  liston: string
  papel: string
  clienteNombre: string
  clienteTelefono: string
  fechaEntrega: string
  entrega: MetodoEntrega
  modalidad: ModalidadPago
}

export interface TarjetaCobro {
  titulo: string
  liston: string
  papel: string
  fechaEntrega: string
  servicioEnvio: string
  precioRamo: number
  total: number
  montoATransferir: number
  referencia: string
}

export interface CrearProductoRequest {
  nombre: string
  descripcion?: string
  precioUnitario: number
  piezas: number
  ocasion: string
  image_url: string | null
}

export interface UploadImageResponse {
  url: string
}

export interface ErrorRespuesta {
  error?: string
  mensaje?: string
}
