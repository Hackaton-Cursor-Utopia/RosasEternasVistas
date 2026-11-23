import { NavLink } from 'react-router-dom'
import { Icon } from '../ui/Icon'
import { useFavorites } from '../../context/FavoritesContext'

export function BottomNav() {
  const { count } = useFavorites()

  const ITEMS = [
    { to: '/', label: 'Catálogo', icon: 'local_florist', end: true, badge: 0 },
    { to: '/personalizar', label: 'Personalizar', icon: 'palette', end: false, badge: 0 },
    { to: '/favoritos', label: 'Favoritos', icon: 'favorite', end: false, badge: count },
    { to: '/pedidos', label: 'Mi pedido', icon: 'all_inbox', end: false, badge: 0 },
  ] as const

  return (
    <nav className="fixed bottom-0 z-30 w-full md:hidden bg-surface/95 pb-safe shadow-[0_-2px_12px_rgba(0,0,0,0.04)] backdrop-blur-xl border-t border-surface-variant/30">
      <div className="flex h-16 items-center justify-around px-1">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex h-12 w-16 flex-col items-center justify-center gap-0.5 transition-all ${
                isActive ? 'font-bold text-primary' : 'text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            <div className="relative">
              <Icon name={item.icon} className="text-[22px]" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[8px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
