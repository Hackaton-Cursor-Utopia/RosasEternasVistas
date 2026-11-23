import { useState, type FormEvent } from 'react'
import { PanelPage } from '../PanelPage'
import { Icon } from '../../components/ui/Icon'
import { ATELIER } from '../../lib/atelier'

export function EquipoApp() {
  const [autenticado, setAutenticado] = useState<boolean>(() => {
    return sessionStorage.getItem('de-equipo-auth') === 'true'
  })
  const [usuario, setUsuario] = useState('miguel')
  const [password, setPassword] = useState('1234')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setCargando(true)

    const userClean = usuario.trim().toLowerCase()
    const passClean = password.trim()

    setTimeout(() => {
      // Credenciales válidas: miguel / 1234 o admin / atelier
      if (
        (userClean === 'miguel' && (passClean === '1234' || passClean === 'atelier')) ||
        (userClean === 'admin' && (passClean === '1234' || passClean === 'atelier' || passClean === 'admin'))
      ) {
        setAutenticado(true)
        sessionStorage.setItem('de-equipo-auth', 'true')
      } else {
        setError('Credenciales incorrectas. Usa miguel / 1234')
      }
      setCargando(false)
    }, 250)
  }

  const handleLogout = () => {
    setAutenticado(false)
    sessionStorage.removeItem('de-equipo-auth')
  }

  if (autenticado) {
    return (
      <div className="relative min-h-dvh">
        {/* Barra superior de sesión activa del equipo */}
        <div className="bg-inverse-surface text-surface px-4 py-2 text-[12px] flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-tertiary-fixed animate-pulse" />
            <span className="font-bold">Sesión Activa: Taller Dulce Eternidad (Miguel)</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-surface-variant/20 px-3 py-1 text-[11px] font-bold text-on-primary-container hover:bg-surface-variant/40 transition-colors"
          >
            <Icon name="logout" className="text-[14px]" />
            Cerrar Sesión
          </button>
        </div>
        <PanelPage />
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex flex-col justify-center items-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-surface-container-lowest p-6 md:p-8 shadow-xl ring-1 ring-surface-variant/70">
        <div className="flex flex-col items-center text-center">
          <img src={ATELIER.logoUrl} alt="Dulce Eternidad" className="h-12 w-auto object-contain" />
          <h1 className="font-headline text-2xl font-bold text-primary mt-3">Panel de Equipo</h1>
          <p className="text-[12px] text-on-surface-variant mt-1">
            Acceso exclusivo para floristas, vendedores y administración del taller CDMX.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-error-container p-3 text-[12px] font-semibold text-on-error-container text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Usuario de Taller
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-surface-container-low px-3.5 py-2.5 ring-1 ring-surface-variant/70">
              <Icon name="person" className="text-[18px] text-primary" />
              <input
                type="text"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="miguel"
                className="w-full bg-transparent text-[13px] text-on-surface outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              Contraseña
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-surface-container-low px-3.5 py-2.5 ring-1 ring-surface-variant/70">
              <Icon name="lock" className="text-[18px] text-primary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="1234"
                className="w-full bg-transparent text-[13px] text-on-surface outline-none font-medium"
              />
            </div>
          </div>

          <div className="rounded-xl bg-secondary-container/20 p-2.5 text-center text-[11px] text-on-surface-variant">
            <span>Credenciales por defecto: <strong>miguel</strong> / <strong>1234</strong></span>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-[14px] font-bold text-on-primary shadow-md hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Icon name={cargando ? 'sync' : 'login'} className={`text-[18px] ${cargando ? 'animate-spin' : ''}`} />
            {cargando ? 'Entrando al Taller...' : 'Entrar al Taller'}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-on-surface-variant border-t border-surface-variant/40 pt-4">
          <p>¿Eres comprador? Visita la tienda pública en <a href="/" className="font-bold text-primary hover:underline">la portada</a>.</p>
        </div>
      </div>
    </div>
  )
}
