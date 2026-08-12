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
 * Hasta entonces se pedían dos horquillas de inversores (conservador/optimista)
 * y todo salía como un rango. Jaime pidió simplificarlo a un único escenario:
 * un número de inversores, un ticket medio, una valoración. Se acabaron los
 * pares mín/máx en la entrada y en la salida.
 *
 * EL MARGEN DE SEGURIDAD ES INTERNO, NO SE ANUNCIA
 *
 * Los costes fijos son estimaciones, no presupuestos cerrados (el propio modelo
 * lo reconoce en sus notas: abogados "7k a 9k, mid 8k"; ESI "500 a 1.000, mid
 * 750"). En vez de enseñar un rango de coste con esa incertidumbre explícita
 * (como hacía la versión anterior, con un "±20 %" a la vista), el coste que se
 * muestra ya incorpora ese margen por dentro: se calcula sobre los costes fijos
 * en su extremo alto (`SAFETY_MARGIN` más abajo), así que la cifra que ve el
 * visitante ya es la conservadora, sin que la pantalla tenga que explicar por
 * qué. Es una única "estimación", no una promesa de precisión que no existe ni
 * una leccion de metodología que nadie pidió.
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

/**
 * Margen de seguridad interno sobre los costes fijos: no es un dato que se
 * enseñe (ver docblock de arriba), así que no se exporta. Si algún día vuelve a
 * hacer falta mostrarlo, empieza por sacarlo de aquí.
 */
const SAFETY_MARGIN = 0.2;
const SAFE_FIXED_COSTS = Math.round(FIXED_COSTS * (1 + SAFETY_MARGIN));

/** Fee de éxito de Ownex sobre el bruto captado (celda B7 del modelo). */
const SUCCESS_FEE_RATE = 0.05;

/**
 * Coste all-in de levantar un capital bruto dado. Es una función pura de una
 * sola variable (lineal en `gross`) porque así es el modelo: un suelo fijo más
 * un porcentaje. La reutiliza tanto `estimateCapital` (para el escenario
 * concreto del visitante) como `CapitalCostChart` (para dibujar la curva
 * completa en el gráfico de "cómo cambia el coste según lo que quieras
 * levantar"): las dos tienen que usar exactamente la misma fórmula, o el punto
 * marcado en el gráfico no coincidiría con la cifra de arriba.
 */
export function costForGross(gross: number): number {
  return SAFE_FIXED_COSTS + SUCCESS_FEE_RATE * Math.max(0, gross);
}

/**
 * Bruto a partir del cual la operación deja algo para la marca (con el margen
 * de seguridad ya aplicado). Por debajo, el coste estimado supera al capital
 * levantado.
 */
export const BREAK_EVEN = SAFE_FIXED_COSTS / (1 - SUCCESS_FEE_RATE);

export type CapitalEstimateInput = {
  investors: number;
  avgTicket: number;
  preMoney: number;
};

export type CapitalEstimateResult = {
  /** Capital que se puede levantar en este escenario: inversores × ticket medio. */
  gross: number;
  /** Coste estimado de levantarlo (ver `costForGross`, con el margen ya dentro). */
  cost: number;
  /** Lo que llega a la cuenta de la marca: `gross - cost`, sin bajar de cero. */
  net: number;
  /** Dilución post-money de los socios actuales, en tanto por ciento. */
  dilution: number;
  /** Si el bruto de este escenario cubre el coste estimado de levantarlo. */
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
  const net = Math.max(0, gross - cost);
  const dilution = preMoney > 0 ? (gross / (preMoney + gross)) * 100 : 0;

  return {
    gross,
    cost,
    net,
    dilution,
    sufficient: gross >= cost,
    shortfall: Math.max(0, BREAK_EVEN - gross),
    investorsNeeded: Math.ceil(BREAK_EVEN / Math.max(1, avgTicket)),
    ticketNeeded: Math.ceil(BREAK_EVEN / Math.max(1, investors)),
  };
}
