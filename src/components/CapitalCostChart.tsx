import { useRef, useState } from "react";
import { costForGross, costRangeForGross, RANGE_MARGIN } from "../lib/capitalEstimate";
import { formatEuros, formatPercent } from "../lib/formatNumber";

/**
 * Gráfica de "cómo cambia el coste según lo que quieras levantar" (§2.4).
 * Eje X el capital levantado, eje Y el coste estimado de levantarlo.
 *
 * REVISIÓN DEL 11-ago-2026, segunda vuelta: la primera versión dibujaba una
 * línea única y solo rotulaba los dos extremos del eje X. Jaime pidió una
 * gráfica más profesional y más precisa: ejes de verdad (líneas, marcas,
 * rótulos en euros a intervalos, no solo en las esquinas) en los dos ejes, y
 * la línea de coste sustituida por un CANAL con anchura, que es el ±20 % de
 * `capitalEstimate.ts` dibujado en vez de escrito.
 *
 * El canal no es un efecto visual: `costRangeForGross` (extremo bajo y alto
 * del coste para cada capital) son dos rectas, y el área entre ellas es
 * exactamente el canal. Como las dos rectas tienen distinta pendiente
 * (0,8× la tasa de éxito la de abajo, 1,2× la de arriba: el ±20 % se aplica
 * sobre TODO el coste, no solo sobre el suelo fijo), el canal se ENSANCHA a
 * medida que se levanta más capital. Eso también es real, no un adorno: la
 * incertidumbre en euros de un ±20 % crece con el tamaño de la ronda, aunque
 * el margen proporcional sea siempre el mismo.
 *
 * INTERACCIÓN: la capa que cubre el área del gráfico escucha `pointermove`
 * (ratón y dedo, un único juego de eventos para los dos) y mueve un cursor
 * que recalcula el rango de coste en cualquier punto del dominio con las
 * mismas `costForGross`/`costRangeForGross` que usa el resto de la
 * calculadora, así que el número que enseña el cursor nunca puede
 * desincronizarse del que enseña la cifra de arriba. `touchAction: "pan-y"`
 * deja que el scroll vertical de la página siga funcionando con el dedo
 * encima del gráfico; solo el gesto horizontal lo captura el propio gráfico.
 *
 * Marcado como decorativo a efectos de accesibilidad (`role="img"` con
 * `aria-label` que resume el rango): ningún dato de ESTE escenario concreto
 * vive solo aquí dentro. Lo que sí es exclusivo del gráfico es la posibilidad
 * de explorar OTROS importes, que es una mejora para quien usa ratón o dedo,
 * no información que se esconda.
 *
 * REVISIÓN DEL 11-ago-2026, tercera vuelta: la gráfica tenía marcas en euros
 * en los dos ejes, pero nada decía QUÉ media cada eje, y "Equilibrio" era una
 * palabra suelta sobre una línea punteada sin más contexto. Se añaden dos
 * títulos de eje dentro del propio SVG (uno girado para el vertical, al uso)
 * y una leyenda debajo que explica los cuatro elementos dibujados (incluida
 * la definición completa de "Equilibrio") para que la gráfica se entienda
 * sin tener que intuirla a partir del resto de la calculadora.
 */

const VIEW_W = 640;
const VIEW_H = 300;
/*
  92 y no solo el hueco de las marcas: además de los rótulos en euros del eje
  Y ("50.000 €"...), hace falta sitio para el título del eje, girado en
  vertical ("Coste estimado, en euros"). Sin un título, la gráfica solo decía
  CUÁNTO vale cada marca, nunca DE QUÉ, que es justo lo que faltaba.
*/
const PAD_LEFT = 92;
/*
  40 y no 16: cuando el dominio termina justo en una marca "redonda" (pasa a
  menudo, por como funciona `niceTicks`), esa marca cae exactamente en el
  borde derecho de la zona de trazado, y su rótulo va centrado sobre ella
  (`textAnchor="middle"`). Con un margen de 16 unidades, la mitad derecha de
  un rótulo como "150.000 euros" no cabía y el SVG la recortaba en seco.
*/
const PAD_RIGHT = 40;
const PAD_TOP = 24;
/* 56 y no 36: dos filas debajo del área de trazado, no una: los rótulos en
   euros del eje X y, debajo, su título ("Capital levantado, en euros"). */
const PAD_BOTTOM = 56;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

/**
 * Marcas "redondas" para un eje, al estilo de cualquier gráfica financiera:
 * en vez de dividir el dominio en N trozos iguales (que dan marcas como
 * "43.605 €"), busca un paso de 1, 2 o 5 por década que sí se lea de un
 * vistazo ("50.000 €", "100.000 €"...). Puede devolver menos marcas de las
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

export function CapitalCostChart({ gross, breakEven }: { gross: number; breakEven: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  /*
    El dominio siempre deja sitio de sobra a la derecha del escenario del
    visitante y del punto de equilibrio, para que ninguno de los dos quede
    pegado al borde y para que explorar "más de lo que tengo ahora" sea
    posible sin salirse del gráfico. El suelo de 150.000 evita un dominio
    ridículamente estrecho cuando el escenario es muy pequeño.
  */
  const domainMax = Math.max(gross * 1.6, breakEven * 2.4, 150000);
  const yDomainMax = costRangeForGross(domainMax).high;

  const scaleX = (x: number) => PAD_LEFT + (Math.min(domainMax, Math.max(0, x)) / domainMax) * PLOT_W;
  const scaleY = (y: number) =>
    PAD_TOP + PLOT_H - (Math.min(yDomainMax, Math.max(0, y)) / yDomainMax) * PLOT_H;

  const rangeAt0 = costRangeForGross(0);
  const rangeAtMax = costRangeForGross(domainMax);

  /*
    El canal: un cuadrilátero entre la recta alta (izq→dcha) y la recta baja
    (dcha→izq). Con solo dos rectas bastan las cuatro esquinas, no hace falta
    muestrear puntos intermedios.
  */
  const bandPath = [
    `M ${scaleX(0)} ${scaleY(rangeAt0.high)}`,
    `L ${scaleX(domainMax)} ${scaleY(rangeAtMax.high)}`,
    `L ${scaleX(domainMax)} ${scaleY(rangeAtMax.low)}`,
    `L ${scaleX(0)} ${scaleY(rangeAt0.low)}`,
    "Z",
  ].join(" ");

  const centerLine = [
    `M ${scaleX(0)} ${scaleY(costForGross(0))}`,
    `L ${scaleX(domainMax)} ${scaleY(costForGross(domainMax))}`,
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

  const scenarioX = scaleX(gross);
  const scenarioY = scaleY(costForGross(gross));
  const breakEvenX = scaleX(breakEven);
  /*
    `scaleY(breakEven)`, no `scaleY(costRangeForGross(breakEven).high)`: en el
    punto de equilibrio, por definición, el extremo ALTO del coste es igual al
    propio capital levantado, así que las dos expresiones dan el mismo
    resultado. Se usa la más corta.
  */
  const breakEvenY = scaleY(breakEven);

  const yTicks = niceTicks(yDomainMax, 4);
  const xTicks = niceTicks(domainMax, 4);

  const activeX = hoverX ?? gross;
  const activeRange = costRangeForGross(activeX);

  return (
    <div className="rounded-md border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-micro uppercase text-text-tertiary">
          Coste estimado según el capital que levantes
        </p>
        <p className="text-micro text-text-tertiary">±{formatPercent(RANGE_MARGIN * 100)}</p>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Coste estimado de levantar capital, de ${formatEuros(0)} a ${formatEuros(Math.round(domainMax))}: un canal de más menos ${formatPercent(RANGE_MARGIN * 100)} que se ensancha con el capital levantado.`}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-[200px] w-full touch-pan-y sm:h-[240px]"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverX(null)}
        >
          <defs>
            <linearGradient id="capital-cost-band" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Rejilla horizontal + rótulos del eje Y. */}
          {yTicks.map((t) => (
            <g key={`y-${t}`}>
              <line
                x1={PAD_LEFT}
                y1={scaleY(t)}
                x2={VIEW_W - PAD_RIGHT}
                y2={scaleY(t)}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border"
              />
              <text
                x={PAD_LEFT - 8}
                y={scaleY(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-tertiary text-[9px] tabular"
              >
                {formatEuros(t)}
              </text>
            </g>
          ))}

          {/* Marcas + rótulos del eje X. */}
          {xTicks.map((t) => (
            <g key={`x-${t}`}>
              <line
                x1={scaleX(t)}
                y1={PAD_TOP}
                x2={scaleX(t)}
                y2={PAD_TOP + PLOT_H}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/60"
              />
              <text
                x={scaleX(t)}
                y={PAD_TOP + PLOT_H + 16}
                textAnchor="middle"
                className="fill-text-tertiary text-[9px] tabular"
              >
                {formatEuros(t)}
              </text>
            </g>
          ))}

          {/* Ejes: dos líneas base, algo más marcadas que la rejilla. */}
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP}
            x2={PAD_LEFT}
            y2={PAD_TOP + PLOT_H}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-tertiary"
          />
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP + PLOT_H}
            x2={VIEW_W - PAD_RIGHT}
            y2={PAD_TOP + PLOT_H}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-tertiary"
          />

          {/*
            Títulos de los dos ejes. Antes solo estaban rotuladas las MARCAS
            ("50.000 €", "100.000 €"...), que dicen cuánto vale cada línea de
            la rejilla pero no de qué eje es cada una. Sin esto, alguien que
            entra directo al gráfico no tiene forma de saber que la horizontal
            es el capital y la vertical el coste: tenía que deducirlo del
            título de la tarjeta, un nivel más arriba.
          */}
          <text
            x={PAD_LEFT + PLOT_W / 2}
            y={VIEW_H - 8}
            textAnchor="middle"
            className="fill-text-secondary text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            Capital levantado, en euros
          </text>
          <text
            x={16}
            y={PAD_TOP + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 16, ${PAD_TOP + PLOT_H / 2})`}
            className="fill-text-secondary text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            Coste estimado, en euros
          </text>

          {/* El canal de ±20 % y su línea central. */}
          <path d={bandPath} fill="url(#capital-cost-band)" />
          <path d={centerLine} fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="4 3" />

          {/* Guía vertical del punto de equilibrio: donde el extremo alto del coste iguala al bruto. */}
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
            y={PAD_TOP - 8}
            textAnchor="middle"
            className="fill-text-tertiary text-[9px] uppercase"
          >
            Equilibrio
          </text>

          {/* El cursor de exploración, solo mientras hay un puntero encima. */}
          {hoverX !== null ? (
            <line
              x1={scaleX(hoverX)}
              y1={scaleY(costRangeForGross(hoverX).high)}
              x2={scaleX(hoverX)}
              y2={scaleY(costRangeForGross(hoverX).low)}
              stroke="currentColor"
              strokeWidth="2"
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
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[120%] rounded-sm border border-border bg-card px-2 py-1 text-caption tabular whitespace-nowrap text-foreground shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]"
          style={{
            left: `${Math.min(88, Math.max(((PAD_LEFT + 8) / VIEW_W) * 100, (scaleX(activeX) / VIEW_W) * 100))}%`,
            top: `${Math.max(4, (scaleY(activeRange.high) / VIEW_H) * 100)}%`,
          }}
        >
          {formatEuros(Math.round(activeX))} → {formatEuros(Math.round(activeRange.low))} a{" "}
          {formatEuros(Math.round(activeRange.high))}
        </div>
      </div>

      {/*
        La leyenda. Los títulos de eje dicen QUÉ mide cada línea; esto dice
        qué es cada elemento dibujado, "Equilibrio" incluido. Antes esa
        palabra estaba sola sobre una línea punteada, y bastaba para alguien
        que ya conocía el concepto por el resto de la calculadora, pero no
        para quien entra directo al gráfico.
      */}
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-3 sm:grid-cols-2">
        <LegendItem swatch={<BandSwatch />} term="Rango estimado" detail={`±${formatPercent(RANGE_MARGIN * 100)} sobre el coste central`} />
        <LegendItem swatch={<ScenarioSwatch />} term="Tu escenario" detail="capital y coste que has puesto arriba" />
        <LegendItem swatch={<LineSwatch />} term="Coste medio estimado" detail="el centro del rango, sin margen" />
        <LegendItem
          swatch={<ThresholdSwatch />}
          term="Equilibrio"
          detail="a partir de aquí, el capital cubre el coste incluso en su lectura más alta"
        />
      </div>
    </div>
  );
}

function BandSwatch() {
  return <span aria-hidden="true" className="h-3 w-4 shrink-0 rounded-sm border border-emerald-400/40 bg-emerald-400/25" />;
}

function LineSwatch() {
  return (
    <span
      aria-hidden="true"
      className="h-0 w-4 shrink-0 border-t-2 border-dashed border-emerald-400"
    />
  );
}

function ThresholdSwatch() {
  return (
    <span
      aria-hidden="true"
      className="h-3 w-0 shrink-0 border-l-2 border-dashed border-text-tertiary"
    />
  );
}

function ScenarioSwatch() {
  return (
    <span
      aria-hidden="true"
      className="h-[10px] w-[10px] shrink-0 rounded-full border-2 border-emerald-400 bg-background"
    />
  );
}

/*
  `<p>`, no `<dt>`: la primera versión usaba `<dl>`/`<dt>` para la leyenda
  entera, pero cada "definición" llevaba además el icono de muestra dentro
  del mismo grupo sin un `<dd>` que lo acompañara, así que Lighthouse la
  marcaba como lista de definiciones mal formada. Esto no son definiciones en
  el sentido semántico del elemento, es una leyenda visual: un párrafo normal
  cumple exactamente igual y no arrastra ese requisito de estructura.
*/
function LegendItem({ swatch, term, detail }: { swatch: React.ReactNode; term: string; detail: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-[5px] flex h-3 w-4 shrink-0 items-center justify-center">{swatch}</span>
      <p className="min-w-0">
        <span className="mr-1 text-caption font-medium text-foreground">{term}:</span>
        <span className="text-caption text-text-tertiary">{detail}</span>
      </p>
    </div>
  );
}
