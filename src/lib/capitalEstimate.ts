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
 * DOS COSTES DISTINTOS, NO UNO (revisión del 11-ago-2026, cuarta vuelta)
 *
 * Hasta ahora "coste estimado" mezclaba dos cosas de naturaleza distinta en
 * una sola cifra con un ±20 % aplicado al conjunto. Jaime pidió separarlas, y
 * separarlas es además más correcto, no solo más claro:
 *
 *  - COSTES FIJOS (`FIXED_COST_MID` y su rango `FIXED_COST_LOW`/`_HIGH`):
 *    abogados, vehículo, validación regulatoria, registro. Se incurren ANTES
 *    de levantar nada: da igual que la ronda salga bien o mal, hay que
 *    pagarlos igual, y son estimaciones de terceros, así que sí llevan el
 *    ±20 % de incertidumbre. No dependen de `gross` en absoluto: son una
 *    constante, no una función.
 *
 *  - COMISIÓN DE ÉXITO (`successFeeForGross`): el 5 % que cobra Ownex sobre
 *    el capital captado. Se cobra DESPUÉS de levantar el capital: es un
 *    porcentaje de lo que efectivamente entra, y es un precio que pone
 *    Ownex, no la estimación de un coste ajeno: por eso es una cifra EXACTA,
 *    sin margen. Aplicar el ±20 % también sobre la comisión (como hacía la
 *    versión anterior, multiplicando el TOTAL por 0,8/1,2) inflaba una
 *    incertidumbre que en la comisión no existe.
 *
 * Consecuencia visible: antes el canal del gráfico se ensanchaba con el
 * capital levantado (el margen se aplicaba sobre el total, que crece con
 * `gross`). Ahora el ±20 % vive solo en la parte fija, que es constante, así
 * que la anchura de la incertidumbre en euros NO cambia con el capital: lo
 * único que crece con `gross` es la comisión, y esa parte es exacta.
 *
 * `costRangeForGross` se mantiene (mismo nombre, mismo uso desde el gráfico y
 * `CalculatorSection.tsx`) pero ahora es `{low: FIXED_COST_LOW + fee(gross),
 * high: FIXED_COST_HIGH + fee(gross)}`, no `cost(gross) × (1 ± 20 %)`.
 *
 * La fee de éxito no lleva ningún margen: es el precio que pone Ownex, no una
 * estimación de un coste ajeno.
 *
 * Y la dilución se calcula post-money, `bruto / (pre-money + bruto)`, que es la
 * dilución real de los socios actuales. El modelo la calcula como
 * `bruto / pre-money` (celda B45), que sobre 2 M€ de pre-money y 182 k€ de bruto
 * da 9,12 % en vez del 8,36 % correcto. Se ha corregido a propósito.
 */

/**
 * Las cuatro partidas fijas que quedan, pagadas a terceros. Suman 14.450 euros.
 *
 * Se exponen desglosadas, y no solo como total, porque la calculadora las enseña
 * una a una: "coste estimado" sin decir de qué se compone es una cifra que hay
 * que creerse, y este desglose es lo que la convierte en una respuesta.
 */
export const FIXED_COST_ITEMS = [
  { label: "Abogados y documentación legal", amount: 8000 },
  { label: "Constitución del vehículo y notaría", amount: 2700 },
  { label: "Validación regulatoria (ESI/EAF)", amount: 750 },
  { label: "Alta en el registro digital (ERIR)", amount: 3000 },
];

const FIXED_COST_MID = FIXED_COST_ITEMS.reduce((total, item) => total + item.amount, 0);

/** Fee de éxito de Ownex sobre el bruto captado (celda B7 del modelo). Exacta, sin margen. */
const SUCCESS_FEE_RATE = 0.05;

/**
 * Margen de incertidumbre sobre los costes fijos, ±20 %. Se exporta porque
 * `CalculatorSection.tsx` lo usa para explicar de dónde sale el rango sin
 * repetir el número a mano.
 */
export const RANGE_MARGIN = 0.2;

/** Extremo bajo y alto de los costes fijos. Constantes: no dependen de `gross`. */
export const FIXED_COST_LOW = Math.round(FIXED_COST_MID * (1 - RANGE_MARGIN));
export const FIXED_COST_HIGH = Math.round(FIXED_COST_MID * (1 + RANGE_MARGIN));

/**
 * Redondeo al millar, para TODA cifra de coste que se muestre en pantalla.
 *
 * Anadido el 23-ago-2026. La calculadora enseñaba el coste al euro
 * (`19.060 € a 24.840 €`), desglosado en cuatro partidas con su importe y con
 * la comisión de éxito separada: publicaba la tarifa de los proveedores y la de
 * Ownex en una pagina abierta. Jaime pidio quedarse con una estimacion de orden
 * de magnitud. El calculo interno sigue siendo exacto (y el correo que recibe el
 * lead conserva el desglose entero, que es lo que se ofrece a cambio del email);
 * lo que se redondea es solo lo que se pinta.
 */
export function roundToThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}

/** Comisión de éxito exacta sobre un capital bruto dado. Cero margen: es un precio, no una estimación. */
export function successFeeForGross(gross: number): number {
  return SUCCESS_FEE_RATE * Math.max(0, gross);
}

/**
 * Coste all-in CENTRAL de levantar un capital bruto dado: costes fijos (en su
 * valor medio) más la comisión de éxito exacta. Es una función pura de una
 * sola variable (lineal en `gross`) porque así es el modelo: un suelo fijo
 * más un porcentaje.
 */
export function costForGross(gross: number): number {
  return FIXED_COST_MID + successFeeForGross(gross);
}

/**
 * El rango de coste TOTAL para un capital bruto dado: los costes fijos en sus
 * dos extremos, más la comisión de éxito exacta sumada en los dos casos (la
 * comisión no varía, así que la anchura del rango (`high - low`) es siempre
 * `FIXED_COST_HIGH - FIXED_COST_LOW`, constante, sea cual sea `gross`).
 *
 * La reutilizan tanto `estimateCapital` (para el escenario concreto del
 * visitante) como `CapitalCostChart` (para dibujar el canal completo en el
 * gráfico): las dos tienen que usar exactamente la misma fórmula, o la banda
 * del gráfico no coincidiría con las cifras de arriba.
 */
export function costRangeForGross(gross: number): { low: number; high: number } {
  const fee = successFeeForGross(gross);
  return { low: FIXED_COST_LOW + fee, high: FIXED_COST_HIGH + fee };
}

/**
 * Bruto a partir del cual la operación deja algo para la marca, exigiendo que
 * cubra incluso el extremo ALTO de los costes fijos más la comisión. Por
 * debajo, el coste estimado en su lectura más pesimista ya supera al capital
 * levantado.
 *
 * Despejado de `gross = FIXED_COST_HIGH + SUCCESS_FEE_RATE × gross`.
 */
export const BREAK_EVEN = FIXED_COST_HIGH / (1 - SUCCESS_FEE_RATE);

export type CapitalEstimateInput = {
  investors: number;
  avgTicket: number;
  preMoney: number;
};

export type CapitalEstimateResult = {
  /** Capital que se puede levantar en este escenario: inversores × ticket medio. */
  gross: number;
  /** Coste central estimado de levantarlo (costes fijos medios + comisión exacta). */
  cost: number;
  /** Extremo bajo del rango de coste TOTAL (costes fijos bajos + comisión exacta). */
  costLow: number;
  /** Extremo alto del rango de coste TOTAL (costes fijos altos + comisión exacta). */
  costHigh: number;
  /** Comisión de éxito exacta sobre este `gross` (5 %, sin margen). */
  successFee: number;
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
  const successFee = successFeeForGross(gross);
  const { low: costLow, high: costHigh } = costRangeForGross(gross);
  const dilution = preMoney > 0 ? (gross / (preMoney + gross)) * 100 : 0;

  return {
    gross,
    cost,
    costLow,
    costHigh,
    successFee,
    dilution,
    sufficient: gross >= costHigh,
    shortfall: Math.max(0, BREAK_EVEN - gross),
    investorsNeeded: Math.ceil(BREAK_EVEN / Math.max(1, avgTicket)),
    ticketNeeded: Math.ceil(BREAK_EVEN / Math.max(1, investors)),
  };
}
