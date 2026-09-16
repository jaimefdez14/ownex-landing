/**
 * Logica de la calculadora en su modalidad de DEUDA (§2.4).
 *
 * NUEVO EL 04/09/2026, a peticion de Jaime: la misma calculadora tenia que poder
 * responder "cuanto me sale financiarme con deuda en vez de cediendo equity".
 *
 * De donde salen los numeros
 * --------------------------
 * De la misma fuente que el modelo de equity: la hoja `Supuestos` de
 * `OwnEX_Modelo-Financiero_v1.xlsx`, mas la pestana `Cliente-Deuda`, que es la que
 * define que se le cobra a la marca y con que formula se calcula el coste
 * efectivo. El business case interno del instrumento de deuda
 * (`OwnEX_Business-Case-Deuda_v1.md`) aporta el rango del fee recurrente. Nada de
 * lo que hay aqui esta inventado ni interpolado.
 *
 * QUE CAMBIA RESPECTO A EQUITY, Y QUE NO
 * ======================================
 *
 * NO cambia casi nada del coste de ESTRUCTURAR. Es la intuicion de Jaime al pedir
 * esto y el modelo la confirma: abogados, validacion de la entidad autorizada,
 * registro digital y alta de inversores cuestan practicamente lo mismo se emita
 * lo que se emita. La unica diferencia real es que en deuda NO se constituye
 * vehiculo: emite la propia sociedad de la marca. Eso se lleva por delante dos
 * partidas de la hoja `Supuestos` que en equity si estan:
 *
 *     constitucion del vehiculo + registro mercantil (B14)   2.000 €
 *     notaria de cierre de la emision (B15)                    700 €
 *
 * O sea unos 2.700 € menos. Aplicado sobre el suelo declarado de equity
 * (13.000 a 17.000 €, ver `capitalEstimate.ts`) y redondeando al millar como
 * manda esa misma decision, el suelo de deuda queda en 11.000 a 15.000 €. La
 * ANCHURA de la horquilla se conserva a proposito: la incertidumbre que mide son
 * los honorarios del trabajo legal, y ese trabajo es el mismo.
 *
 * La comision de exito y la fee variable del registro se importan de
 * `capitalEstimate.ts` sin tocarlas, porque en la hoja `Supuestos` son las mismas
 * en las dos modalidades (5 % en `B6` y en `B8`).
 *
 * SI CAMBIA, y es lo que hace de esto otra calculadora y no la misma con otro
 * rotulo, todo lo que pasa DESPUES de captar:
 *
 *   1. Hay un cupon. La marca paga un interes anual a sus inversores durante toda
 *      la vida del instrumento. En equity no existe esta partida: no se devuelve
 *      nada, se cede propiedad.
 *   2. Hay un plazo. El coste deja de ser un pago unico y pasa a ser una serie.
 *   3. Hay un mantenimiento anual del registro digital mientras el instrumento
 *      vive (`Supuestos!B19`, marcado "solo Deuda").
 *   4. NO hay dilucion. La cifra que ocupaba ese sitio en pantalla pasa a ser el
 *      coste efectivo anual, que es su equivalente: la magnitud con la que un
 *      fundador decide.
 *
 * EL MANTENIMIENTO ANUAL DEL REGISTRO LLEVA UN MINIMO, Y MANDA -- 05/09/2026
 * =========================================================================
 * CORRECCION DE JAIME, y es la mas importante de todo este fichero. Aqui habia un
 * 0,3 % anual sobre el capital vivo, sin suelo, que es lo que dicen las dos fuentes
 * internas: la celda B19 de `Supuestos` ("ERIR -- mantenimiento anual, solo Deuda" =
 * 0,003) y el business case del instrumento ("0,30 % sobre outstanding, anual").
 *
 * Las dos estan equivocadas. La tarifa real del ERIR es **0,2 % anual sobre la emision
 * con un minimo de 12.000 € al ano**. Jaime lo corrige desde la relacion con Ursus-3;
 * las dos fuentes internas son estimaciones de junio y quedan superadas.
 *
 * POR QUE ESTE NUMERO CAMBIA EL PRODUCTO Y NO SOLO LA CIFRA. El minimo se alcanza a los
 * 6.000.000 € de emision (12.000 / 0,002). Por debajo de esa cifra -- o sea en TODAS las
 * operaciones que este simulador propone -- no se paga el 0,2 %: se pagan 12.000 € al
 * ano, fijos, cueste lo que cueste la emision. Medido sobre el capital captado:
 *
 *     150.000 € de emision  ->  12.000 €/ano  =  8,00 % anual
 *     250.000 €             ->  12.000 €/ano  =  4,80 %
 *     500.000 €             ->  12.000 €/ano  =  2,40 %
 *   1.500.000 €             ->  12.000 €/ano  =  0,80 %
 *   6.000.000 €             ->  12.000 €/ano  =  0,20 %  <- aqui deja de mandar el minimo
 *
 * En el escenario de partida el mantenimiento pasa a costar MAS que el cupon, y el coste
 * efectivo anual sube de 9,5-17,3 % a 17,8-26,2 %. No es un ajuste: es la diferencia
 * entre una operacion cara y una que no tiene sentido a ese tamano.
 *
 * LA HORQUILLA. El extremo bajo es el minimo del ERIR a secas. El alto le suma la fee de
 * gestion anual de Ownex del 0,75 % que propone el business case (la hoja `Supuestos` la
 * pone hoy en cero, celda B9), por la misma politica de siempre: la pagina estima el
 * coste arriba, nunca abajo.
 *
 * CONSECUENCIA TECNICA: EL MANTENIMIENTO YA NO ES LINEAL en el capital. `Math.max` mete
 * un quiebro en 6.000.000 €, y el grafico dibuja la banda con los vertices justos. Por
 * eso `QUIEBRO_MANTENIMIENTO` se exporta: la seccion se lo pasa al grafico para que meta
 * ese punto en la ruta cuando cae dentro del dominio. Sin eso la banda se dibujaria como
 * una recta entre los extremos y se saltaria el codo.
 *
 * DEVOLUCION AL VENCIMIENTO, NO AMORTIZACION PROGRESIVA
 * -----------------------------------------------------
 * El cupon se calcula sobre el principal entero durante todo el plazo, y el
 * principal se devuelve al final. Es lo que hace la pestana `Cliente-Deuda` del
 * modelo (su TEA aplica el cupon al capital vivo sin reducirlo ano a ano) y es la
 * forma habitual de una emision de obligaciones. Si algun dia el producto ofrece
 * cuadro de amortizacion, esa variante entra aqui y cambia dos formulas: los
 * intereses totales y el mantenimiento, que dejarian de ir sobre el nominal
 * entero.
 *
 * EL COSTE EFECTIVO ANUAL ES UNA TIR, Y ANTES NO LO ERA -- 05/09/2026
 * ==================================================================
 * Hasta hoy esta cifra se calculaba como la celda B36 de `Cliente-Deuda`: cupon mas
 * mantenimiento mas los gastos de emision repartidos linealmente entre los anos. El
 * propio modelo la declara "TEA aprox.", y aprox. lo era: es una media aritmetica
 * simple, no descuenta flujos y no capitaliza.
 *
 * Se midio la diferencia contra la tasa de verdad antes de tocar nada, y no es un
 * detalle: entre **0,15 y 3,6 puntos porcentuales** segun el escenario, y SIEMPRE en la
 * misma direccion, la formula simple SUBESTIMA el coste. En el escenario de partida el
 * extremo alto salia 15,07 % cuando la tasa real es 17,27; con cupon 12+5 salia
 * 24,07 % contra 27,70.
 *
 * Esa direccion es la que obliga a corregirlo. Esta calculadora tiene una politica
 * escrita desde el 31/08: estima el coste ARRIBA, nunca abajo, para que nadie llegue a
 * una llamada con una cifra mejor de la que le van a dar. Una aproximacion que se queda
 * corta por tres puntos la incumple. Y el rotulo la empeoraba: "efectivo" es
 * precisamente la palabra que en finanzas significa "descontando flujos".
 *
 * AHORA ES LA TASA QUE IGUALA lo que la marca recibe de verdad con el valor actual de
 * todo lo que paga:
 *
 *     neto recibido  =  bruto - gastos de emision
 *     cada ano       =  bruto x (cupon + mantenimiento)
 *     al vencimiento =  ademas, el principal entero
 *
 * Se resuelve por biseccion, que es deterministica: el prerenderizado y la hidratacion
 * producen el mismo numero al bit, que es lo que este sitio necesita (mismo criterio que
 * `formatNumber.ts` para no usar `toLocaleString`).
 *
 * QUE SE APARTA DEL MODELO, y queda dicho: `Cliente-Deuda!B36` sigue calculando la media
 * simple. No es la primera correccion deliberada de este tipo -- `capitalEstimate.ts` ya
 * corrige la dilucion de la celda B45, que el modelo calcula sobre pre-money en vez de
 * post-money. En los dos casos el modelo vale para lo que se hizo y la pagina publica
 * necesita ser exacta en la cifra que ensena.
 *
 * LO QUE NO CAMBIA: la banda del grafico. Dibuja EUROS pagados a lo largo del plazo, sin
 * descontar, y eso sigue siendo correcto y sigue siendo lineal en el capital, que es de
 * lo que depende que se pueda trazar con cuatro puntos. Son dos vistas distintas y las
 * dos ciertas: cuanto sale por la puerta, y a que tasa sale.
 */

import { ERIR_VARIABLE_RATE, FEE_RATE_HIGH, FEE_RATE_LOW } from "./capitalEstimate";

/** Suelo fijo de la operacion de deuda, en euros. Ver el docblock. */
export const DEBT_FIXED_COST_LOW = 11000;
export const DEBT_FIXED_COST_HIGH = 15000;

/** Tarifa anual del registro digital: 0,2 % de la emision con un minimo. Ver el docblock. */
export const ERIR_ANUAL_RATE = 0.002;
export const ERIR_ANUAL_MINIMO = 12000;

/** Fee de gestion anual de Ownex, solo en el extremo alto de la horquilla. */
export const MGMT_ANUAL_RATE = 0.0075;

/**
 * Tamano de emision a partir del cual el 0,2 % supera al minimo de 12.000 €. Por debajo
 * manda el minimo, asi que el coste anual es plano; por encima crece con la emision. Es
 * el unico punto donde el mantenimiento cambia de pendiente, y el grafico necesita
 * saberlo para no dibujar la banda saltandose el codo.
 */
export const QUIEBRO_MANTENIMIENTO = ERIR_ANUAL_MINIMO / ERIR_ANUAL_RATE;

/** Mantenimiento anual, EN EUROS (no en tanto por uno: el minimo no es un porcentaje). */
export function mantenimientoAnual(gross: number): { low: number; high: number } {
  const g = Math.max(0, gross);
  const erir = Math.max(g * ERIR_ANUAL_RATE, ERIR_ANUAL_MINIMO);
  return { low: erir, high: erir + g * MGMT_ANUAL_RATE };
}

/*
  Supuestos de partida, y conviene ser exacto sobre que esta anclado y que no.

  LA SUMA SI LO ESTA: 5 + 3 son los 8 % de la celda B6 de `Cliente-Deuda`, el cupon
  que ya tenia el modelo canonico. Ahi no se ha inventado nada.

  EL REPARTO ENTRE LOS DOS, NO. Ninguna de las cinco emisiones comparables paga un
  tramo fijo, asi que no hay de donde sacar la proporcion: no dicen nada sobre ella.
  Y la unica referencia que si tiene tramo fijo, ENISA, publica la horquilla de ESE
  tramo (4,75 % a 6,25 %) pero no cuanto pesa el variable encima.

  Asi que el 5 es una eleccion: cae dentro de la horquilla de ENISA, por su mitad
  baja, y deja un 3 de residuo que es una cifra redonda. No es el centro de esa
  horquilla (el centro es 5,5) ni sale de ningun documento. Es el reparto mas
  conservador que cuadra con el total que ya estaba fijado, y esta puesto para que
  Jaime lo mueva: si el fijo sube a 6, el variable baja a 2 y el total no cambia.
*/
export const CUPON_FIJO_POR_DEFECTO = 5;
export const CUPON_VARIABLE_POR_DEFECTO = 3;
export const PLAZO_POR_DEFECTO = 3;

/*
  Atajos de la interfaz.

  LOS DE LOS CUPONES SON TRES Y NO CUATRO. Los dos campos comparten una fila de dos
  columnas para que la tarjeta de deuda ocupe lo mismo que la de equity, y en los
  ~154px que le tocan a cada uno solo caben tres pastillas (ver la variante compacta de
  `Presets` en `CalculatorSection.tsx`). La cuarta partiria la fila en dos renglones,
  que es justo el alto que la compresion existe para no gastar.

  QUE TRES, EN EL FIJO: 5, 10 y 12 %, elegidos por Jaime el 05/09/2026. No son tres
  escalones de una misma zona sino tres POSICIONES distintas, que es mas util para
  tantear: el 5 es la horquilla de ENISA (4,75-6,25 %), el 10 y el 12 llevan a totales
  del orden de lo que hoy se coloca en el mercado y por encima.

  Queda dicho, porque el dato existe y no conviene que se pierda: con el fijo en 12 y el
  variable en 5 el cupon total son 17 %, por encima del rango que comunican las
  emisiones comparables (8,5 % a 12,8 % anual, ver el docblock de arriba). La eleccion
  es de Jaime y esta tomada a sabiendas.

  EN EL VARIABLE, el CERO es el atajo que de verdad importa -- deja ver de un toque
  cuanto cuesta la parte que se paga pase lo que pase -- y por encima quedan el valor de
  partida y uno agresivo.

  El plazo conserva sus cuatro: va a ancho completo de la columna, asi que le caben.
*/
export const TRAMOS_CUPON_FIJO = [5, 10, 12];
export const TRAMOS_CUPON_VARIABLE = [0, 3, 5];
export const TRAMOS_PLAZO = [2, 3, 5, 7];

/**
 * Coste de ESTRUCTURAR la emision de deuda: lo que se paga una sola vez, antes de
 * que el instrumento empiece a vivir. Misma forma que `costRangeForGross` en
 * equity (dos rectas con suelo y pendiente distintos, asi que la horquilla se
 * ensancha con el tamano de la operacion) y mismo motivo para sumar la fee
 * variable del registro al tipo en lugar de dejarla como termino aparte: mantiene
 * los dos bordes RECTOS, que es de lo que depende que el grafico los pueda dibujar
 * con cuatro puntos.
 */
export function setupRangeForGross(gross: number): { low: number; high: number } {
  const g = Math.max(0, gross);
  return {
    low: DEBT_FIXED_COST_LOW + (FEE_RATE_LOW + ERIR_VARIABLE_RATE) * g,
    high: DEBT_FIXED_COST_HIGH + (FEE_RATE_HIGH + ERIR_VARIABLE_RATE) * g,
  };
}

export type DebtTerms = {
  /** Cupon fijo anual: se paga pase lo que pase. En tanto por ciento (5 = 5 %). */
  couponFixed: number;
  /** Tramo variable anual: solo se paga si el negocio llega. En tanto por ciento. */
  couponVariable: number;
  /** Plazo del instrumento, en anos. */
  years: number;
};

/**
 * Coste TOTAL de la financiacion durante toda la vida del instrumento: lo que
 * cuesta estructurarla mas todo lo que se paga hasta devolverla. Es la funcion que
 * dibuja el grafico en modalidad de deuda, y la que hace que la comparacion con
 * equity sea honesta: en equity el eje de coste solo puede llevar el coste de
 * estructurar, porque lo que de verdad se paga alli es propiedad y eso no son
 * euros; en deuda ese mismo eje si puede llevar la factura entera.
 */
export function totalCostRangeForGross(
  gross: number,
  { couponFixed, couponVariable, years }: DebtTerms,
): { low: number; high: number } {
  const g = Math.max(0, gross);
  const t = Math.max(0, years);
  const setup = setupRangeForGross(g);
  const fijo = g * (Math.max(0, couponFixed) / 100) * t;
  const variable = g * (Math.max(0, couponVariable) / 100) * t;
  const man = mantenimientoAnual(g);

  return {
    low: setup.low + fijo + man.low * t,
    high: setup.high + fijo + variable + man.high * t,
  };
}

/**
 * Tasa anual que iguala el valor actual de los pagos con el neto recibido.
 *
 * Biseccion y no Newton: no necesita derivada, no diverge y termina en un numero fijo de
 * vueltas, asi que da el mismo resultado en el servidor y en el navegador.
 *
 * El intervalo de busqueda llega al 500{NB}%. No es un capricho: si el escenario es tan
 * pequeno que los gastos de emision se comen el bruto (un inversor con el ticket minimo),
 * el neto recibido es cero o negativo y no existe tasa que iguale nada. En ese caso la
 * biseccion devuelve el tope del intervalo, que es una cifra absurda para un escenario
 * absurdo -- y que la pantalla nunca llega a pedir, porque ese caso cae en el estado
 * "faltan supuestos" de la seccion.
 */
function tasaEfectiva(neto: number, pagoAnual: number, principal: number, years: number): number {
  if (neto <= 0 || years <= 0) return 5;

  const valorActual = (r: number) => {
    let v = -neto;
    for (let i = 1; i <= years; i += 1) {
      v += (pagoAnual + (i === years ? principal : 0)) / Math.pow(1 + r, i);
    }
    return v;
  };

  let bajo = 0;
  let alto = 5;
  /* 100 vueltas dejan el intervalo por debajo de la precision de un double. */
  for (let k = 0; k < 100; k += 1) {
    const medio = (bajo + alto) / 2;
    if (valorActual(medio) > 0) bajo = medio;
    else alto = medio;
  }
  return (bajo + alto) / 2;
}

export type DebtEstimateInput = {
  investors: number;
  avgTicket: number;
} & DebtTerms;

export type DebtEstimateResult = {
  /** Capital que se puede captar en este escenario: inversores x ticket medio. */
  gross: number;
  /** Extremos del coste de estructurar, que se paga una sola vez. */
  setupLow: number;
  setupHigh: number;
  /** Extremos del capital que llega de verdad a la cuenta: bruto menos ese coste. */
  netLow: number;
  netHigh: number;
  /** Cupon FIJO pagado durante todo el plazo, en euros. Se paga pase lo que pase. */
  interestFixed: number;
  /** Tramo VARIABLE durante todo el plazo, en euros. Solo si el negocio llega. */
  interestVariable: number;
  /** Extremos del coste total de la financiacion durante todo el plazo. */
  totalCostLow: number;
  totalCostHigh: number;
  /** Principal mas cupon fijo: el suelo de lo que la marca devuelve. */
  repaymentLow: number;
  /** Principal mas cupon fijo y variable: el techo. */
  repaymentHigh: number;
  /** Extremos del coste efectivo anual, en tanto por ciento. Tasa interna, no media. */
  annualRateLow: number;
  annualRateHigh: number;
};

export function estimateDebt({
  investors,
  avgTicket,
  couponFixed,
  couponVariable,
  years,
}: DebtEstimateInput): DebtEstimateResult {
  const gross = investors * avgTicket;
  const t = Math.max(1, years);
  const fijo = Math.max(0, couponFixed) / 100;
  const variable = Math.max(0, couponVariable) / 100;

  const setup = setupRangeForGross(gross);
  const interestFixed = gross * fijo * t;
  const interestVariable = gross * variable * t;
  const total = totalCostRangeForGross(gross, { couponFixed, couponVariable, years: t });

  /*
    Los dos extremos son dos operaciones distintas, no la misma con un margen: la de
    abajo paga solo el cupon fijo, tiene el mantenimiento bajo y unos gastos de emision
    bajos; la de arriba paga tambien el variable, con el mantenimiento y los gastos
    altos. Cada una tiene su propia tasa.
  */
  const man = mantenimientoAnual(gross);
  const tasaLow = tasaEfectiva(gross - setup.low, gross * fijo + man.low, gross, t);
  const tasaHigh = tasaEfectiva(gross - setup.high, gross * (fijo + variable) + man.high, gross, t);

  return {
    gross,
    setupLow: setup.low,
    setupHigh: setup.high,
    netLow: gross - setup.high,
    netHigh: gross - setup.low,
    interestFixed,
    interestVariable,
    totalCostLow: total.low,
    totalCostHigh: total.high,
    repaymentLow: gross + interestFixed,
    repaymentHigh: gross + interestFixed + interestVariable,
    /*
      El extremo bajo lleva SOLO el cupon fijo y el alto los dos, que es lo que convierte
      esta horquilla en la respuesta a "cuanto me cuesta si va mal y cuanto si va bien".
    */
    annualRateLow: tasaLow * 100,
    annualRateHigh: tasaHigh * 100,
  };
}
