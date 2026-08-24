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

/*
 * LOS DOS EXTREMOS DEL RANGO (decision de Jaime, 23-ago-2026)
 *
 * Hasta ahora el coste se construia como una estimacion central (14.450 € de
 * partidas fijas desglosadas una a una, mas una comision de exito del 5 %
 * exacto) con un margen del ±20 % aplicado solo a la parte fija. Esa
 * construccion obligaba a publicar el desglose para que la cifra se sostuviera,
 * que es justo lo que se retiro de la pantalla.
 *
 * Ahora la horquilla se declara directamente, con los cuatro numeros que fija
 * Jaime, y no se deriva de ningun desglose:
 *
 *   coste bajo  = 13.000 € + 3 % del capital captado
 *   coste alto  = 17.000 € + 8 % del capital captado
 *
 * Es una horquilla mas ancha y menos comprometida que la anterior: cubre tanto
 * una operacion sencilla y barata como una con mas trabajo legal y mas comision,
 * y no ata a Ownex a una cifra al euro. El desglose por partidas que habia aqui
 * (abogados 8.000, vehiculo y notaria 2.700, validacion 750, registro 3.000)
 * queda en el historial de git: ya no lo usa nadie y sus numeros no cuadrarian
 * con estos extremos.
 */

/** Suelo fijo de la operacion, en euros: se paga antes de captar nada. */
export const FIXED_COST_LOW = 13000;
export const FIXED_COST_HIGH = 17000;

/** Comision de exito sobre el capital captado, en tanto por uno. */
const FEE_RATE_LOW = 0.03;
const FEE_RATE_HIGH = 0.08;

/**
 * Redondeo al millar, para TODA cifra de coste que se muestre en pantalla.
 *
 * La calculadora enseñaba el coste al euro (`19.060 € a 24.840 €`), desglosado
 * en cuatro partidas con su importe: publicaba la tarifa de los proveedores y la
 * de Ownex en una pagina abierta. Jaime pidio quedarse con una estimacion de
 * orden de magnitud, asi que lo que se pinta va redondeado.
 */
export function roundToThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}

/**
 * Los dos extremos del coste para un capital captado dado. Las dos rectas
 * arrancan en un suelo distinto Y suben con pendiente distinta, asi que la
 * horquilla se ENSANCHA con el tamaño de la ronda, que es como se comporta de
 * verdad: cuanto mas grande es la operacion, mas peso tiene la comision y mas
 * margen hay entre el mejor y el peor caso.
 *
 * La usan `estimateCapital` (para el escenario del visitante) y
 * `CapitalCostChart` (para dibujar la banda): las dos tienen que salir de la
 * misma funcion, o la banda no coincidiria con las cifras de arriba.
 */
export function costRangeForGross(gross: number): { low: number; high: number } {
  const g = Math.max(0, gross);
  return { low: FIXED_COST_LOW + FEE_RATE_LOW * g, high: FIXED_COST_HIGH + FEE_RATE_HIGH * g };
}

export type CapitalEstimateInput = {
  investors: number;
  avgTicket: number;
  preMoney: number;
};

export type CapitalEstimateResult = {
  /** Capital que se puede captar en este escenario: inversores × ticket medio. */
  gross: number;
  /** Extremo bajo del coste estimado. */
  costLow: number;
  /** Extremo alto del coste estimado. */
  costHigh: number;
  /** Dilución post-money de los socios actuales, en tanto por ciento. */
  dilution: number;
};

export function estimateCapital({
  investors,
  avgTicket,
  preMoney,
}: CapitalEstimateInput): CapitalEstimateResult {
  const gross = investors * avgTicket;
  const { low: costLow, high: costHigh } = costRangeForGross(gross);
  const dilution = preMoney > 0 ? (gross / (preMoney + gross)) * 100 : 0;

  return { gross, costLow, costHigh, dilution };
}
