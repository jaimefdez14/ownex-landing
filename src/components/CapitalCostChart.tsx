import { useRef, useState } from "react";
import { costRangeForGross, roundToThousand } from "../lib/capitalEstimate";
import { formatEuros, formatInt } from "../lib/formatNumber";

/**
 * Gráfica del coste estimado de la operación según el capital captado. Eje X el
 * capital captado, eje Y el coste.
 *
 * SIMPLIFICADA EL 23-ago-2026. Hasta ahora era un área apilada de dos capas que
 * enseñaba, por separado y al euro, los costes fijos (con su margen del ±20 %
 * marcado con líneas punteadas dentro) y la comisión de éxito de Ownex, más una
 * guía vertical con el punto de equilibrio y una leyenda de cuatro entradas que
 * explicaba cada pieza. Es decir: el modelo de costes completo, con la tarifa de
 * los proveedores y la de Ownex, publicado en una página abierta.
 *
 * Jaime pidió quedarse con la estimación y soltar el detalle. Se retiraron las
 * dos capas, las líneas del margen, la guía y el rótulo del punto de equilibrio,
 * y la leyenda entera.
 *
 * Lo que queda es UNA banda: el área entre el extremo bajo y el alto del coste
 * (`costRangeForGross`), con las cifras redondeadas al millar. El área ya no va
 * del suelo a la curva (que no significaba nada), sino de un extremo al otro, y
 * eso sí dice algo: lo que se ve sombreado ES la horquilla. Como los dos
 * extremos tienen suelo y pendiente distintos, la banda se abre hacia la
 * derecha, que es exactamente lo que pasa con el coste real.
 *
 * Lo que se conserva es lo que hacía atractiva la pieza: ejes reales con marcas
 * redondas, el punto del escenario del visitante y el cursor que recalcula el
 * coste en cualquier punto del dominio con la misma función que usa la cifra de
 * arriba, así que el gráfico y el número nunca pueden desincronizarse.
 *
 * `touchAction: "pan-y"` deja que el scroll vertical de la página siga
 * funcionando con el dedo encima del gráfico; solo el gesto horizontal lo
 * captura el propio gráfico.
 *
 * Decorativo a efectos de accesibilidad (`role="img"` con `aria-label` que
 * resume la forma): ninguna cifra de este escenario vive solo aquí dentro, la
 * de arriba la dice en texto.
 */

const VIEW_W = 640;
const VIEW_H = 300;
const PAD_LEFT = 84;
const PAD_RIGHT = 36;
const PAD_TOP = 20;
/* Dos filas debajo del área de trazado: los rótulos del eje X y, debajo, su título. */
const PAD_BOTTOM = 56;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

/**
 * Marcas "redondas" para un eje, al estilo de cualquier gráfica financiera:
 * en vez de dividir el dominio en N trozos iguales (que dan marcas como
 * "43.605"), busca un paso de 1, 2 o 5 por década que sí se lea de un
 * vistazo ("50.000", "100.000"...). Puede devolver menos marcas de las
 * pedidas si el dominio es muy pequeño; nunca más.
 */
function niceTicks(max: number, count: number): number[] {
  if (max <= 0) return [0];
  const rawStep = max / count;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  const niceResidual = residual < 1.5 ? 1 : residual < 3 ? 2 : residual < 7 ? 5 : 10;
  const step = niceResidual * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v));
  return ticks;
}

export function CapitalCostChart({ gross }: { gross: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  /*
    El dominio deja sitio de sobra a la derecha del escenario del visitante,
    para que no quede pegado al borde y para que explorar "más de lo que tengo
    ahora" sea posible sin salirse. El suelo de 150.000 evita un dominio
    ridículamente estrecho cuando el escenario es muy pequeño.
  */
  const domainMax = Math.max(gross * 1.6, 150000);
  const yDomainMax = costRangeForGross(domainMax).high;

  const scaleX = (x: number) => PAD_LEFT + (Math.min(domainMax, Math.max(0, x)) / domainMax) * PLOT_W;
  const scaleY = (y: number) =>
    PAD_TOP + PLOT_H - (Math.min(yDomainMax, Math.max(0, y)) / yDomainMax) * PLOT_H;

  /*
    La banda entre los dos extremos. Los dos son lineales en el capital, así que
    bastan cuatro puntos: no hace falta muestrear ninguna curva.
  */
  const start = costRangeForGross(0);
  const end = costRangeForGross(domainMax);
  const bandPath = [
    `M ${scaleX(0)} ${scaleY(start.low)}`,
    `L ${scaleX(domainMax)} ${scaleY(end.low)}`,
    `L ${scaleX(domainMax)} ${scaleY(end.high)}`,
    `L ${scaleX(0)} ${scaleY(start.high)}`,
    "Z",
  ].join(" ");

  const pointerToGross = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return null;
    const ratio = (clientX - rect.left - (PAD_LEFT / VIEW_W) * rect.width) / (rect.width * (PLOT_W / VIEW_W));
    return Math.min(domainMax, Math.max(0, ratio * domainMax));
  };

  const onPointerMove: React.PointerEventHandler<SVGSVGElement> = (event) => {
    const value = pointerToGross(event.clientX);
    if (value !== null) setHoverX(value);
  };

  const scenarioRange = costRangeForGross(gross);
  const scenarioX = scaleX(gross);
  /* El punto va en el centro de la banda: representa el escenario, no un extremo. */
  const scenarioY = scaleY((scenarioRange.low + scenarioRange.high) / 2);

  const yTicks = niceTicks(yDomainMax, 4);
  const xTicks = niceTicks(domainMax, 4);

  const activeX = hoverX ?? gross;
  const activeRange = costRangeForGross(activeX);

  return (
    <div className="rounded-md border border-border bg-card/40 p-4">
      <p className="mb-3 text-micro uppercase text-text-tertiary">
        Coste estimado según el capital captado
      </p>

      <div className="relative">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Horquilla del coste estimado de la operación, que crece y se ensancha con el capital captado: hasta ${formatEuros(roundToThousand(end.low))} a ${formatEuros(roundToThousand(end.high))} para un capital de ${formatEuros(roundToThousand(domainMax))}.`}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-[200px] w-full touch-pan-y sm:h-[240px]"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverX(null)}
        >
          {/* Rejilla horizontal + rótulos del eje Y. Solo el número: la unidad va en el título del eje. */}
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line
                x1={PAD_LEFT}
                y1={scaleY(t)}
                x2={PAD_LEFT + PLOT_W}
                y2={scaleY(t)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
              <text
                x={PAD_LEFT - 10}
                y={scaleY(t) + 4}
                textAnchor="end"
                className="fill-text-tertiary text-[11px] tabular"
              >
                {formatInt(t)}
              </text>
            </g>
          ))}

          {/* Rótulos del eje X, en las mismas marcas redondas. */}
          {xTicks.map((t) => (
            <text
              key={`x-${t}`}
              x={scaleX(t)}
              y={PAD_TOP + PLOT_H + 20}
              textAnchor="middle"
              className="fill-text-tertiary text-[11px] tabular"
            >
              {formatInt(t)}
            </text>
          ))}

          {/* Títulos de eje: dicen QUÉ mide cada uno, y la unidad, una sola vez. */}
          <text
            x={PAD_LEFT + PLOT_W / 2}
            y={VIEW_H - 8}
            textAnchor="middle"
            className="fill-text-secondary text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            Capital captado, en euros
          </text>
          <text
            x={18}
            y={PAD_TOP + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 18, ${PAD_TOP + PLOT_H / 2})`}
            className="fill-text-secondary text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            Coste estimado, en euros
          </text>

          {/* La banda del coste: lo sombreado es la horquilla, de extremo a extremo. */}
          <path d={bandPath} className="fill-emerald-400/20" />
          <line
            x1={scaleX(0)}
            y1={scaleY(start.low)}
            x2={scaleX(domainMax)}
            y2={scaleY(end.low)}
            stroke="#34D399"
            strokeWidth="1.5"
          />
          <line
            x1={scaleX(0)}
            y1={scaleY(start.high)}
            x2={scaleX(domainMax)}
            y2={scaleY(end.high)}
            stroke="#34D399"
            strokeWidth="1.5"
          />

          {/* El cursor de exploración, solo mientras hay un puntero encima. */}
          {hoverX !== null ? (
            <line
              x1={scaleX(hoverX)}
              y1={scaleY(costRangeForGross(hoverX).high)}
              x2={scaleX(hoverX)}
              y2={scaleY(0)}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="text-foreground"
            />
          ) : null}

          {/* El punto del escenario del visitante: siempre visible, distinto del cursor. */}
          <circle cx={scenarioX} cy={scenarioY} r="5" fill="#0A0B0C" stroke="#34D399" strokeWidth="2" />
          <circle cx={scenarioX} cy={scenarioY} r="2" fill="#34D399" />
        </svg>

        {/*
          La etiqueta flotante sigue al cursor cuando hay uno; si no, describe
          el escenario del visitante. Nunca están las dos a la vez.

          Posicionada en PORCENTAJE, no en píxeles del `viewBox`: el SVG tiene
          `preserveAspectRatio="none"`, así que sus unidades internas se
          estiran para llenar el ancho y el alto reales del contenedor, que
          casi nunca coinciden con las del `viewBox`. El porcentaje es el
          mismo punto relativo se estire lo que se estire el SVG.
        */}
        {/*
          REHECHA EL 26/08/2026. Decia literalmente
          "150.000 € → 18.000 € a 29.000 €": tres cifras, una flecha y un "a"
          sueltos en una linea, sin decir que era cada numero. Habia que
          adivinarlo.

          Ahora es una ficha con dos filas rotuladas, una por magnitud, y el
          coste alineado a la derecha para que las cifras se lean en columna. El
          punto de color repite el de la banda, asi que la ficha y el dibujo se
          reconocen como lo mismo.

          Los rotulos son "Capital" y "Coste" a secas, no "Si captas" y "Te
          cuesta": en una ficha de datos de una operacion financiera, el nombre
          de la magnitud es lo profesional; la frase en segunda persona sonaba a
          folleto.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[118%] rounded-md border border-border bg-card px-3 py-2 shadow-[0_10px_28px_-10px_rgba(14,15,12,0.35)]"
          style={{
            left: `${Math.min(84, Math.max(((PAD_LEFT + 8) / VIEW_W) * 100, (scaleX(activeX) / VIEW_W) * 100))}%`,
            top: `${Math.max(4, (scaleY(activeRange.high) / VIEW_H) * 100)}%`,
          }}
        >
          <p className="flex items-baseline justify-between gap-5 whitespace-nowrap">
            <span className="text-micro uppercase text-text-tertiary">Capital</span>
            <span className="text-caption font-medium tabular text-foreground">
              {formatEuros(roundToThousand(activeX))}
            </span>
          </p>
          <p className="mt-1 flex items-baseline justify-between gap-5 whitespace-nowrap border-t border-border pt-1">
            <span className="flex items-center gap-[6px] text-micro uppercase text-text-tertiary">
              <span className="h-[6px] w-[6px] rounded-full bg-emerald-400" />
              Coste
            </span>
            <span className="text-caption font-medium tabular text-foreground">
              {formatEuros(roundToThousand(activeRange.low))}
              <span className="px-1 font-normal text-text-tertiary">a</span>
              {formatEuros(roundToThousand(activeRange.high))}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
