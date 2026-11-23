import { Link, useLocation } from 'react-router-dom'
import { ATELIER } from '../../lib/atelier'
import { Icon } from '../ui/Icon'
import { useFavorites } from '../../context/FavoritesContext'
import { waUrl } from '../../lib/whatsapp'

type StoreHeaderProps = {
  kicker?: string
}

export function StoreHeader({ kicker }: StoreHeaderProps) {
  const location = useLocation()
  const { count } = useFavorites()

  // Subtítulo dinámico según la página
  const getSubtitulo = () => {
    if (kicker) return kicker
    if (location.pathname === '/') return 'Catálogo de Rosas'
    if (location.pathname.startsWith('/personalizar')) return 'Taller 3D'
    if (location.pathname.startsWith('/favoritos')) return 'Mis favoritos'
    if (location.pathname.startsWith('/pedidos')) return 'Mi pedido'
    if (location.pathname.startsWith('/checkout')) return 'Finalizar Pedido'
    return 'Atelier Floral CDMX'
  }

  const NAV_LINKS = [
    { to: '/', label: 'Catálogo', icon: 'local_florist', badge: 0 },
    { to: '/personalizar', label: 'Taller 3D', icon: 'palette', badge: 0 },
    { to: '/favoritos', label: 'Favoritos', icon: 'favorite', badge: count },
    { to: '/pedidos', label: 'Mi pedido', icon: 'all_inbox', badge: 0 },
  ]

  return (
    <header className="fixed top-0 z-30 w-full bg-surface/90 pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.03)] backdrop-blur-xl">
      {/* Franja delgada vino claro con punto que late (aviso de confianza no clicable) */}
      <div className="bg-primary/5 px-4 py-1 text-center select-none">
        <p className="flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-bold tracking-wider text-primary uppercase">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
          Entrega exclusiva en CDMX y Área Metropolitana
        </p>
      </div>

      {/* Contenedor Cabecera */}
      <div className="mx-auto flex h-16 md:h-20 max-w-6xl items-center justify-between px-4 md:px-8">
        {/* Izquierda: Logo y Nombre */}
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img alt="Dulce Eternidad" className="h-8 md:h-9 w-auto object-contain" src={ATELIER.logoUrl} />
          <div className="flex min-w-0 flex-col">
            <span className="font-headline truncate text-xl md:text-2xl leading-tight font-semibold tracking-tight text-primary">
              Dulce Eternidad
            </span>
            <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              {getSubtitulo()}
            </span>
          </div>
        </Link>

        {/* Centro (Escritorio): 4 Enlaces limpios */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(link.to)

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name={link.icon} className="text-[17px]" />
                <span>{link.label}</span>
                {link.badge > 0 && (
                  <span
                    className={`ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Derecha: En escritorio Botón WhatsApp discreto "¿Dudas? Escríbenos". En móvil acceso rápido a Favoritos */}
        <div className="flex items-center gap-2">
          {/* Móvil: Icono de Favoritos con Badge */}
          <Link
            to="/favoritos"
            aria-label="Mis Favoritos"
            className="md:hidden relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-primary hover:bg-surface-container active:scale-95 transition-all"
          >
            <Icon name="favorite" className="text-[20px]" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white shadow-sm">
                {count}
              </span>
            )}
          </Link>

          {/* Escritorio: Botón discreto de WhatsApp */}
          <a
            href={waUrl('Hola Dulce Eternidad, tengo una duda antes de hacer mi pedido.')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-tertiary/20 bg-tertiary/5 px-3.5 py-1.5 text-[12px] font-bold text-tertiary hover:bg-tertiary hover:text-on-tertiary transition-all"
          >
            <Icon name="chat" className="text-[16px]" />
            <span>¿Dudas? Escríbenos</span>
          </a>
        </div>
      </div>
    </header>
  )
}
