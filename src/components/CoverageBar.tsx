import { cn } from "../lib/cn";
import { formatEuros } from "../lib/formatNumber";
import type { CoverageStatus } from "../lib/capitalEstimate";

/**
 * La escala de equilibrio de la calculadora (§2.4).
 *
 * Es el mismo dibujo en los tres estados, solo cambia de color: la horquilla de
 * capital bruto del usuario, colocada sobre una escala en la que está marcada la
 * zona de equilibrio. Que sea el mismo componente siempre es justo lo que hace
 * que se entienda cuando se pone en rojo, porque para entonces el visitante ya
 * lo ha visto en verde y sabe qué está mirando.
 *
 * Y que el equilibrio sea una ZONA y no una línea no es una licencia gráfica:
 * es el ±20 % de los costes estimados dibujado. Por debajo de la zona no sale ni
 * con los costes más favorables; por encima sale siempre; dentro depende de
 * dónde caigan. Esa lectura no existía cuando el umbral era una cifra exacta.
 *
 * Decorativo a efectos de accesibilidad: el texto contiguo da los mismos
 * importes en euros, así que leerlo dos veces solo estorbaría.
 */

const rangeColor: Record<CoverageStatus, string> = {
  holgado: "bg-emerald-400",
  ajustado: "bg-warning",
  insuficiente: "bg-danger",
};

export function CoverageBar({
  grossMin,
  grossMax,
  breakEvenLow,
  breakEvenHigh,
  status,
}: {
  grossMin: number;
  grossMax: number;
  breakEvenLow: number;
  breakEvenHigh: number;
  status: CoverageStatus;
}) {
  /*
    La escala llega siempre un poco más allá del mayor de los dos extremos, para
    que ni la horquilla ni la zona de equilibrio queden pegadas al borde derecho
    y parezcan cortadas.
  */
  const scale = Math.max(grossMax, breakEvenHigh) * 1.12 || 1;
  const pct = (value: number) => `${Math.min(100, Math.max(0, (value / scale) * 100))}%`;

  /*
    Anchura mínima para la horquilla: si el escenario conservador y el optimista
    coinciden (que es lo que pasa en cuanto alguien pone el mismo número en los
    dos campos), el rango mide cero y el marcador desaparecería del todo.
  */
  const rangeWidth = Math.max(((grossMax - grossMin) / scale) * 100, 1.5);

  /*
    La leyenda lleva los importes de la zona, no solo su nombre. Con el dibujo
    marcado como decorativo, es el único sitio donde esas dos cifras existen en
    texto en los tres estados: el párrafo de arriba solo las nombra cuando la
    cobertura es insuficiente.
  */
  const label = `${formatEuros(breakEvenLow)} a ${formatEuros(breakEvenHigh)}`;

  return (
    <div>
      {/* El relleno vertical reserva sitio para las marcas, que sobresalen del carril. */}
      <div aria-hidden="true" className="py-2">
        <div className="relative h-2 w-full rounded-full bg-card-hover">
          {/*
            La horquilla va primero y sobresale un poco del carril, con un anillo
            del color de la tarjeta: se lee como algo colocado ENCIMA de la escala.
          */}
          <div
            className={cn(
              "absolute -bottom-[3px] -top-[3px] rounded-full ring-2 ring-card",
              rangeColor[status],
            )}
            style={{ left: pct(grossMin), width: `${rangeWidth}%` }}
          />

          {/*
            Y la zona de equilibrio va ENCIMA de la horquilla, marcada con dos
            líneas verticales que sobresalen más todavía. Dibujada por debajo (que
            es lo que parecía natural: primero la escala, luego lo que pones sobre
            ella) desaparecía justo en el caso que importa, que es cuando la
            horquilla la cruza: la barra de color la tapaba entera y ya no se veía
            respecto a qué estabas por encima o por debajo.
          */}
          <div
            className="absolute -bottom-2 -top-2 bg-foreground/10"
            style={{ left: pct(breakEvenLow), width: pct(breakEvenHigh - breakEvenLow) }}
          />
          <div
            className="absolute -bottom-2 -top-2 w-px bg-foreground/50"
            style={{ left: pct(breakEvenLow) }}
          />
          <div
            className="absolute -bottom-2 -top-2 w-px bg-foreground/50"
            style={{ left: pct(breakEvenHigh) }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
        <span className="flex items-center gap-2 text-micro text-text-tertiary">
          <span aria-hidden="true" className={cn("h-2 w-4 shrink-0 rounded-full", rangeColor[status])} />
          Tu capital bruto
        </span>
        <span className="flex items-center gap-2 text-micro text-text-tertiary">
          <span
            aria-hidden="true"
            className="h-3 w-4 shrink-0 border-x border-foreground/50 bg-foreground/10"
          />
          Zona de equilibrio, {label}
        </span>
      </div>
    </div>
  );
}
