import { useRef, useState } from "react";
import { costForGross } from "../lib/capitalEstimate";
import { formatEuros } from "../lib/formatNumber";

/**
 * Gráfica de área de "cómo cambia el coste según lo que quieras levantar"
 * (§2.4). Pedida por Jaime el 11-ago-2026 para sustituir el anillo y la escala
 * de equilibrio que había antes: eje X el capital levantado, eje Y el coste
 * estimado de levantarlo, con el punto del escenario del visitante marcado
 * encima y una zona interactiva para explorar otros importes por su cuenta.
 *
 * La curva es una línea recta, no una curva de verdad: `costForGross` (en
 * `capitalEstimate.ts`) es un suelo fijo más un porcentaje sobre el bruto, así
 * que solo hacen falta los dos extremos del dominio para dibujarla entera. No
 * se ha inventado ninguna curvatura para que "se vea mejor": la forma que se ve
 * es la economía real de la operación, con su suelo de coste fijo y su
 * pendiente constante.
 *
 * INTERACCIÓN: la capa transparente que cubre el área del gráfico escucha
 * `pointermove` (ratón Y dedo, un único juego de eventos para los dos) y mueve
 * un cursor que recalcula el coste en cualquier punto del dominio con la misma
 * `costForGross` que usa el resto de la calculadora, así que el número que
 * enseña el cursor nunca puede desincronizarse del que enseña la cifra de
 * arriba. `touchAction: "pan-y"` dejа que el scroll vertical de la página siga
 * funcionando con el dedo encima del gráfico; solo el gesto horizontal lo
 * captura el propio gráfico.
 *
 * Marcado como decorativo a efectos de accesibilidad (`role="img"` con
 * `aria-label` que resume el rango): ningún dato de ESTE escenario concreto
 * vive solo aquí dentro. Lo que sí es exclusivo del gráfico es la posibilidad
 * de explorar OTROS importes, que es una mejora para quien usa ratón o dedo,
 * no información que se esconda.
 */

const VIEW_W = 600;
const VIEW_H = 200;
const PAD_TOP = 20;
const PAD_BOTTOM = 28;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

export function CapitalCostChart({ gross, breakEven }: { gross: number; breakEven: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  /*
    El dominio siempre deja sitio de sobra a la derecha del escenario del
    visitante y del punto de equilibrio, para que ninguno de los dos quede
    pegado al borde y para que explorar "más de lo que tengo ahora" sea posible
    sin salirse del gráfico. El suelo de 150.000 evita un dominio ridículamente
    estrecho cuando el escenario es muy pequeño.
  */
  const domainMax = Math.max(gross * 1.6, breakEven * 2.4, 150000);
  const costAtDomainMax = costForGross(domainMax);

  const scaleX = (x: number) => (Math.min(domainMax, Math.max(0, x)) / domainMax) * VIEW_W;
  const scaleY = (y: number) => PAD_TOP + PLOT_H - (Math.min(costAtDomainMax, y) / costAtDomainMax) * PLOT_H;

  const areaPath = [
    `M ${scaleX(0)} ${PAD_TOP + PLOT_H}`,
    `L ${scaleX(0)} ${scaleY(costForGross(0))}`,
    `L ${scaleX(domainMax)} ${scaleY(costAtDomainMax)}`,
    `L ${scaleX(domainMax)} ${PAD_TOP + PLOT_H}`,
    "Z",
  ].join(" ");

  const linePath = [
    `M ${scaleX(0)} ${scaleY(costForGross(0))}`,
    `L ${scaleX(domainMax)} ${scaleY(costAtDomainMax)}`,
  ].join(" ");

  const pointerToGross = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(domainMax, Math.max(0, ratio * domainMax));
  };

  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (event) => {
    const value = pointerToGross(event.clientX);
    if (value !== null) setHoverX(value);
  };

  const scenarioX = scaleX(gross);
  const scenarioY = scaleY(costForGross(gross));
  const breakEvenX = scaleX(breakEven);
  /*
    `scaleY(breakEven)`, no `scaleY(costForGross(breakEven))`: en el punto de
    equilibrio, por definición, el coste de levantarlo es igual al propio
    capital levantado (`costForGross(breakEven) === breakEven`), así que las dos
    expresiones dan el mismo resultado. Se usa la más corta.
  */
  const breakEvenY = scaleY(breakEven);

  return (
    <div className="rounded-md border border-border bg-card/40 p-4">
      <p className="mb-3 text-micro uppercase text-text-tertiary">
        Coste estimado según el capital que levantes
      </p>

      <div className="relative">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Coste estimado de levantar capital, de ${formatEuros(0)} a ${formatEuros(Math.round(domainMax))}: sube con una pendiente constante desde un suelo de costes fijos.`}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-[180px] w-full touch-pan-y sm:h-[220px]"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverX(null)}
        >
          <defs>
            <linearGradient id="capital-cost-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#capital-cost-fill)" />
          <path d={linePath} fill="none" stroke="#34D399" strokeWidth="2" strokeLinecap="round" />

          {/* Guía vertical del punto de equilibrio: donde el coste deja de superar al bruto. */}
          <line
            x1={breakEvenX}
            y1={breakEvenY}
            x2={breakEvenX}
            y2={PAD_TOP + PLOT_H}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="text-text-tertiary"
          />
          <text
            x={breakEvenX}
            y={PAD_TOP - 6}
            textAnchor="middle"
            className="fill-text-tertiary text-[9px] uppercase"
            style={{ letterSpacing: "0.06em" }}
          >
            Equilibrio
          </text>

          {/* El cursor de exploración, solo mientras hay un puntero encima. */}
          {hoverX !== null ? (
            <>
              <line
                x1={scaleX(hoverX)}
                y1={scaleY(costForGross(hoverX))}
                x2={scaleX(hoverX)}
                y2={PAD_TOP + PLOT_H}
                stroke="currentColor"
                strokeWidth="1"
                className="text-foreground/40"
              />
              <circle
                cx={scaleX(hoverX)}
                cy={scaleY(costForGross(hoverX))}
                r="4"
                className="fill-foreground"
              />
            </>
          ) : null}

          {/* El punto del escenario del visitante: siempre visible, distinto del cursor. */}
          <circle cx={scenarioX} cy={scenarioY} r="5" fill="#0A0B0C" stroke="#34D399" strokeWidth="2" />
          <circle cx={scenarioX} cy={scenarioY} r="2" fill="#34D399" />
        </svg>

        {/*
          La etiqueta flotante sigue al cursor cuando hay uno; si no, describe el
          escenario del visitante. Nunca están las dos a la vez, para no llenar
          el gráfico de texto.

          Posicionada en PORCENTAJE, no en píxeles del `viewBox`: el SVG tiene
          `preserveAspectRatio="none"`, así que sus 600×200 unidades internas se
          estiran para llenar el ancho y el alto reales del contenedor, que casi
          nunca miden 600×200px. Un `translate` calculado en unidades del
          `viewBox` colocaba la etiqueta muy a la izquierda de donde tocaba en
          cualquier ancho de pantalla real. El porcentaje, en cambio, es el mismo
          punto relativo se estire lo que se estire el SVG.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] rounded-sm border border-border bg-card px-2 py-1 text-caption tabular whitespace-nowrap text-foreground shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
          style={{
            left: `${Math.min(86, Math.max(14, ((hoverX !== null ? scaleX(hoverX) : scenarioX) / VIEW_W) * 100))}%`,
            top: `${Math.max(14, ((hoverX !== null ? scaleY(costForGross(hoverX)) : scenarioY) / VIEW_H) * 100)}%`,
          }}
        >
          {formatEuros(Math.round(hoverX ?? gross))} → {formatEuros(Math.round(costForGross(hoverX ?? gross)))}
        </div>
      </div>

      <div className="mt-1 flex items-center justify-between text-micro tabular text-text-tertiary">
        <span>{formatEuros(0)}</span>
        <span>{formatEuros(Math.round(domainMax))}</span>
      </div>
    </div>
  );
}
