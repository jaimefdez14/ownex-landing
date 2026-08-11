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
 * LA HORQUILLA DEL ±20 %
 *
 * Los costes fijos son estimaciones, no presupuestos cerrados, y el propio
 * modelo lo reconoce en sus notas (abogados "7k a 9k, mid 8k"; ESI "500 a 1.000,
 * mid 750"). Darlos como cifra exacta era prometer una precisión que no existe,
 * así que se aplica un ±20 % y todo lo que sale de aquí es un rango.
 *
 * La fee de éxito NO lleva ese margen, y es deliberado: es el precio que pone
 * Ownex, no una estimación de un coste ajeno. Publicarla como "entre el 4 % y el
 * 6 %" sería crear una expectativa comercial que nadie ha decidido. Si se quiere
 * lo contrario, se cambia aquí y solo aquí.
 *
 * LO QUE NO VIENE DEL MODELO
 *
 * Una tasa de conversión de "tamaño de comunidad" a "número de inversores" no
 * existe documentada en ninguna parte, así que la calculadora no la asume por el
 * usuario: le pide directamente su propia horquilla de inversores.
 *
 * Y la dilución se calcula post-money, `bruto / (pre-money + bruto)`, que es la
 * dilución real de los socios actuales. El modelo la calcula como
 * `bruto / pre-money` (celda B45), que sobre 2 M€ de pre-money y 182 k€ de bruto
 * da 9,12 % en vez del 8,36 % correcto. Se ha corregido a propósito: es un número
 * que cualquier fundador comprueba con su abogado, y exagerarlo (aunque sea del
 * lado conservador) no compensa.
 */

/** Las cuatro partidas que quedan, pagadas a terceros. Suman 14.450 euros. */
const FIXED_COSTS = 8000 + 2700 + 750 + 3000;

/** Margen de incertidumbre sobre los costes estimados. */
export const COST_UNCERTAINTY = 0.2;

const FIXED_COSTS_LOW = Math.round(FIXED_COSTS * (1 - COST_UNCERTAINTY));
const FIXED_COSTS_HIGH = Math.round(FIXED_COSTS * (1 + COST_UNCERTAINTY));

/** Fee de éxito de Ownex sobre el bruto captado (celda B7 del modelo). */
const SUCCESS_FEE_RATE = 0.05;

/**
 * Bruto a partir del cual la operación deja algo para la marca. Es una zona y no
 * una línea justamente por el ±20 %: por debajo del extremo bajo no sale ni con
 * los costes más favorables, y por encima del alto sale siempre.
 */
const BREAK_EVEN_LOW = FIXED_COSTS_LOW / (1 - SUCCESS_FEE_RATE);
const BREAK_EVEN_HIGH = FIXED_COSTS_HIGH / (1 - SUCCESS_FEE_RATE);

/**
 * Dónde cae el escenario CONSERVADOR del usuario respecto a esa zona. Se mide
 * contra el conservador y no contra el optimista a propósito: la pregunta útil
 * es "¿aguanta si entra poca gente?", no "¿aguanta si todo sale bien?".
 */
export type CoverageStatus = "holgado" | "ajustado" | "insuficiente";

export type CapitalEstimateInput = {
  minInvestors: number;
  maxInvestors: number;
  avgTicket: number;
  preMoney: number;
};

/**
 * Un ratio con sus dos extremos. `best` sale siempre del escenario optimista con
 * los costes en la parte baja, y `worst` del conservador con los costes altos:
 * los ratios de coste mejoran al crecer la ronda, porque las partidas fijas se
 * reparten entre más capital. Que los dos extremos estén tan separados no es
 * ruido, es justamente lo que hay que ver.
 */
export type Ratio = { best: number; worst: number };

export type CapitalEstimateResult = {
  grossMin: number;
  grossMax: number;
  netMin: number;
  netMax: number;
  /** Coste all-in agregado, sin desglosar por partida. */
  costMin: number;
  costMax: number;
  /** Dilución post-money de los socios actuales, en tanto por ciento. */
  dilutionMin: number;
  dilutionMax: number;
  breakEvenLow: number;
  breakEvenHigh: number;
  status: CoverageStatus;
  /**
   * Coste all-in sobre el capital bruto: de cada 100 € que ponen los inversores,
   * cuántos no llegan a la cuenta de la marca.
   */
  intermediation: Ratio;
  /**
   * El mismo coste, pero medido sobre lo que sí llega. Es el mismo dinero visto
   * desde el lado del que lo recibe, y siempre sale un número mayor.
   *
   * Nulo cuando el escenario conservador no deja neto: dividir entre cero no da
   * un ratio, y publicar el del escenario optimista como si fuera el de la
   * operación sería quedarse con la mitad favorable del rango.
   */
  perNet: Ratio | null;
  /**
   * Coste del capital: cuánto de la empresa se entrega por cada 100.000 € netos.
   * Normaliza la dilución por el dinero que de verdad se recibe, que es lo que
   * permite comparar dos rondas de tamaño distinto.
   */
  capitalCost: Ratio | null;
  /** Cuánto bruto falta, en el escenario conservador, para salir de la zona. */
  shortfall: number;
  /** Inversores necesarios al ticket actual para salir de la zona. */
  investorsNeeded: number;
  /** Ticket necesario con los inversores del escenario conservador. */
  ticketNeeded: number;
};

const net = (gross: number, fixed: number) => Math.max(0, gross * (1 - SUCCESS_FEE_RATE) - fixed);

export function estimateCapital({
  minInvestors,
  maxInvestors,
  avgTicket,
  preMoney,
}: CapitalEstimateInput): CapitalEstimateResult {
  const grossMin = minInvestors * avgTicket;
  const grossMax = maxInvestors * avgTicket;

  /*
    El peor caso combina las dos fuentes de incertidumbre en la misma dirección
    (pocos inversores Y costes altos), y el mejor caso al revés. Es la lectura
    honesta de un rango que ahora tiene dos orígenes distintos.
  */
  const netMin = net(grossMin, FIXED_COSTS_HIGH);
  const netMax = net(grossMax, FIXED_COSTS_LOW);

  const costMin = FIXED_COSTS_LOW + SUCCESS_FEE_RATE * grossMin;
  const costMax = FIXED_COSTS_HIGH + SUCCESS_FEE_RATE * grossMax;

  const dilution = (gross: number) => (preMoney > 0 ? (gross / (preMoney + gross)) * 100 : 0);
  const dilutionMin = dilution(grossMin);
  const dilutionMax = dilution(grossMax);

  let status: CoverageStatus = "holgado";
  if (grossMin < BREAK_EVEN_LOW) status = "insuficiente";
  else if (grossMin < BREAK_EVEN_HIGH) status = "ajustado";

  /*
    Los ratios de la operación. Cada extremo empareja el escenario de inversores
    con la punta de la horquilla de costes que le corresponde: el peor ratio sale
    de la ronda pequeña con costes altos, y el mejor de la grande con costes bajos.

    `costWorst` no es `costMin`: aquel es el coste más BAJO en euros (ronda
    pequeña, costes bajos), y este es el coste de la ronda pequeña con los costes
    ALTOS, que es el que da el peor ratio. Son dos preguntas distintas sobre los
    mismos números y confundirlas daba un rango demasiado favorable.
  */
  const costWorst = FIXED_COSTS_HIGH + SUCCESS_FEE_RATE * grossMin;
  const costBest = FIXED_COSTS_LOW + SUCCESS_FEE_RATE * grossMax;

  const intermediation: Ratio = {
    best: grossMax > 0 ? (costBest / grossMax) * 100 : 0,
    worst: grossMin > 0 ? (costWorst / grossMin) * 100 : 0,
  };

  /*
    Los dos ratios que se miden sobre el neto solo existen si hay neto en el
    escenario conservador. Cuando no lo hay (cobertura ajustada o insuficiente),
    el mensaje de la pantalla es otro y estos números solo estorbarían.
  */
  const hasNetFloor = netMin > 0;

  const perNet: Ratio | null = hasNetFloor
    ? { best: (costBest / netMax) * 100, worst: (costWorst / netMin) * 100 }
    : null;

  const capitalCost: Ratio | null =
    hasNetFloor && preMoney > 0
      ? {
          best: dilutionMax / (netMax / 100000),
          worst: dilutionMin / (netMin / 100000),
        }
      : null;

  return {
    grossMin,
    grossMax,
    netMin,
    netMax,
    costMin,
    costMax,
    dilutionMin,
    dilutionMax,
    breakEvenLow: BREAK_EVEN_LOW,
    breakEvenHigh: BREAK_EVEN_HIGH,
    status,
    intermediation,
    perNet,
    capitalCost,
    shortfall: Math.max(0, BREAK_EVEN_HIGH - grossMin),
    investorsNeeded: Math.ceil(BREAK_EVEN_HIGH / Math.max(1, avgTicket)),
    ticketNeeded: Math.ceil(BREAK_EVEN_HIGH / Math.max(1, minInvestors)),
  };
}
