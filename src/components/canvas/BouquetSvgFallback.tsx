import { useId } from 'react'

export interface BouquetSvgFallbackProps {
  cantidad: 6 | 12 | 24 | 50
  rosaColor: string
  papelColor1: string
  papelColor2: string
  esPliegoCombinado: boolean
  extras: string[]
}

// Generador de coordenadas simétricas/orgánicas para las rosas
function obtenerCoordenadasRosas(cantidad: 6 | 12 | 24 | 50): Array<{ cx: number; cy: number; r: number }> {
  const centroX = 200
  const centroY = 220

  if (cantidad === 6) {
    return [
      { cx: centroX, cy: centroY, r: 24 },
      { cx: centroX - 32, cy: centroY - 26, r: 22 },
      { cx: centroX + 32, cy: centroY - 26, r: 22 },
      { cx: centroX - 36, cy: centroY + 20, r: 22 },
      { cx: centroX + 36, cy: centroY + 20, r: 22 },
      { cx: centroX, cy: centroY + 36, r: 21 },
    ]
  }

  if (cantidad === 12) {
    const rosas: Array<{ cx: number; cy: number; r: number }> = [
      { cx: centroX, cy: centroY - 8, r: 18 },
    ]
    // Anillo interior (4 rosas)
    const radioInt = 32
    for (let i = 0; i < 4; i++) {
      const angulo = (i * Math.PI) / 2 + Math.PI / 4
      rosas.push({
        cx: centroX + Math.cos(angulo) * radioInt,
        cy: centroY - 8 + Math.sin(angulo) * radioInt * 0.85,
        r: 17,
      })
    }
    // Anillo exterior (7 rosas)
    const radioExt = 62
    for (let i = 0; i < 7; i++) {
      const angulo = (i * 2 * Math.PI) / 7
      rosas.push({
        cx: centroX + Math.cos(angulo) * radioExt,
        cy: centroY - 10 + Math.sin(angulo) * radioExt * 0.8,
        r: 16,
      })
    }
    return rosas
  }

  if (cantidad === 24) {
    const rosas: Array<{ cx: number; cy: number; r: number }> = [
      { cx: centroX, cy: centroY - 15, r: 14 },
    ]
    // Anillo 1 (5 rosas)
    for (let i = 0; i < 5; i++) {
      const angulo = (i * 2 * Math.PI) / 5
      rosas.push({
        cx: centroX + Math.cos(angulo) * 26,
        cy: centroY - 15 + Math.sin(angulo) * 22,
        r: 13.5,
      })
    }
    // Anillo 2 (8 rosas)
    for (let i = 0; i < 8; i++) {
      const angulo = (i * 2 * Math.PI) / 8 + Math.PI / 8
      rosas.push({
        cx: centroX + Math.cos(angulo) * 52,
        cy: centroY - 15 + Math.sin(angulo) * 44,
        r: 13,
      })
    }
    // Anillo 3 (10 rosas)
    for (let i = 0; i < 10; i++) {
      const angulo = (i * 2 * Math.PI) / 10
      rosas.push({
        cx: centroX + Math.cos(angulo) * 78,
        cy: centroY - 15 + Math.sin(angulo) * 62,
        r: 12.5,
      })
    }
    return rosas
  }

  // 50 Rosas (Domo amplio de alta densidad)
  const rosas: Array<{ cx: number; cy: number; r: number }> = [
    { cx: centroX, cy: centroY - 20, r: 10 },
  ]
  const anillos = [
    { count: 6, radioX: 20, radioY: 17, r: 9.5 },
    { count: 10, radioX: 42, radioY: 35, r: 9 },
    { count: 14, radioX: 66, radioY: 53, r: 8.8 },
    { count: 19, radioX: 92, radioY: 72, r: 8.2 },
  ]
  anillos.forEach((anillo) => {
    for (let i = 0; i < anillo.count; i++) {
      const angulo = (i * 2 * Math.PI) / anillo.count
      rosas.push({
        cx: centroX + Math.cos(angulo) * anillo.radioX,
        cy: centroY - 20 + Math.sin(angulo) * anillo.radioY,
        r: anillo.r,
      })
    }
  })
  return rosas
}

export function ExtrasOverlaySvg({ extras }: { extras: string[] }) {
  const uid = useId().replace(/:/g, '')
  const tienePerlas = extras.includes('perlas')
  const tieneMariposas = extras.includes('mariposas')
  const tieneLed = extras.includes('led')

  if (!tienePerlas && !tieneMariposas && !tieneLed) return null

  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full select-none pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={`shadow-ext-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
        </filter>
        <filter id={`glow-ext-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. GUÍA LED CÁLIDA */}
      {tieneLed && (
        <g id="extra-led-layer" filter={`url(#glow-ext-${uid})`}>
          {[
            { cx: 160, cy: 195 },
            { cx: 240, cy: 190 },
            { cx: 195, cy: 235 },
            { cx: 140, cy: 245 },
            { cx: 260, cy: 250 },
            { cx: 175, cy: 155 },
            { cx: 225, cy: 155 },
            { cx: 200, cy: 275 },
          ].map((led, i) => (
            <g key={i}>
              <circle cx={led.cx} cy={led.cy} r="6.5" fill="#fef08a" opacity="0.45" className="animate-pulse" />
              <circle cx={led.cx} cy={led.cy} r="3" fill="#ffffff" />
            </g>
          ))}
          <path
            d="M 160 195 Q 195 210 240 190 Q 260 220 195 235 Q 140 245 175 155"
            fill="none"
            stroke="#fef08a"
            strokeWidth="0.8"
            opacity="0.6"
            strokeDasharray="2,3"
          />
        </g>
      )}

      {/* 2. CORONA DE PERLAS ARTESANAL */}
      {tienePerlas && (
        <g id="extra-perlas-layer" filter={`url(#shadow-ext-${uid})`}>
          <path
            d="M 145 170 Q 200 135 255 170"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          {[
            { cx: 145, cy: 170, r: 4.5 },
            { cx: 165, cy: 153, r: 5 },
            { cx: 185, cy: 142, r: 5.5 },
            { cx: 200, cy: 138, r: 6.5 },
            { cx: 215, cy: 142, r: 5.5 },
            { cx: 235, cy: 153, r: 5 },
            { cx: 255, cy: 170, r: 4.5 },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r={p.r} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              <circle cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.3} r={p.r * 0.3} fill="#ffffff" />
            </g>
          ))}
        </g>
      )}

      {/* 3. MARIPOSAS DORADAS 3D */}
      {tieneMariposas && (
        <g id="extra-mariposas-layer" filter={`url(#shadow-ext-${uid})`}>
          <g transform="translate(130, 205) rotate(-22) scale(0.85)">
            <ellipse cx="-10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(-30)" />
            <ellipse cx="10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(30)" />
            <ellipse cx="-7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(-20)" />
            <ellipse cx="7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(20)" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-14" r="2" fill="#78350f" />
          </g>

          <g transform="translate(265, 230) rotate(18) scale(0.75)">
            <ellipse cx="-10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(-30)" />
            <ellipse cx="10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(30)" />
            <ellipse cx="-7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(-20)" />
            <ellipse cx="7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(20)" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-14" r="2" fill="#78350f" />
          </g>
        </g>
      )}
    </svg>
  )
}

export function BouquetSvgFallback({
  cantidad,
  rosaColor,
  papelColor1,
  papelColor2,
  esPliegoCombinado,
  extras,
}: BouquetSvgFallbackProps) {
  const uid = useId().replace(/:/g, '')
  const rosasCoords = obtenerCoordenadasRosas(cantidad)

  // El color del pliego interior es papelColor2 si está combinado; sino, es el mismo papelColor1 con variación
  const colorInterior = esPliegoCombinado ? papelColor2 : papelColor1
  const tienePerlas = extras.includes('perlas')
  const tieneMariposas = extras.includes('mariposas')
  const tieneLed = extras.includes('led')

  return (
    <svg
      viewBox="0 0 400 500"
      className="h-full w-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sombra suave para las capas */}
        <filter id={`shadow-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" floodOpacity="0.22" />
        </filter>
        <filter id={`rose-shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.35" />
        </filter>
        <filter id={`glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradiente para Rosas */}
        <radialGradient id={`rose-grad-${uid}`} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="30%" stopColor={rosaColor} />
          <stop offset="85%" stopColor={rosaColor} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
        </radialGradient>

        {/* Gradientes para Pliegos de Papel */}
        <linearGradient id={`papel-ext-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={papelColor1} stopOpacity="0.9" />
          <stop offset="50%" stopColor={papelColor1} />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
        </linearGradient>

        <linearGradient id={`papel-int-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="40%" stopColor={colorInterior} />
          <stop offset="100%" stopColor={colorInterior} stopOpacity="0.85" />
        </linearGradient>

        {/* Gradiente para listón del moño */}
        <linearGradient id={`ribbon-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={rosaColor} />
          <stop offset="70%" stopColor={rosaColor} />
          <stop offset="100%" stopColor="#111111" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {/* ============================================================== */}
      {/* CAPA 1: PLIEGO EXTERIOR (Abanico posterior y base de envoltura) */}
      {/* ============================================================== */}
      <g id="capa-papel-exterior" filter={`url(#shadow-${uid})`}>
        {/* Pliegue posterior izquierdo */}
        <path
          d="M 60 160 Q 110 90 200 110 L 220 370 Q 120 440 60 160 Z"
          fill={`url(#papel-ext-${uid})`}
          stroke="rgba(212,175,55,0.4)"
          strokeWidth="1.5"
        />
        {/* Pliegue posterior derecho */}
        <path
          d="M 340 160 Q 290 90 200 110 L 180 370 Q 280 440 340 160 Z"
          fill={`url(#papel-ext-${uid})`}
          stroke="rgba(212,175,55,0.4)"
          strokeWidth="1.5"
        />
        {/* Cono central inferior exterior */}
        <path
          d="M 120 280 L 175 465 Q 200 475 225 465 L 280 280 Q 200 310 120 280 Z"
          fill={`url(#papel-ext-${uid})`}
        />
      </g>

      {/* ============================================================== */}
      {/* CAPA 2: PLIEGO INTERIOR (Collarín coreano translúcido o secundario) */}
      {/* ============================================================== */}
      <g id="capa-papel-interior">
        {/* Pliegue interior envolvente izquierdo */}
        <path
          d="M 95 190 Q 130 140 200 150 L 210 380 Q 140 400 95 190 Z"
          fill={`url(#papel-int-${uid})`}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
          opacity="0.95"
        />
        {/* Pliegue interior envolvente derecho */}
        <path
          d="M 305 190 Q 270 140 200 150 L 190 380 Q 260 400 305 190 Z"
          fill={`url(#papel-int-${uid})`}
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1"
          opacity="0.95"
        />
        {/* Cuello frontal envolvente */}
        <path
          d="M 135 295 Q 200 325 265 295 L 235 440 Q 200 455 165 440 Z"
          fill={`url(#papel-int-${uid})`}
          stroke="rgba(212,175,55,0.3)"
          strokeWidth="1.5"
        />
      </g>

      {/* ============================================================== */}
      {/* CAPA 3: RAMILLETE DE ROSAS ARTESANALES SATINADAS               */}
      {/* ============================================================== */}
      <g id="capa-rosas" filter={`url(#rose-shadow-${uid})`}>
        {rosasCoords.map((c, i) => (
          <g key={i} className="transition-all duration-300">
            {/* Base pétalos externos */}
            <circle
              cx={c.cx}
              cy={c.cy}
              r={c.r}
              fill={`url(#rose-grad-${uid})`}
            />
            {/* Espiral decorativo de satín interior */}
            <path
              d={`M ${c.cx - c.r * 0.55} ${c.cy - c.r * 0.2}
                  A ${c.r * 0.55} ${c.r * 0.45} 0 0 1 ${c.cx + c.r * 0.5} ${c.cy - c.r * 0.1}
                  A ${c.r * 0.45} ${c.r * 0.4} 0 0 1 ${c.cx - c.r * 0.3} ${c.cy + c.r * 0.35}
                  A ${c.r * 0.3} ${c.r * 0.25} 0 0 1 ${c.cx + c.r * 0.15} ${c.cy + c.r * 0.05}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={Math.max(1.2, c.r * 0.08)}
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            {/* Destello de luz satín */}
            <ellipse
              cx={c.cx - c.r * 0.25}
              cy={c.cy - c.r * 0.3}
              rx={c.r * 0.25}
              ry={c.r * 0.15}
              fill="#ffffff"
              fillOpacity="0.3"
            />
          </g>
        ))}
      </g>

      {/* ============================================================== */}
      {/* CAPA 4: MOÑO BASE DE SATÍN EN EL CUELLO                        */}
      {/* ============================================================== */}
      <g id="capa-mono" filter={`url(#shadow-${uid})`}>
        {/* Nudo central */}
        <ellipse cx="200" cy="385" rx="14" ry="12" fill={`url(#ribbon-grad-${uid})`} />
        {/* Lazo izquierdo */}
        <path
          d="M 190 382 C 145 355 125 390 188 392 Z"
          fill={`url(#ribbon-grad-${uid})`}
        />
        {/* Lazo derecho */}
        <path
          d="M 210 382 C 255 355 275 390 212 392 Z"
          fill={`url(#ribbon-grad-${uid})`}
        />
        {/* Tiras colgantes del moño */}
        <path
          d="M 194 394 Q 170 435 155 480 Q 175 470 198 400 Z"
          fill={`url(#ribbon-grad-${uid})`}
          opacity="0.9"
        />
        <path
          d="M 206 394 Q 230 435 245 480 Q 225 470 202 400 Z"
          fill={`url(#ribbon-grad-${uid})`}
          opacity="0.9"
        />
      </g>

      {/* ============================================================== */}
      {/* EXTRAS OPCIONALES: PERLAS, MARIPOSAS Y GUÍA MICRO LED          */}
      {/* ============================================================== */}

      {/* 1. GUÍA LED CÁLIDA */}
      {tieneLed && (
        <g id="extra-led" filter={`url(#glow-${uid})`}>
          {[
            { cx: 160, cy: 195 },
            { cx: 240, cy: 190 },
            { cx: 195, cy: 235 },
            { cx: 140, cy: 245 },
            { cx: 260, cy: 250 },
            { cx: 175, cy: 155 },
            { cx: 225, cy: 155 },
            { cx: 200, cy: 275 },
          ].map((led, i) => (
            <g key={i}>
              <circle cx={led.cx} cy={led.cy} r="6" fill="#fef08a" opacity="0.4" className="animate-pulse" />
              <circle cx={led.cx} cy={led.cy} r="3" fill="#ffffff" />
            </g>
          ))}
          {/* Hilo conector fino */}
          <path
            d="M 160 195 Q 195 210 240 190 Q 260 220 195 235 Q 140 245 175 155"
            fill="none"
            stroke="#fef08a"
            strokeWidth="0.8"
            opacity="0.6"
            strokeDasharray="2,3"
          />
        </g>
      )}

      {/* 2. CORONA DE PERLAS ARTESANAL */}
      {tienePerlas && (
        <g id="extra-perlas" filter={`url(#shadow-${uid})`}>
          {/* Diadema curva en la parte superior del ramillete */}
          <path
            d="M 145 170 Q 200 135 255 170"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="2"
          />
          {[
            { cx: 145, cy: 170, r: 4.5 },
            { cx: 165, cy: 153, r: 5 },
            { cx: 185, cy: 142, r: 5.5 },
            { cx: 200, cy: 138, r: 6.5 }, // Perla reina central
            { cx: 215, cy: 142, r: 5.5 },
            { cx: 235, cy: 153, r: 5 },
            { cx: 255, cy: 170, r: 4.5 },
          ].map((p, i) => (
            <g key={i}>
              <circle cx={p.cx} cy={p.cy} r={p.r} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
              <circle cx={p.cx - p.r * 0.3} cy={p.cy - p.r * 0.3} r={p.r * 0.3} fill="#ffffff" />
            </g>
          ))}
        </g>
      )}

      {/* 3. MARIPOSAS DORADAS 3D */}
      {tieneMariposas && (
        <g id="extra-mariposas" filter={`url(#shadow-${uid})`}>
          {/* Mariposa 1 (Izquierda superior) */}
          <g transform="translate(130, 205) rotate(-22) scale(0.85)">
            <ellipse cx="-10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(-30)" />
            <ellipse cx="10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(30)" />
            <ellipse cx="-7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(-20)" />
            <ellipse cx="7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(20)" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-14" r="2" fill="#78350f" />
          </g>

          {/* Mariposa 2 (Derecha inferior) */}
          <g transform="translate(265, 230) rotate(18) scale(0.75)">
            <ellipse cx="-10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(-30)" />
            <ellipse cx="10" cy="-6" rx="9" ry="14" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform="rotate(30)" />
            <ellipse cx="-7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(-20)" />
            <ellipse cx="7" cy="8" rx="6" ry="9" fill="#f59e0b" stroke="#d97706" strokeWidth="0.8" transform="rotate(20)" />
            <line x1="0" y1="-14" x2="0" y2="14" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
            <circle cx="0" cy="-14" r="2" fill="#78350f" />
          </g>
        </g>
      )}
    </svg>
  )
}
