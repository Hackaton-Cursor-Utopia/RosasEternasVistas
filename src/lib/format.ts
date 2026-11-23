const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

const mxnExact = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
})

export function formatMxn(valor: number): string {
  return mxn.format(valor)
}

export function formatMxnExact(valor: number): string {
  return `${mxnExact.format(valor)} MXN`
}

export function formatClabe(clabe: string): string {
  return clabe.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}
