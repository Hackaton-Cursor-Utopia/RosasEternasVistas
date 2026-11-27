import type { DashboardMetricas, PedidoOperativo } from '../types/models'

export const METRICAS_MOCK: DashboardMetricas = {
  ventasMes: 0,
  ventasMesDelta: '0 pedidos',
  ramosTaller: 0,
  porCobrar: 0,
  anticiposAbiertos: 0,
  enviosHoy: 0,
  demanda: [],
  mesasActivas: 0,
  mesasTotales: 4,
}

// Lista limpia de pedidos para consulta exclusiva desde PostgreSQL
export const PEDIDOS_MOCK: PedidoOperativo[] = []
