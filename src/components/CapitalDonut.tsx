import { formatPercent } from "../lib/formatNumber";

/**
 * Anillo de "cuánto de tu bruto es neto", para la calculadora (§2.4).
 *
 * Sustituye, el 11-ago-2026, al párrafo "Sobre un capital bruto de X a Y. El
 * coste all-in de la operación... va de X a Y." y a la lista de tres métricas
 * (coste de intermediación, coste por euro neto, coste del capital) que iba
 * justo debajo. Jaime pidió menos texto y "una gráfica chula" en su lugar: esto
 * es un solo número dentro de un anillo en vez de cinco líneas de texto y tres
 * filas de tabla.
 *
 * Muestra el escenario PEOR (ronda pequeña, costes altos), no una media: es la
 * misma cautela que ya aplica el resto de la calculadora al medir la cobertura
 * contra el escenario conservador (ver `capitalEstimate.ts`). Enseñar el mejor
 * caso primero sería la lectura más favorable, no la más honesta. El mejor caso
 * se da como una línea corta aparte, fuera del anillo, no dentro de él.
 *
 * Solo el anillo (el `<svg>`) es decorativo y lleva `aria-hidden`; el número del
 * centro es texto normal, fuera del SVG, así que un lector de pantalla lo lee
 * igual que cualquier otra cifra de la tarjeta sin depender del dibujo.
 */

const SIZE = 96;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CapitalDonut({ netPercent }: { netPercent: number }) {
  const clamped = Math.min(100, Math.max(0, netPercent));
  const dash = (clamped / 100) * CIRCUMFERENCE;

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="-rotate-90"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="text-card-hover"
          stroke="currentColor"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="text-emerald-400 transition-[stroke-dashoffset] duration-700 ease-out"
          stroke="currentColor"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={CIRCUMFERENCE - dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-title tabular text-foreground">{formatPercent(clamped)}</span>
        <span className="text-micro uppercase text-text-tertiary">neto</span>
      </div>
    </div>
  );
}
