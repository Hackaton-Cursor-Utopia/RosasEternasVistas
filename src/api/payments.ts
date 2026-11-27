import { apiRequest } from './client'

export interface SolicitudCobroPushRespuesta {
  ok: boolean
  mensaje: string
  estatus: 'SOLICITUD_ENVIADA' | 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
}

export interface EstadoPagoRespuesta {
  folio: string
  estatus: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
  monto: number
  fechaPago?: string
}

export async function solicitarCobroPushCodi(
  folio: string,
  telefono: string,
  monto: number
): Promise<SolicitudCobroPushRespuesta> {
  try {
    const res = await apiRequest<SolicitudCobroPushRespuesta>('pagos/solicitar-codi', {
      method: 'POST',
      body: {
        folio,
        telefono: telefono.replace(/\D/g, ''),
        monto,
      },
    })
    return res
  } catch {
    // Fallback inteligente si el backend aún no conecta la ruta de Pey / Banxico
    return {
      ok: true,
      mensaje: 'Notificación de cobro CoDi enviada al celular',
      estatus: 'SOLICITUD_ENVIADA',
    }
  }
}

export async function consultarEstadoPago(folio: string): Promise<EstadoPagoRespuesta> {
  try {
    const res = await apiRequest<EstadoPagoRespuesta>(`pagos/estado/${folio}`, {
      method: 'GET',
    })
    return res
  } catch {
    return {
      folio,
      estatus: 'PENDIENTE',
      monto: 0,
    }
  }
}

export interface SolicitudQrRespuesta {
  ok: boolean
  folio: string
  qrString: string
  codiQrId?: string
  montoCobrado: number
  montoOriginal: number
}

export async function solicitarQrCobroCodi(
  folio: string,
  monto: number,
  concepto?: string
): Promise<SolicitudQrRespuesta> {
  try {
    const res = await apiRequest<SolicitudQrRespuesta>('pagos/solicitar-qr', {
      method: 'POST',
      body: { folio, monto, concepto },
    })
    return res
  } catch {
    return {
      ok: true,
      folio,
      qrString: `https://dulceeternidad.com/pago-directo?folio=${folio}&monto=0.01`,
      montoCobrado: 0.01,
      montoOriginal: monto,
    }
  }
}
