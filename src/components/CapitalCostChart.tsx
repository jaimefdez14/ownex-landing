import { useRef, useState } from "react";
import {
  FIXED_COST_HIGH,
  FIXED_COST_LOW,
  RANGE_MARGIN,
  costForGross,
  costRangeForGross,
  successFeeForGross,
} from "../lib/capitalEstimate";
import { formatEuros, formatInt, formatPercent } from "../lib/formatNumber";

/**
 * Gráfica de "cómo cambia el coste según lo que quieras levantar" (§2.4).
 * Eje X el capital levantado, eje Y el coste estimado de levantarlo.
 *
 * REVISIÓN DEL 11-ago-2026, cuarta vuelta: dos cambios pedidos por Jaime.
 *
 * 1) SEPARAR COSTES FIJOS Y COMISIÓN DE ÉXITO. Hasta ahora el gráfico dibujaba
 *    un único canal de coste total. Ahora es un ÁREA APILADA de dos capas,
 *    que es la forma estándar de mostrar "esto se compone de estas dos
 *    partes" en una gráfica:
 *
 *      - Capa inferior, plana: los costes fijos (`FIXED_COST_LOW`/`_MID`/
 *        `_HIGH` en `capitalEstimate.ts`). Plana a propósito: no dependen de
 *        cuánto se levante, así que su altura no cambia con `x`. Dos líneas
 *        punteadas dentro marcan su ±20 %.
 *      - Capa superior, en cuña: la comisión de éxito (`successFeeForGross`),
 *        que crece con el capital y no lleva margen (es un precio exacto).
 *
 *    El límite superior de las dos capas juntas es `costForGross(x)`, el
 *    mismo coste central de siempre; el gráfico ya no dibuja esa línea aparte
 *    porque ahora ES el borde visible del apilado.
 *
 * 2) EJES MÁS PROFESIONALES. Las marcas repetían "€" en cada valor
 *    ("50.000 €", "100.000 €"...), lo que a Jaime no le convenció. Ahora las
 *    marcas son solo el número (`formatInt`) y la unidad se dice UNA vez, en
 *    el título de cada eje ("Capital levantado (€)").
 *
 * INTERACCIÓN: la capa que cubre el área del gráfico escucha `pointermove`
 * (ratón y dedo, un único juego de eventos para los dos) y mueve un cursor
 * que recalcula el coste en cualquier punto del dominio con las mismas
 * funciones que usa el resto de la calculadora, así que el número que enseña
 * el cursor nunca puede desincronizarse del que enseña la cifra de arriba.
 * `touchAction: "pan-y"` deja que el scroll vertical de la página siga
 * funcionando con el dedo encima del gráfico; solo el gesto horizontal lo
 * captura el propio gráfico.
 *
 * Marcado como decorativo a efectos de accesibilidad (`role="img"` con
 * `aria-label` que resume el rango): ningún dato de ESTE escenario concreto
 * vive solo aquí dentro. La leyenda de debajo, en cambio, es texto real:
 * explica qué es cada capa y qué significa "Equilibrio" sin depender del
 * dibujo.
 */

const VIEW_W = 640;
const VIEW_H = 320;
/*
  84 y no más: al quitar el "€" de cada marca (ver arriba) los rótulos del eje
  Y son más cortos ("50.000" en vez de "50.000 €"), así que hace falta menos
  hueco que antes para el mismo título de eje girado.
*/
const PAD_LEFT = 84;
/*
  36 y no 40: con marcas más cortas (sin "€"), la última marca del eje X ya no
  se sale del borde derecho tan fácilmente. Se deja un margen de todas formas,
  por si el dominio termina justo en una marca "redonda" (ver `niceTicks`).
*/
const PAD_RIGHT = 36;
const PAD_TOP = 24;
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

  /*
    `costForGross(0)` y no una constante nueva: en `gross = 0` la comisión de
    éxito es cero, así que el coste central en ese punto ES exactamente el
    coste fijo medio. Reutilizar la función existente evita exportar un
    tercer nombre (`FIXED_COST_MID`) solo para esto.
  */
  const fixedMid = costForGross(0);

  const scaleX = (x: number) => PAD_LEFT + (Math.min(domainMax, Math.max(0, x)) / domainMax) * PLOT_W;
  const scaleY = (y: number) =>
    PAD_TOP + PLOT_H - (Math.min(yDomainMax, Math.max(0, y)) / yDomainMax) * PLOT_H;

  /* Capa 1: costes fijos, plana. Un rectángulo de x=0 a x=domainMax, de y=0 a y=fixedMid. */
  const fixedLayerPath = [
    `M ${scaleX(0)} ${scaleY(0)}`,
    `L ${scaleX(domainMax)} ${scaleY(0)}`,
    `L ${scaleX(domainMax)} ${scaleY(fixedMid)}`,
    `L ${scaleX(0)} ${scaleY(fixedMid)}`,
    "Z",
  ].join(" ");

  /*
    Capa 2: comisión de éxito, en cuña. Empieza en (0, fixedMid), donde la comisión
    es cero, y sube en línea recta hasta (domainMax, fixedMid + comisión
    en domainMax), cerrando en vertical hacia abajo. Con la comisión siendo
    lineal en `gross`, bastan tres puntos.
  */
  const feeLayerPath = [
    `M ${scaleX(0)} ${scaleY(fixedMid)}`,
    `L ${scaleX(domainMax)} ${scaleY(fixedMid + successFeeForGross(domainMax))}`,
    `L ${scaleX(domainMax)} ${scaleY(fixedMid)}`,
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
      {/*
        `flex-col` en móvil: con las dos frases en fila (`sm:flex-row`) sobre
        un ancho de 390px, cada una se partía en tres líneas apretadas una al
        lado de la otra. Apiladas, cada una usa el ancho completo y se lee en
        una o dos líneas sueltas.
      */}
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
        <p className="text-micro uppercase text-text-tertiary">
          Coste estimado según el capital que levantes
        </p>
        <p className="text-micro text-text-tertiary">±{formatPercent(RANGE_MARGIN * 100)} en costes fijos</p>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          role="img"
          aria-label={`Coste estimado de levantar capital, de ${formatEuros(0)} a ${formatEuros(Math.round(domainMax))}: costes fijos constantes, con un margen de más menos ${formatPercent(RANGE_MARGIN * 100)}, más una comisión de éxito exacta que crece con el capital.`}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="h-[220px] w-full touch-pan-y sm:h-[260px]"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverX(null)}
        >
          {/* Rejilla horizontal + rótulos del eje Y. Solo el número: la unidad va en el título del eje. */}
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
                x={PAD_LEFT - 10}
                y={scaleY(t)}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-secondary text-[10px] tabular"
              >
                {formatInt(t)}
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
                y={PAD_TOP + PLOT_H + 18}
                textAnchor="middle"
                className="fill-text-secondary text-[10px] tabular"
              >
                {formatInt(t)}
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
            className="text-text-secondary"
          />
          <line
            x1={PAD_LEFT}
            y1={PAD_TOP + PLOT_H}
            x2={VIEW_W - PAD_RIGHT}
            y2={PAD_TOP + PLOT_H}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-text-secondary"
          />

          {/* Títulos de eje: dicen QUÉ mide cada uno, y la unidad, una sola vez. */}
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
            x={18}
            y={PAD_TOP + PLOT_H / 2}
            textAnchor="middle"
            transform={`rotate(-90, 18, ${PAD_TOP + PLOT_H / 2})`}
            className="fill-text-secondary text-[10px] font-medium uppercase"
            style={{ letterSpacing: "0.04em" }}
          >
            Coste estimado, en euros
          </text>

          {/* Capa 1: costes fijos, plana, con sus dos líneas de ±20 % marcadas dentro. */}
          <path d={fixedLayerPath} className="fill-text-tertiary/20" />
          <line
            x1={scaleX(0)}
            y1={scaleY(FIXED_COST_LOW)}
            x2={scaleX(domainMax)}
            y2={scaleY(FIXED_COST_LOW)}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            className="text-text-tertiary"
          />
          <line
            x1={scaleX(0)}
            y1={scaleY(FIXED_COST_HIGH)}
            x2={scaleX(domainMax)}
            y2={scaleY(FIXED_COST_HIGH)}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 3"
            className="text-text-tertiary"
          />

          {/* Capa 2: comisión de éxito, en cuña, exacta y sin margen. */}
          <path d={feeLayerPath} className="fill-emerald-400/35" />

          {/* El borde entre las dos capas: el coste central de siempre, ahora visible como el límite del apilado. */}
          <line
            x1={scaleX(0)}
            y1={scaleY(fixedMid)}
            x2={scaleX(domainMax)}
            y2={scaleY(fixedMid + successFeeForGross(domainMax))}
            stroke="#34D399"
            strokeWidth="1.5"
          />

          {/* Guía vertical del punto de equilibrio: donde el extremo alto del coste iguala al bruto. */}
          <line
            x1={breakEvenX}
            y1={breakEvenY}
            x2={breakEvenX}
            y2={PAD_TOP + PLOT_H}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="text-foreground"
          />
          <text
            x={breakEvenX}
            y={PAD_TOP - 8}
            textAnchor="middle"
            className="fill-text-secondary text-[9px] uppercase"
          >
            Equilibrio
          </text>

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
        La leyenda: qué es cada capa del apilado y cada marca del gráfico,
        "Equilibrio" incluido, en texto completo y no solo en el dibujo.
      */}
      <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-3 sm:grid-cols-2">
        <LegendItem
          swatch={<FixedSwatch />}
          term="Costes fijos"
          detail={`${formatEuros(FIXED_COST_LOW)} a ${formatEuros(FIXED_COST_HIGH)}, antes de levantar nada`}
        />
        <LegendItem
          swatch={<FeeSwatch />}
          term="Comisión de éxito"
          detail={`${formatPercent(5)} exacto sobre lo levantado, al cerrar la ronda`}
        />
        <LegendItem swatch={<ScenarioSwatch />} term="Tu escenario" detail="capital y coste que has puesto arriba" />
        <LegendItem
          swatch={<ThresholdSwatch />}
          term="Equilibrio"
          detail="a partir de aquí, el capital cubre el coste incluso en su lectura más alta"
        />
      </div>
    </div>
  );
}

function FixedSwatch() {
  return <span aria-hidden="true" className="h-3 w-4 shrink-0 rounded-sm border border-text-tertiary/40 bg-text-tertiary/25" />;
}

function FeeSwatch() {
  return <span aria-hidden="true" className="h-3 w-4 shrink-0 rounded-sm border border-emerald-400/50 bg-emerald-400/35" />;
}

function ThresholdSwatch() {
  return (
    <span
      aria-hidden="true"
      className="h-3 w-0 shrink-0 border-l-2 border-dashed border-foreground/60"
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
  `<p>`, no `<dt>`: una versión anterior usaba `<dl>`/`<dt>` para la leyenda
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
