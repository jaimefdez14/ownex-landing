import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatInt, formatPercent } from "../lib/formatNumber";

/**
 * Diagrama de la arquitectura de propiedad, para la fase 01 de "Cómo funciona".
 *
 * Enfrenta las dos situaciones, que es exactamente lo que promete la primera
 * viñeta de la fase ("un SPV agrega a todos los accionistas en una sola línea"):
 * a la izquierda los 412 accionistas sueltos, a la derecha las tres líneas que
 * ocupa el cap table con vehículo.
 *
 * REVISIÓN DEL 15-ago-2026: las dos mitades eran listas de barras grises, una
 * más larga que la otra. La comparación se entendía leyendo los rótulos, no
 * mirando el dibujo, que es justo lo contrario de lo que tiene que hacer una
 * ilustración. Ahora cada mitad usa la forma que le corresponde:
 *
 *  - Izquierda: un enjambre de puntos, uno por accionista. El desorden es el
 *    argumento; no hay forma de leerlo como "esto es manejable".
 *  - Derecha: una barra de propiedad apilada con las tres líneas
 *    reales y su reparto. Los 412 puntos de la izquierda son el segmento
 *    esmeralda de la derecha, y eso se ve sin leer nada.
 *
 * Es un diagrama, no una captura: por eso usa las superficies oscuras del sitio y
 * no la ventana de navegador clara de los mockups de producto. La diferencia es
 * deliberada y separa "así se estructura" de "así se ve el producto".
 *
 * Decorativo a efectos de accesibilidad: el párrafo y las viñetas contiguas dicen
 * lo mismo en texto, así que queda fuera del árbol.
 */

const capTable = [
  { holder: "Fundadores", stake: 68, tone: "bg-foreground/70", highlight: false },
  { holder: "Capital riesgo", stake: 24, tone: "bg-foreground/30", highlight: false },
  { holder: "Comunidad", stake: 8, tone: "bg-emerald-400", highlight: true },
];

/**
 * Puntos del enjambre. No son 412: son los que caben sin que el punto deje de
 * verse, y el degradado de máscara del contenedor corta la última fila a medias
 * para que se lea "y siguen". Dentro del escenario anclado de "Cómo funciona" el
 * panel entero tiene que caber en una pantalla sin scroll interno (ver
 * `useScrollStage`), así que en móvil son menos filas.
 */
const SWARM_DOTS = 168;
const SWARM_DOTS_COMPACT = 84;

export function CapTableDiagram() {
  return (
    <div aria-hidden="true" className="mt-4 rounded-lg border border-border bg-card/60 p-4 lg:mt-8 lg:p-5">
      <p className="text-micro uppercase text-text-tertiary">El cap table</p>

      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-2 lg:mt-4 lg:gap-4">
        <div>
          <p className="text-micro uppercase text-text-tertiary">Sin vehículo</p>
          <p className="mb-2 text-caption tabular text-text-secondary lg:mb-3">
            <AnimatedNumber value={412} format={formatInt} /> líneas
          </p>

          <div className="grid grid-cols-12 gap-[4px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] lg:gap-[5px]">
            {Array.from({ length: SWARM_DOTS }, (_, i) => (
              <span
                key={i}
                className={
                  i < SWARM_DOTS_COMPACT
                    ? "aspect-square rounded-full bg-foreground/25"
                    : "hidden aspect-square rounded-full bg-foreground/25 lg:block"
                }
              />
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

          {/*
            La barra de propiedad. Los tres segmentos suman el total y llevan los
            mismos colores que la leyenda de debajo, así que la fila esmeralda y
            el trozo esmeralda de la barra se leen como lo mismo sin necesidad de
            explicarlo.
          */}
          <div className="flex h-[10px] gap-[3px]">
            {capTable.map((row) => (
              <span
                key={row.holder}
                className={`rounded-full ${row.tone}`}
                style={{ width: `${row.stake}%` }}
              />
            ))}
          </div>

          <ul className="mt-2 space-y-1 lg:mt-3 lg:space-y-[6px]">
            {capTable.map((row) => (
              <li
                key={row.holder}
                className={
                  row.highlight
                    ? "flex items-center justify-between gap-2 rounded-sm bg-emerald-400/10 px-2 py-[7px] ring-1 ring-inset ring-emerald-400/30"
                    : "flex items-center justify-between gap-2 rounded-sm bg-card-hover px-2 py-[7px]"
                }
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-[6px] w-[6px] shrink-0 rounded-full ${row.tone}`} />
                  <span
                    className={
                      row.highlight
                        ? "truncate text-micro font-medium uppercase text-emerald-400"
                        : "truncate text-micro uppercase text-text-tertiary"
                    }
                  >
                    {row.holder}
                  </span>
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
