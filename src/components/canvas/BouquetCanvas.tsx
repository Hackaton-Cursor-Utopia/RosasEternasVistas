import { useState, useEffect } from 'react'
import { BouquetSvgFallback, ExtrasOverlaySvg } from './BouquetSvgFallback'

export interface BouquetCanvasProps {
  cantidad: 6 | 12 | 24 | 50
  rosaColor?: string
  rosaColorNombre?: string
  papelColor1?: string
  papelColor1Nombre?: string
  monoColor?: string
  monoColorNombre?: string
  esPliegoCombinado?: boolean
  papelColor2?: string
  papelColor2Nombre?: string
  extras?: string[]
  className?: string
}

// Función auxiliar para detectar blanco o tonos casi blancos
function esColorBlanco(hex?: string): boolean {
  if (!hex) return false
  const clean = hex.trim().toLowerCase().replace('#', '')
  return clean === 'ffffff' || clean === 'fff' || clean === 'f8fafc' || clean === 'f3f4f6' || clean === 'f5efe6'
}

// Función auxiliar para detectar tonos muy oscuros / negros
function esColorOscuro(hex?: string): boolean {
  if (!hex) return false
  const clean = hex.trim().toLowerCase().replace('#', '')
  return clean === '18181b' || clean === '1f1f1f' || clean === '000000' || clean === '1a1c1b'
}

interface BouquetLayerProps {
  src: string
  fallbackSrc?: string
  alt: string
  color?: string
  zIndex: number
  transform?: string
  opacityMultiplier?: number
  sinTinte?: boolean
  onError?: () => void
}

function BouquetLayer({
  src,
  fallbackSrc,
  alt,
  color,
  zIndex,
  transform,
  opacityMultiplier = 1,
  sinTinte = false,
  onError,
}: BouquetLayerProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const isWhite = esColorBlanco(color)
  const isDark = esColorOscuro(color)

  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else if (onError) {
      onError()
    }
  }

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
      style={{
        zIndex,
        transform: transform || undefined,
      }}
    >
      {/* 1. Imagen base en escala de grises limpia (conserva textura fotográfica, brillos y sombras reales) */}
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 select-none"
        draggable={false}
      />

      {/* 2. Doble teñido fotorrealista sobre el primer color (sin apagar los brillos especulares) */}
      {!sinTinte && color && !isWhite && (
        <>
          {/* Capa A: Tono exacto sobre la imagen (mixBlendMode: 'color') */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: color,
              mixBlendMode: 'color',
              WebkitMaskImage: `url("${currentSrc}")`,
              maskImage: `url("${currentSrc}")`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              opacity: isDark ? 0.95 : 0.88 * opacityMultiplier,
            }}
          />

          {/* Capa B: Sombreado suave para dar volumen y profundidad (mixBlendMode: 'multiply') */}
          <div
            className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
            style={{
              backgroundColor: color,
              mixBlendMode: 'multiply',
              WebkitMaskImage: `url("${currentSrc}")`,
              maskImage: `url("${currentSrc}")`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              opacity: isDark ? 0.28 : 0.38 * opacityMultiplier,
            }}
          />
        </>
      )}
    </div>
  )
}

/**
 * Ajustes de posición vertical (translateY) del moño por variante de cantidad de rosas.
 * - 6 rosas:  bajado (+25%) hasta la zona estrecha del amarre del papel sin recortar las puntas del listón.
 * - 12 rosas: bajado (+7.5%) para ubicarse entre los pliegues y debajo de la corona de 12 rosas.
 * - 24 rosas: bajado (+10.5%) para coincidir con la cintura del domo ancho de 24 rosas.
 * - 50 rosas: bajado (+13.5%) para calzar exactamente en el amarre inferior del ramo de 50 rosas.
 */
export const MONO_OFFSETS: Record<number, string> = {
  6: 'translateY(25%)',
  12: 'translateY(7.5%)',
  24: 'translateY(10.5%)',
  50: 'translateY(13.5%)',
}

export function BouquetCanvas({
  cantidad,
  rosaColor = '#6b1d2f',
  papelColor1 = '#f5efe6',
  monoColor,
  extras = [],
  className = '',
}: BouquetCanvasProps) {
  const [hasError, setHasError] = useState(false)

  // Color del moño: usa monoColor si se pasa, o rosaColor por defecto
  const colorFinalMono = monoColor || rosaColor

  // Prefijo con cero para cantidades: "06", "12", "24", "50"
  const prefix = cantidad < 10 ? `0${cantidad}` : `${cantidad}`

  // Rutas con fallback seguro de nombre para evitar problemas de codificación de la 'ñ'
  const rutaPapel = `/ramo/${prefix}_papel.png`
  const rutaRosas = `/ramo/${prefix}_rosas.png`
  const rutaMono = `/ramo/${prefix}_moño.png`
  const rutaMonoFallback = `/ramo/${prefix}_mono.png`

  // Offset vertical del moño según la cantidad seleccionada
  const offsetTransformMono = MONO_OFFSETS[cantidad] ?? 'translateY(0%)'

  /**
   * Orden de capas (z-index):
   * - En 12, 24 y 50 rosas: el moño va "entre enmedio" (Papel z-10 < Moño z-20 < Rosas z-30)
   * - En 6 rosas: el moño va al frente amarrando la base visible (Papel z-10 < Rosas z-20 < Moño z-30)
   */
  const esMonoIntermedio = cantidad === 12 || cantidad === 24 || cantidad === 50
  const zIndexPapel = 10
  const zIndexMono = esMonoIntermedio ? 20 : 30
  const zIndexRosas = esMonoIntermedio ? 30 : 20

  useEffect(() => {
    setHasError(false)
  }, [cantidad])

  return (
    <div
      className={`relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/[0.06] ${className}`}
      style={{
        background: 'radial-gradient(ellipse at 50% 32%, #ffffff 0%, #f9f6f0 55%, #ece5da 100%)',
      }}
    >
      {/* Sombra de anclaje de estudio fotográfico en la base */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[70%] h-5 rounded-[100%] bg-black/[0.09] blur-md pointer-events-none" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[46%] h-2.5 rounded-[100%] bg-stone-900/[0.14] blur-sm pointer-events-none" />

      {hasError ? (
        /* Fallback inteligente SVG si falta alguna imagen */
        <div className="absolute inset-0 h-full w-full p-2 transition-all duration-300">
          <BouquetSvgFallback
            cantidad={cantidad}
            rosaColor={rosaColor}
            papelColor1={papelColor1}
            papelColor2={papelColor1}
            esPliegoCombinado={false}
            extras={extras}
          />
        </div>
      ) : (
        /* COMPOSICIÓN DINÁMICA DE CAPAS */
        <div className="relative h-full w-full">
          {/* ============================================================== */}
          {/* 1. CAPA DE FONDO: Pliegos de Papel Envolvente Coreano (z-10)   */}
          {/* Teñido únicamente con el PRIMER color de papel                 */}
          {/* ============================================================== */}
          <BouquetLayer
            src={rutaPapel}
            alt={`Pliego de Papel ${cantidad} Rosas`}
            color={papelColor1}
            zIndex={zIndexPapel}
            opacityMultiplier={0.92}
            sinTinte={esColorBlanco(papelColor1)}
            onError={() => setHasError(true)}
          />

          {/* ============================================================== */}
          {/* 2. CAPA DE MOÑO (z-20 en 12/24/50 | z-30 en 6)                 */}
          {/* Muestra el color satinado seleccionado con su posición exacta  */}
          {/* ============================================================== */}
          <BouquetLayer
            src={rutaMono}
            fallbackSrc={rutaMonoFallback}
            alt={`Moño de Satín ${cantidad} Rosas`}
            color={colorFinalMono}
            zIndex={zIndexMono}
            transform={offsetTransformMono}
            opacityMultiplier={1}
            sinTinte={false}
            onError={() => setHasError(true)}
          />

          {/* ============================================================== */}
          {/* 3. CAPA DE ROSAS (z-30 en 12/24/50 | z-20 en 6)                */}
          {/* Teñido únicamente con el PRIMER color de rosas (se ve natural) */}
          {/* ============================================================== */}
          <BouquetLayer
            src={rutaRosas}
            alt={`Cabezas de Rosas ${cantidad}`}
            color={rosaColor}
            zIndex={zIndexRosas}
            opacityMultiplier={1}
            sinTinte={false}
            onError={() => setHasError(true)}
          />

          {/* ============================================================== */}
          {/* 4. ACCESORIOS (z-40): Toques de Lujo (Perlas, Mariposas, LED)   */}
          {/* ============================================================== */}
          {extras.length > 0 && (
            <div className="absolute inset-0 z-40 h-full w-full pointer-events-none">
              <ExtrasOverlaySvg extras={extras} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
