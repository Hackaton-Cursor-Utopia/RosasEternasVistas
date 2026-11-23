import type {
  ConfeccionExpressInput,
  CotizacionPago,
  DashboardMetricas,
  PedidoOperativo,
  TarjetaCobro,
} from '../types/models'

export const METRICAS_MOCK: DashboardMetricas = {
  ventasMes: 38450,
  ventasMesDelta: 'MXN • +18% vs ene',
  ramosTaller: 14,
  porCobrar: 6200,
  anticiposAbiertos: 7,
  enviosHoy: 6,
  demanda: [
    { etiqueta: 'San Valentín', porcentaje: 65, pedidos: 42, color: 'bg-primary' },
    { etiqueta: 'Cumpleaños', porcentaje: 20, pedidos: 13, color: 'bg-tertiary' },
    { etiqueta: 'Aniversarios', porcentaje: 15, pedidos: 10, color: 'bg-secondary-container' },
  ],
  mesasActivas: 8,
  mesasTotales: 12,
}

export const PEDIDOS_MOCK: PedidoOperativo[] = [
  {
    id: 'ped-1042',
    folio: '#DE-1042',
    clienteNombre: 'Sofia Montes',
    clienteTelefono: '5551234567',
    descripcion: '24 Rosas Rubor • Papel Coreano Blanco & Listón Vino',
    entregaEtiqueta: 'Roma Norte (Camioneta Climatizada)',
    hora: 'Entrega 16:00 hrs',
    estados: ['taller', 'liquidar'],
    badge: 'En Taller',
    badgeTone: 'taller',
    total: 1200,
    montoCobrado: 600,
    saldoPendiente: 600,
    nota: 'Caligrafía manuscrita lista',
  },
  {
    id: 'ped-1041',
    folio: '#DE-1041',
    clienteNombre: 'Carlos R.',
    clienteTelefono: '5587654321',
    descripcion: 'Ramo Gigante 50 Rosas Rojas • Toque Dorado Atelier',
    entregaEtiqueta: 'Listo en mostrador Coyoacán con empaque térmico',
    hora: 'Sucursal Coyoacán',
    estados: ['envio'],
    badge: 'Listo Recoger',
    badgeTone: 'listo',
    total: 2400,
    montoCobrado: 2400,
    saldoPendiente: 0,
    nota: 'Notificado vía SMS',
  },
  {
    id: 'ped-1040',
    folio: '#DE-1040',
    clienteNombre: 'Valeria G.',
    clienteTelefono: '5549128840',
    descripcion: 'Edición Especial Corona de Rosas • Listón Champagne',
    entregaEtiqueta: 'En espera de transferencia bancaria SPEI',
    hora: 'Esperando Voucher',
    estados: ['liquidar'],
    badge: 'Anticipo Pendiente',
    badgeTone: 'pendiente',
    total: 1850,
    montoCobrado: 0,
    saldoPendiente: 1850,
    nota: 'Por confirmar WhatsApp',
  },
]

/** Snapshots de cotización POS (el servidor sería quien los emite). */
const COTIZACIONES_EXPRESS: Record<string, Omit<CotizacionPago, 'referencia' | 'modalidad' | 'montoATransferir'>> = {
  '6-recoger': { precioProducto: 450, envio: 0, total: 450, montoAnticipo: 225, montoCompleto: 450 },
  '6-envio': { precioProducto: 450, envio: 120, total: 570, montoAnticipo: 285, montoCompleto: 570 },
  '12-recoger': { precioProducto: 850, envio: 0, total: 850, montoAnticipo: 425, montoCompleto: 850 },
  '12-envio': { precioProducto: 850, envio: 120, total: 970, montoAnticipo: 485, montoCompleto: 970 },
  '24-recoger': { precioProducto: 1480, envio: 0, total: 1480, montoAnticipo: 740, montoCompleto: 1480 },
  '24-envio': { precioProducto: 1480, envio: 120, total: 1600, montoAnticipo: 800, montoCompleto: 1600 },
  '50-recoger': { precioProducto: 2750, envio: 0, total: 2750, montoAnticipo: 1375, montoCompleto: 2750 },
  '50-envio': { precioProducto: 2750, envio: 120, total: 2870, montoAnticipo: 1435, montoCompleto: 2870 },
}

export function cotizarExpressMock(input: ConfeccionExpressInput): CotizacionPago {
  const key = `${input.rosas}-${input.entrega}`
  const base = COTIZACIONES_EXPRESS[key] ?? COTIZACIONES_EXPRESS['12-envio']
  const montoATransferir = input.modalidad === 'anticipo' ? base.montoAnticipo : base.montoCompleto
  return {
    ...base,
    modalidad: input.modalidad,
    montoATransferir,
    referencia: 'DE-2409',
  }
}

export function tarjetaCobroMock(input: ConfeccionExpressInput, quote: CotizacionPago): TarjetaCobro {
  return {
    titulo: `Ramo ${input.rosas} Rosas Eternas de Listón`,
    liston: input.liston,
    papel: input.papel,
    fechaEntrega: input.fechaEntrega,
    servicioEnvio:
      input.entrega === 'envio' ? `Envío CDMX ($${quote.envio} MXN)` : 'Recoger en Atelier ($0 MXN)',
    precioRamo: quote.precioProducto,
    total: quote.total,
    montoATransferir: quote.montoATransferir,
    referencia: quote.referencia,
  }
}
