/**
 * Lógica de la calculadora de capital potencial (lead magnet, §2.4).
 *
 * Basada en el modelo de costes real de una emisión de equity de Ownex. La
 * fuente ya no es `OwnEX_Emision-Calculator_v8.xlsx` (archivado): es la hoja
 * `Supuestos` de `OwnEX_Modelo-Financiero_v1.xlsx`, declarada única fuente de
 * verdad, que sustituyó a los cuatro libros financieros anteriores.
 *
 * EL TECHO DE 1,5 M€ YA NO ES UN LÍMITE DE VALIDEZ -- 31/08/2026. Este docblock
 * decía que el modelo valía "hasta 1,5 M€ de captación bruta" y que por encima
 * el original añadía "una fee variable adicional de ERIR que aquí no se
 * replica". Lo segundo dejó de ser cierto hoy: la fee está replicada
 * (`ERIR_VARIABLE_RATE`, abajo), con su porcentaje y su umbral exactos tomados de
 * la hoja `Supuestos`. Lo primero, en consecuencia, tampoco: el modelo ya cubre
 * los dos lados del umbral.
 *
 * Por qué se replicó ahora: los atajos de número de inversores del hero y la
 * calculadora subieron el 31/08 hasta 5.000, que con el ticket de partida son
 * 7,5 M€ de bruto. La calculadora llevaba desde entonces enseñando un coste al
 * que le faltaba una partida, y en el único tramo donde esa partida existe.
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

/*
 * LA FEE VARIABLE DE ERIR - 31/08/2026.
 *
 * El numero sale literalmente de la hoja `Supuestos` de
 * `OwnEX_Modelo-Financiero_v1.xlsx`, fila "ERIR - fee variable one-off (% s/gross,
 * activo si gross > 1,5 M€)": 0,002. No se ha redondeado, ni ajustado, ni
 * interpolado desde ninguna tabla derivada; el analisis de competitividad tiene su
 * propia columna de "variable regulado" que mezcla EAF y ERIR, y NO es esta.
 *
 * SE APLICA EN TODO EL RANGO, SIN EL UMBRAL DE LA FUENTE. Decision de Jaime el
 * mismo dia, y merece explicacion porque se aparta a proposito del modelo.
 *
 * En la fuente la fee es un ESCALON: no existe por debajo de 1,5 M€ y a partir de
 * ahi se cobra sobre el bruto entero. Replicarlo asi se llego a construir, y
 * funcionaba: la horquilla daba un salto de 3.000 € al cruzar el umbral y el
 * grafico lo dibujaba con un quiebro. El problema no era que estuviera mal, era que
 * estaba de mas. Esta calculadora es un instrumento de alto nivel en una pagina
 * publica -- da un orden de magnitud para decidir si merece la pena una llamada --
 * y un escalon de 3.000 € en una cifra que se pinta redondeada al millar no cambia
 * ninguna decision, mientras que la maquinaria que hacia falta para dibujarlo (una
 * lista de quiebros, la banda muestreada por tramos y los dos bordes convertidos en
 * rutas) si complicaba el grafico de verdad.
 *
 * Asi que la fee se aplica siempre y las dos rectas siguen siendo rectas.
 *
 * QUE CUESTA ESA SIMPLIFICACION, medido: por debajo del umbral el coste sale un
 * 0,2 % del bruto mas alto de lo que dice el modelo. En el escenario de partida
 * (150.000 € de bruto) son 300 €, que al redondear al millar no mueven ni una cifra
 * de las que se pintan. Donde ya se nota es en los tramos medios: 500 inversores
 * pasan de 36.000-77.000 € a 37.000-79.000 €. Y el error va en la direccion
 * correcta: la pagina estima el coste ARRIBA, nunca abajo, asi que nadie llega a una
 * llamada con una cifra mejor de la que le van a dar.
 *
 * Si algun dia esta calculadora deja de ser un cebo y pasa a ser una herramienta de
 * presupuesto, el escalon vuelve: esta en el historial de git de este archivo y de
 * `CapitalCostChart.tsx`, con su lista de quiebros y su banda por tramos.
 */
const ERIR_VARIABLE_RATE = 0.002;

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
  /*
    La fee de ERIR entra en LOS DOS extremos con el mismo tipo. No lleva horquilla
    propia, y por el mismo criterio que la comision de exito: es una tarifa, no la
    estimacion de un coste ajeno. Lo que la horquilla mide es la incertidumbre del
    trabajo legal y de la comision, no la de esta partida.

    Va SUMADA AL TIPO en vez de como termino aparte para que quede a la vista que
    los dos bordes siguen siendo RECTAS: 3,2 % y 8,2 %. De eso depende que el
    grafico pueda seguir dibujando la banda con cuatro puntos.
  */
  return {
    low: FIXED_COST_LOW + (FEE_RATE_LOW + ERIR_VARIABLE_RATE) * g,
    high: FIXED_COST_HIGH + (FEE_RATE_HIGH + ERIR_VARIABLE_RATE) * g,
  };
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
