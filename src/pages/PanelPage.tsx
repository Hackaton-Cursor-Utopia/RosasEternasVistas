import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BottomNav } from '../components/layout/BottomNav'
import { WhatsAppFab } from '../components/layout/WhatsAppFab'
import { AdminDashboard } from '../components/panel/AdminDashboard'
import { AgregarProductoForm } from '../components/panel/AgregarProductoForm'
import { LibroPedidos } from '../components/panel/LibroPedidos'
import { VendedorExpress } from '../components/panel/VendedorExpress'
import { Icon } from '../components/ui/Icon'
import { ATELIER } from '../lib/atelier'

type ModoPanel = 'vender' | 'administrar'
type SubTabAdmin = 'dashboard' | 'pedidos' | 'agregar'
type SubTabVendedor = 'rapida' | 'pedidos'

export function PanelPage() {
  const [modo, setModo] = useState<ModoPanel>('vender')
  const [tabAdmin, setTabAdmin] = useState<SubTabAdmin>('dashboard')
  const [tabVendedor, setTabVendedor] = useState<SubTabVendedor>('rapida')

  const fechaHoy = 'Hoy: 14 Feb, 2025'

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-[15px] leading-6 text-on-surface antialiased">
      {/* Banner Superior CDMX y Encabezado Centrado */}
      <header className="sticky top-0 z-40 w-full bg-surface/90 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
        <div className="bg-primary/5 px-4 py-1 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-bold tracking-wider text-primary uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
            Entrega exclusiva en CDMX y Área Metropolitana
          </p>
        </div>

        {/* Encabezado Panel */}
        <div className="mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img alt="Dulce Eternidad" className="h-8 md:h-9 w-auto object-contain" src={ATELIER.logoUrl} />
            <div className="flex flex-col">
              <span className="font-headline text-lg md:text-2xl font-bold tracking-tight text-primary">
                Dulce Eternidad
              </span>
              <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
                Panel Administrativo
              </span>
            </div>
          </Link>

          {/* Enlaces Rápidos en Escritorio */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="storefront" className="text-[16px]" />
              Ver Tienda
            </Link>
            <Link
              to="/pedidos"
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="all_inbox" className="text-[16px]" />
              Pedidos Clientes
            </Link>
          </nav>

          <Link
            to="/"
            aria-label="Perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm hover:opacity-95"
          >
            <Icon name="person" className="text-[18px]" />
          </Link>
        </div>
      </header>

      {/* Contenido Principal Centrado en Escritorio */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 md:px-8 pt-4 pb-28 md:pb-14">
        {/* SWITCH PRINCIPAL: Modo Vender vs Modo Administrar */}
        <div className="mx-auto flex w-full max-w-md rounded-2xl bg-surface-container-high p-1 shadow-inner">
          <button
            type="button"
            onClick={() => setModo('vender')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
              modo === 'vender'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="storefront" className="text-[18px]" />
            Modo Vender
          </button>

          <button
            type="button"
            onClick={() => setModo('administrar')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
              modo === 'administrar'
                ? 'bg-tertiary text-on-tertiary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Icon name="tune" className="text-[18px]" />
            Modo Administrar
          </button>
        </div>

        {/* Barra de Estado del Taller CDMX */}
        <div className="flex items-center justify-between rounded-xl bg-tertiary-fixed/25 px-4 py-2 text-[11px] md:text-[12px] font-semibold text-tertiary">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-tertiary" />
            <span className="font-bold tracking-wide uppercase">Taller Dulce Eternidad • CDMX Activo</span>
          </div>
          <span className="text-[11px] text-on-surface-variant">{fechaHoy}</span>
        </div>

        {/* Subtabs Contextuales */}
        {modo === 'vender' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setTabVendedor('rapida')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                tabVendedor === 'rapida'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="flash_on" className="text-[16px]" />
              Toma Rápida
            </button>
            <button
              type="button"
              onClick={() => setTabVendedor('pedidos')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                tabVendedor === 'pedidos'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="menu_book" className="text-[16px]" />
              Libro Pedidos
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('administrar')
                setTabAdmin('agregar')
              }}
              className="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3.5 py-1.5 text-[12px] font-bold text-on-surface-variant hover:bg-surface-container"
            >
              <Icon name="add" className="text-[16px]" />
              Agregar Ramo
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setTabAdmin('dashboard')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                tabAdmin === 'dashboard'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="bar_chart" className="text-[16px]" />
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setTabAdmin('pedidos')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                tabAdmin === 'pedidos'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="menu_book" className="text-[16px]" />
              Libro de Pedidos
            </button>
            <button
              type="button"
              onClick={() => setTabAdmin('agregar')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-all ${
                tabAdmin === 'agregar'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon name="add" className="text-[16px]" />
              Agregar Ramo
            </button>
          </div>
        )}

        {/* Renderizado Dinámico */}
        {modo === 'vender' ? (
          tabVendedor === 'rapida' ? (
            <VendedorExpress />
          ) : (
            <LibroPedidos />
          )
        ) : (
          tabAdmin === 'dashboard' ? (
            <AdminDashboard
              onVerPedidos={() => setTabAdmin('pedidos')}
              onAgregarRamo={() => setTabAdmin('agregar')}
            />
          ) : tabAdmin === 'pedidos' ? (
            <LibroPedidos />
          ) : (
            <AgregarProductoForm
              onSuccess={() => setTabAdmin('dashboard')}
              onCancel={() => setTabAdmin('dashboard')}
            />
          )
        )}
      </main>

      <WhatsAppFab />
      <BottomNav />
    </div>
  )
}
