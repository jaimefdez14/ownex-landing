import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatInt, formatPercent } from "../lib/formatNumber";

/**
 * Diagrama de la arquitectura de propiedad, para la fase 01 de "Cómo funciona".
 *
 * Antes mostraba una retícula de puntos, una flecha, la caja del SPV, otra flecha y
 * el cap table resultante. Contaba el mecanismo, pero no el beneficio: que el cap
 * table se mantiene limpio. Ahora enfrenta las dos situaciones, que es exactamente
 * lo que promete la primera viñeta de la fase ("un SPV agrega a todos los
 * accionistas en una sola línea"): a la izquierda las 412 líneas que habría sin
 * vehículo, a la derecha las tres con él.
 *
 * Es un diagrama, no una captura: por eso usa las superficies oscuras del sitio y
 * no la ventana de navegador clara de los mockups de producto. La diferencia es
 * deliberada y separa "así se estructura" de "así se ve el producto".
 *
 * Decorativo a efectos de accesibilidad: el párrafo y las viñetas contiguas dicen
 * lo mismo en texto, así que queda fuera del árbol.
 */

const capTable = [
  { holder: "Fundadores", stake: 68, highlight: false },
  { holder: "Capital riesgo", stake: 24, highlight: false },
  { holder: "Comunidad", stake: 8, highlight: true },
];

/**
 * Las líneas sueltas que ocuparía cada accionista sin el vehículo. En móvil, dentro
 * del escenario anclado de "Cómo funciona", el panel entero tiene que caber en una
 * pantalla sin scroll interno (ver `useScrollStage`), así que ahí se recorta a 5
 * filas en vez de 9: el degradado de máscara ya comunica "esto sigue" sin necesidad
 * de tantas filas de relleno. Desde `lg` (donde el panel no está acotado a la altura
 * de la pantalla) se ven las 9 completas.
 */
const MESSY_ROWS = 9;
const MESSY_ROWS_COMPACT = 5;

export function CapTableDiagram() {
  return (
    <div aria-hidden="true" className="mt-4 rounded-lg border border-border bg-card/60 p-4 lg:mt-8 lg:p-5">
      <p className="text-micro uppercase text-text-tertiary">El cap table</p>

      {/*
        Los rotulos van encima de cada columna, no debajo: asi las dos se leen como
        las dos mitades de una comparacion. Debajo quedaban sueltos y a distinta
        altura, porque las columnas no miden lo mismo.
      */}
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-2 lg:mt-4 lg:gap-3">
        <div>
          <p className="text-micro uppercase text-text-tertiary">Sin vehículo</p>
          <p className="mb-2 text-caption tabular text-text-secondary lg:mb-3">
            <AnimatedNumber value={412} format={formatInt} /> líneas
          </p>
          <div className="space-y-1 [mask-image:linear-gradient(to_bottom,black_45%,transparent_100%)] lg:space-y-[6px]">
            {Array.from({ length: MESSY_ROWS }, (_, i) => (
              <div
                key={i}
                className={
                  i < MESSY_ROWS_COMPACT
                    ? "flex items-center gap-2 rounded-sm bg-card-hover px-2 py-[3px] lg:py-[5px]"
                    : "hidden items-center gap-2 rounded-sm bg-card-hover px-2 py-[5px] lg:flex"
                }
              >
                <span className="h-1 w-1 shrink-0 rounded-full bg-foreground/25" />
                <span className="h-[3px] flex-1 rounded-full bg-foreground/15" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-full items-center pt-6 lg:pt-8">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card-hover">
            <ArrowRight aria-hidden="true" size={13} className="text-text-secondary" />
          </span>
        </div>

        <div>
          <p className="text-micro uppercase text-emerald-400">Con SPV</p>
          <p className="mb-2 text-caption tabular text-foreground lg:mb-3">3 líneas</p>
          <ul className="space-y-1 lg:space-y-[6px]">
            {capTable.map((row) => (
              <li
                key={row.holder}
                className={
                  row.highlight
                    ? "flex items-center justify-between gap-2 rounded-sm bg-emerald-400/10 px-2 py-[7px] ring-1 ring-inset ring-emerald-400/30"
                    : "flex items-center justify-between gap-2 rounded-sm bg-card-hover px-2 py-[7px]"
                }
              >
                <span
                  className={
                    row.highlight
                      ? "text-micro font-medium uppercase text-emerald-400"
                      : "text-micro uppercase text-text-tertiary"
                  }
                >
                  {row.holder}
                </span>
                <AnimatedNumber
                  value={row.stake}
                  format={formatPercent}
                  className={
                    row.highlight
                      ? "text-caption font-medium tabular text-emerald-400"
                      : "text-caption tabular text-text-secondary"
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-caption text-text-secondary lg:mt-5 lg:pt-4">
        Los 412 accionistas entran agrupados en una sola línea. Tu próxima ronda no se complica.
      </p>
    </div>
  );
}
