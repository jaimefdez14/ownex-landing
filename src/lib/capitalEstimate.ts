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
 * FIXED_COSTS suma los costes fijos de estructuración que no dependen del
 * número de inversores: abogados (8.000€) + constitución de la sociedad
 * vehículo y notaría (2.700€) + validación EAF/ESI (750€) + registro digital
 * ERIR one-off (3.000€) + fee de estructuración Ownex (7.500€) + verificación
 * de inversores (500€).
 *
 * PER_INVESTOR_COST es el coste de alta y verificación por inversor (5€),
 * también tomado del modelo.
 *
 * SUCCESS_FEE_RATE es la fee de éxito de Ownex sobre el capital bruto
 * captado (5%), la misma que se aplica en el modelo real.
 *
 * Lo que NO viene del modelo (porque no existe en ningún sitio documentado)
 * es una tasa de conversión de "tamaño de comunidad" a "número de
 * inversores": por eso esta calculadora no la asume por el usuario, sino que
 * le pide directamente una horquilla de inversores potenciales, y sobre eso
 * aplica el modelo de costes real.
 */

const FIXED_COSTS = 8000 + 2700 + 750 + 3000 + 7500 + 500;
const PER_INVESTOR_COST = 5;
const SUCCESS_FEE_RATE = 0.05;

export type CapitalEstimateInput = {
  minInvestors: number;
  maxInvestors: number;
  avgTicket: number;
};

export type CapitalEstimateResult = {
  grossMin: number;
  grossMax: number;
  netMin: number;
  netMax: number;
  /** El neto mínimo no cubre ni los costes fijos: la horquilla no es viable tal cual. */
  belowFixedCosts: boolean;
};

function netFromGross(gross: number, investors: number): number {
  const net = gross * (1 - SUCCESS_FEE_RATE) - FIXED_COSTS - PER_INVESTOR_COST * investors;
  return Math.max(0, net);
}

export function estimateCapital({
  minInvestors,
  maxInvestors,
  avgTicket,
}: CapitalEstimateInput): CapitalEstimateResult {
  const grossMin = minInvestors * avgTicket;
  const grossMax = maxInvestors * avgTicket;

  const netMin = netFromGross(grossMin, minInvestors);
  const netMax = netFromGross(grossMax, maxInvestors);

  return {
    grossMin,
    grossMax,
    netMin,
    netMax,
    belowFixedCosts: grossMin * (1 - SUCCESS_FEE_RATE) - FIXED_COSTS - PER_INVESTOR_COST * minInvestors <= 0,
  };
}
