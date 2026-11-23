import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { FavoritesProvider } from './context/FavoritesContext'
import { CheckoutProvider } from './context/CheckoutContext'
import './index.css'
import { EquipoApp } from './pages/equipo/EquipoApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <CheckoutProvider>
          <EquipoApp />
        </CheckoutProvider>
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
)
