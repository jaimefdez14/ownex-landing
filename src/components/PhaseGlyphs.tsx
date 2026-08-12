import type { ReactNode } from "react";

/**
 * Glifos propios de las fases de "Cómo funciona".
 *
 * Antes eran iconos de `lucide-react` tal cual (Scale, Cpu, Zap,
 * LayoutDashboard). Funcionaban, pero son exactamente el mismo juego que usa
 * cualquier landing hecha con esa librería: la parte más repetida de la página
 * (el icono aparece en la cabecera de cada fase, y cada fase ocupa una pantalla
 * entera en el escenario anclado) era justo la que menos firma propia tenía.
 *
 * El alcance es a propósito estas fases y nada más. El resto del sitio sigue
 * con `lucide-react`, que para iconos de apoyo (sectores, propuesta de valor,
 * controles) está bien y no merece el coste de mantener un juego entero.
 *
 * REVISIÓN DEL 11-ago-2026: "Cómo funciona" pasó de cuatro fases a tres (ver el
 * docblock de `FrameworkSection.tsx`) al fusionarse "Motor de activación" dentro
 * de "Panel de la Marca". `ActivationGlyph`, el glifo del accionista que irradia
 * a otros tres, se retira con ella: nada más lo usaba.
 *
 * Reglas del juego, para que los tres se lean como uno solo:
 *
 *  - Retícula de 48 y coordenadas enteras. Los enteros no son manía: el
 *    `check:copy` marca los decimales con punto en el texto visible (§4.1), y las
 *    rutas de un SVG salen del mismo extractor de cadenas que el copy, así que una
 *    coordenada con un decimal detrás del punto haría fallar esa regla. Con la
 *    retícula al doble de 24 no hace falta ni un decimal.
 *  - Un solo grosor de trazo (3 sobre 48, que equivale al 1,5 de la retícula de
 *    24 en la que se dibujaron) y extremos redondeados.
 *  - Exactamente UN punto macizo por glifo, siempre el mismo. Es el motivo que
 *    los hermana, y en cada uno significa algo distinto: la línea única del cap
 *    table, la marca en la cabecera del hub, y el registro seleccionado en el
 *    libro.
 */

type GlyphProps = {
  size?: number;
  className?: string;
};

function Glyph({ size = 20, className, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Fase 01, estructuración: un escudo (la cobertura legal) que guarda dentro una
 * sola línea, que es literalmente lo que promete la fase sobre el cap table.
 */
export function StructuringGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M24 5 L39 11 V23 C39 32 33 39 24 42 C15 39 9 32 9 23 V11 Z" />
      {/*
        El punto y la línea suman de x=14 a x=34, centrados en el eje del escudo:
        descentrados, a 20px de tamaño real el conjunto se leía como una mancha
        pegada a un lado en vez de como una línea con su marca al principio.
      */}
      <path d="M22 24 H34" />
      <circle cx="17" cy="24" r="3" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/**
 * Fase 02, Hub del Propietario: una ventana con su cabecera, y en la cabecera el
 * punto de la marca. Es la fase que promete que el panel va bajo la marca del
 * cliente, no bajo la de Ownex, y el glifo lo dice sin texto.
 */
export function OwnerHubGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="6" y="9" width="36" height="30" rx="5" />
      <path d="M6 18 H42" />
      <circle cx="13" cy="14" r="3" fill="currentColor" stroke="none" />
      <path d="M14 26 H34" />
      <path d="M14 33 H27" />
    </Glyph>
  );
}

/**
 * Fase 03, Panel de la Marca: el libro de accionistas como lo que es, registros
 * apilados, con uno señalado. No repite el marco de ventana de la fase 02: son
 * dos pantallas distintas y no deben leerse como la misma.
 */
export function BrandPanelGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="6" y="7" width="36" height="10" rx="3" />
      <rect x="6" y="19" width="36" height="10" rx="3" />
      <rect x="6" y="31" width="36" height="10" rx="3" />
      <circle cx="13" cy="24" r="3" fill="currentColor" stroke="none" />
    </Glyph>
  );
}
