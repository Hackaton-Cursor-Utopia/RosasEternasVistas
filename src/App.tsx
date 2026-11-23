import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { CheckoutProvider } from './context/CheckoutContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { CatalogPage } from './pages/CatalogPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ConfirmacionPage } from './pages/ConfirmacionPage'
import { FavoritosPage } from './pages/FavoritosPage'
import { PedidosPage } from './pages/PedidosPage'
import { PersonalizarPage } from './pages/PersonalizarPage'

export default function App() {
  return (
    <BrowserRouter>
      <FavoritesProvider>
        <CheckoutProvider>
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/personalizar" element={<PersonalizarPage />} />
            <Route path="/favoritos" element={<FavoritosPage />} />
            <Route path="/pedidos" element={<PedidosPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmacion/:folio" element={<ConfirmacionPage />} />
            {/* Redirección por defecto al catálogo */}
            <Route path="*" element={<CatalogPage />} />
          </Routes>
        </CheckoutProvider>
      </FavoritesProvider>
    </BrowserRouter>
  )
}
