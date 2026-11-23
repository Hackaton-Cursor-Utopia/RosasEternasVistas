import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { MetodoEntrega, ModalidadPago, Producto } from '../types/models'

const STORAGE_KEY = 'de-checkout'

export type CheckoutState = {
  product: Producto | null
  entrega: MetodoEntrega | null
  modalidad: ModalidadPago
  direccion: string
  sucursalId: string
}

type CheckoutContextValue = CheckoutState & {
  startCheckout: (product: Producto, entrega: MetodoEntrega | null) => void
  setEntrega: (entrega: MetodoEntrega) => void
  setModalidad: (modalidad: ModalidadPago) => void
  setDireccion: (direccion: string) => void
  setSucursalId: (sucursalId: string) => void
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

function loadState(): CheckoutState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {
        product: null,
        entrega: null,
        modalidad: 'completo',
        direccion: 'Roma Norte, Cuauhtémoc, CDMX',
        sucursalId: 'coyoacan',
      }
    }
    return JSON.parse(raw) as CheckoutState
  } catch {
    return {
      product: null,
      entrega: null,
      modalidad: 'completo',
      direccion: 'Roma Norte, Cuauhtémoc, CDMX',
      sucursalId: 'coyoacan',
    }
  }
}

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CheckoutState>(loadState)

  const persist = (next: CheckoutState) => {
    setState(next)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const value = useMemo<CheckoutContextValue>(
    () => ({
      ...state,
      startCheckout: (product, entrega) =>
        persist({ ...state, product, entrega: entrega ?? state.entrega }),
      setEntrega: (entrega) => persist({ ...state, entrega }),
      setModalidad: (modalidad) => persist({ ...state, modalidad }),
      setDireccion: (direccion) => persist({ ...state, direccion }),
      setSucursalId: (sucursalId) => persist({ ...state, sucursalId }),
    }),
    [state],
  )

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext)
  if (!ctx) throw new Error('useCheckout debe usarse dentro de CheckoutProvider')
  return ctx
}
