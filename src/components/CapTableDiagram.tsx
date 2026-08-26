import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatInt, formatPercent } from "../lib/formatNumber";

/**
 * Diagrama de la arquitectura de propiedad, para la fase 01 de "Cómo funciona".
 *
 * Enfrenta las dos situaciones, que es exactamente lo que promete la primera
 * viñeta de la fase ("un SPV agrega a todos los accionistas en una sola línea"):
 * a un lado los 412 accionistas sueltos, al otro las tres líneas que ocupa el
 * cap table con vehículo.
 *
 * Cada mitad usa la forma que le corresponde:
 *
 *  - Un enjambre de puntos, uno por accionista. El desorden es el argumento;
 *    no hay forma de leerlo como "esto es manejable".
 *  - Una barra de propiedad apilada con las tres líneas reales y su reparto.
 *    Los puntos del enjambre son el segmento esmeralda de la barra, y eso se
 *    ve sin leer nada.
 *
 * REVISIÓN DEL 19-ago-2026, DOS EJES SEGÚN EL ANCHO. La comparación estaba
 * siempre en tres columnas (`1fr auto 1fr`). En un móvil de 375px eso dejaba
 * unos 130px por mitad: el rótulo "Sin vehículo" partido en dos líneas, el
 * enjambre estrujado hasta perder la sensación de multitud que es su único
 * argumento, y la leyenda de la barra truncada ("Capital riesgo" no cabía).
 * Ahora el eje de la comparación depende del ancho, porque una comparación no
 * tiene por qué ser horizontal:
 *
 *   móvil  → vertical, cada mitad a ancho completo y la flecha apuntando abajo
 *   lg     → horizontal, las dos mitades enfrentadas y la flecha a la derecha
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
 * verse. En móvil son MÁS que en escritorio, no menos, y no es un descuido: ahí
 * el enjambre ocupa el ancho completo de la tarjeta en vez de media columna, así
 * que caben más por fila y hacen falta más filas para que siga leyéndose como
 * una multitud y no como dos rayas de puntos.
 */
const SWARM_DOTS = 210;
const SWARM_DOTS_COMPACT = 154;

export function CapTableDiagram() {
  return (
    <div aria-hidden="true" className="mt-5 rounded-lg border border-border bg-card/60 p-4 lg:mt-0 lg:p-5">
      <p className="text-micro uppercase text-text-tertiary">El cap table</p>

      <div className="mt-3 flex flex-col gap-3 lg:mt-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-4">
        <div>
          <div className="flex items-baseline justify-between gap-3 lg:block">
            <p className="text-micro uppercase text-text-tertiary">Sin vehículo</p>
            <p className="text-caption tabular text-text-secondary lg:mb-3 lg:mt-0">
              <AnimatedNumber value={412} format={formatInt} /> líneas
            </p>
          </div>

          {/*
            Los puntos entran desperdigados y CAEN a su sitio, que es el
            argumento de la mitad izquierda contado con movimiento: 412
            accionistas sueltos que hay que ordenar. El desorden inicial y el
            retraso de cada punto se derivan de su indice, no de `Math.random`:
            asi el servidor y el cliente pintan exactamente lo mismo y no hay
            salto al hidratar. Ver `.swarm-dot` en `index.css`.
          */}
          <div className="mt-2 grid grid-cols-[repeat(22,minmax(0,1fr))] gap-[4px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] lg:mt-0 lg:grid-cols-12 lg:gap-[5px]">
            {Array.from({ length: SWARM_DOTS }, (_, i) => (
              <span
                key={i}
                style={
                  {
                    "--i": i,
                    "--dx": `${(((i * 37) % 21) - 10) * 0.9}px`,
                    "--dy": `${(((i * 53) % 17) - 8) * 0.9}px`,
                  } as React.CSSProperties
                }
                className={
                  i < SWARM_DOTS_COMPACT
                    ? "swarm-dot aspect-square rounded-full bg-foreground/25"
                    : "swarm-dot hidden aspect-square rounded-full bg-foreground/25 lg:block"
                }
              />
            ))}
          </div>
        </div>

        {/*
          La flecha gira con el eje: abajo en móvil, a la derecha desde `lg`. Es
          la misma flecha rotada, no dos iconos distintos.
        */}
        <div className="flex justify-center lg:h-full lg:items-center lg:justify-start lg:pt-8">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card-hover">
            <ArrowRight
              aria-hidden="true"
              size={13}
              className="rotate-90 text-text-secondary lg:rotate-0"
            />
          </span>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3 lg:block">
            <p className="text-micro uppercase text-emerald-400">Con SPV</p>
            <p className="text-caption tabular text-foreground lg:mb-3">3 líneas</p>
          </div>

          {/*
            La barra de propiedad. Los tres segmentos suman el total y llevan los
            mismos colores que la leyenda de debajo, así que la fila esmeralda y
            el trozo esmeralda de la barra se leen como lo mismo sin necesidad de
            explicarlo.
          */}
          <div className="mt-2 flex h-[10px] gap-[3px] lg:mt-0">
            {capTable.map((row, i) => (
              <span
                key={row.holder}
                className={`grow-bar rounded-full ${row.tone}`}
                style={
                  {
                    width: `${row.stake}%`,
                    "--grow-delay": `${420 + i * 110}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <ul className="mt-2 space-y-1 lg:mt-3 lg:space-y-[6px]">
            {capTable.map((row) => (
              <li
                key={row.holder}
                className={
                  row.highlight
                    ? "flex items-center justify-between gap-2 rounded-sm bg-accent-soft px-3 py-2 lg:px-2 lg:py-[7px]"
                    : "flex items-center justify-between gap-2 rounded-sm bg-card-hover px-3 py-2 lg:px-2 lg:py-[7px]"
                }
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className={`h-[6px] w-[6px] shrink-0 rounded-full ${row.tone}`} />
                  <span
                    className={
                      row.highlight
                        ? "truncate text-micro font-medium uppercase text-on-accent-soft"
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
                      ? "text-caption font-medium tabular text-on-accent-soft"
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
