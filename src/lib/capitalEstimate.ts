/**
 * Lógica de la calculadora de capital potencial (lead magnet, §2.4).
 *
 * Basada en el modelo de costes real de una emisión de equity de Ownex
 * (OwnEX_Emision-Calculator_v8.xlsx, hoja "Equity"), válido para operaciones
 * de hasta 1,5 M€ de captación bruta, el rango en el que se mueve una emisión
 * dirigida a una comunidad de marca. Por encima de ese importe el modelo
 * original añade una fee variable adicional de ERIR que aquí no se replica
 * porque no es el caso de uso de esta calculadora.
 *
 * QUÉ ENTRA Y QUÉ NO (decisión de Jaime, 11-ago-2026)
 *
 * De las seis partidas fijas del modelo se quedan cuatro: abogados (8.000),
 * constitución del vehículo y notarías (2.700), validación ESI/EAF (750) y
 * registro digital ERIR one-off (3.000). Se han retirado a propósito la fee de
 * estructuración de Ownex (7.500), el coste por inversor (5) y el de KYC/RegTech
 * (500). No es que hayan desaparecido de la operación: es que esta calculadora
 * ya no los estima. Si vuelven, vuelven aquí y en ningún otro sitio.
 *
 * UN SOLO ESCENARIO (revisión del 11-ago-2026)
 *
 * Se pide un número de inversores, un ticket medio y una valoración: un único
 * escenario, sin horquillas de entrada.
 *
 * EL COSTE SE ENSEÑA COMO RANGO, ±20 % (revisión del 11-ago-2026, dos vueltas)
 *
 * Los costes fijos son estimaciones, no presupuestos cerrados (el propio
 * modelo lo reconoce en sus notas: abogados "7k a 9k, mid 8k"; ESI "500 a
 * 1.000, mid 750"). Hubo una versión intermedia que absorbía esa
 * incertidumbre por dentro, sin enseñarla; Jaime pidió volver a mostrarla,
 * pero como rango sobre el coste calculado, no sobre cada partida suelta:
 * `costRangeForGross` toma el coste central (`costForGross`, sin margen) y
 * le aplica ±`RANGE_MARGIN` para dar un extremo bajo y uno alto.
 *
 * El punto de equilibrio (`BREAK_EVEN`) se mide contra el extremo ALTO de ese
 * rango, no contra el central: un escenario solo se da por "suficiente" si
 * cubre incluso el coste más pesimista, no el más probable. Es la misma
 * cautela de siempre, ahora aplicada sobre un rango visible en vez de sobre
 * una cifra oculta.
 *
 * La fee de éxito no lleva ningún margen: es el precio que pone Ownex, no una
 * estimación de un coste ajeno.
 *
 * Y la dilución se calcula post-money, `bruto / (pre-money + bruto)`, que es la
 * dilución real de los socios actuales. El modelo la calcula como
 * `bruto / pre-money` (celda B45), que sobre 2 M€ de pre-money y 182 k€ de bruto
 * da 9,12 % en vez del 8,36 % correcto. Se ha corregido a propósito.
 */

/** Las cuatro partidas que quedan, pagadas a terceros. Suman 14.450 euros. */
const FIXED_COSTS = 8000 + 2700 + 750 + 3000;

/** Fee de éxito de Ownex sobre el bruto captado (celda B7 del modelo). */
const SUCCESS_FEE_RATE = 0.05;

/**
 * Margen del rango de coste, ±20 %. Se exporta porque `CalculatorSection.tsx`
 * lo usa para explicar de dónde sale el rango sin repetir el número a mano.
 */
export const RANGE_MARGIN = 0.2;

/**
 * Coste all-in CENTRAL de levantar un capital bruto dado, sin el margen del
 * rango todavía aplicado. Es una función pura de una sola variable (lineal en
 * `gross`) porque así es el modelo: un suelo fijo más un porcentaje.
 */
export function costForGross(gross: number): number {
  return FIXED_COSTS + SUCCESS_FEE_RATE * Math.max(0, gross);
}

/**
 * El rango de coste (±`RANGE_MARGIN`) para un capital bruto dado. La reutiliza
 * tanto `estimateCapital` (para el escenario concreto del visitante) como
 * `CapitalCostChart` (para dibujar el canal completo en el gráfico de "cómo
 * cambia el coste según lo que quieras levantar"): las dos tienen que usar
 * exactamente la misma fórmula, o la banda del gráfico no coincidiría con las
 * cifras de arriba.
 */
export function costRangeForGross(gross: number): { low: number; high: number } {
  const cost = costForGross(gross);
  return { low: cost * (1 - RANGE_MARGIN), high: cost * (1 + RANGE_MARGIN) };
}

/**
 * Bruto a partir del cual la operación deja algo para la marca, exigiendo que
 * cubra incluso el extremo ALTO del rango de coste (ver docblock de arriba).
 * Por debajo, el coste estimado en su lectura más pesimista ya supera al
 * capital levantado.
 *
 * Despejado de `gross = costForGross(gross) × (1 + RANGE_MARGIN)`.
 */
export const BREAK_EVEN =
  (FIXED_COSTS * (1 + RANGE_MARGIN)) / (1 - SUCCESS_FEE_RATE * (1 + RANGE_MARGIN));

export type CapitalEstimateInput = {
  investors: number;
  avgTicket: number;
  preMoney: number;
};

export type CapitalEstimateResult = {
  /** Capital que se puede levantar en este escenario: inversores × ticket medio. */
  gross: number;
  /** Coste central estimado de levantarlo, antes del rango. */
  cost: number;
  /** Extremo bajo del rango de coste (`cost` × (1 − `RANGE_MARGIN`)). */
  costLow: number;
  /** Extremo alto del rango de coste (`cost` × (1 + `RANGE_MARGIN`)). */
  costHigh: number;
  /** Dilución post-money de los socios actuales, en tanto por ciento. */
  dilution: number;
  /** Si el bruto de este escenario cubre incluso el extremo alto del coste. */
  sufficient: boolean;
  /** Cuánto bruto falta para llegar a `BREAK_EVEN`, si no se cubre. */
  shortfall: number;
  /** Inversores necesarios al ticket actual para llegar a `BREAK_EVEN`. */
  investorsNeeded: number;
  /** Ticket necesario con los inversores actuales para llegar a `BREAK_EVEN`. */
  ticketNeeded: number;
};

export function estimateCapital({
  investors,
  avgTicket,
  preMoney,
}: CapitalEstimateInput): CapitalEstimateResult {
  const gross = investors * avgTicket;
  const cost = costForGross(gross);
  const { low: costLow, high: costHigh } = costRangeForGross(gross);
  const dilution = preMoney > 0 ? (gross / (preMoney + gross)) * 100 : 0;

  return {
    gross,
    cost,
    costLow,
    costHigh,
    dilution,
    sufficient: gross >= costHigh,
    shortfall: Math.max(0, BREAK_EVEN - gross),
    investorsNeeded: Math.ceil(BREAK_EVEN / Math.max(1, avgTicket)),
    ticketNeeded: Math.ceil(BREAK_EVEN / Math.max(1, investors)),
  };
}
