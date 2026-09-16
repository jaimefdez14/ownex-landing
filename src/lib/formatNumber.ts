/**
 * Formato de cifras en espanol (§4.1): punto de millar, coma decimal, espacio duro
 * antes de € y %. Sin `toLocaleString`: el conteo ascendente corre en el servidor
 * (durante el prerenderizado) y en el navegador (al hidratar), y las dos ejecuciones
 * tienen que producir exactamente el mismo texto o React marca un desajuste de
 * hidratacion. Una funcion propia y deterministica elimina ese riesgo.
 *
 * Y EN INGLES DESDE EL 16/09/2026. La version inglesa no hereda la microtipografia
 * espanola, porque en ingles ese formato no se lee como estilo sino como error: una
 * cifra "150.000 €" en una pagina inglesa parece un precio de ciento cincuenta euros
 * mal escrito. Alli va coma de millar, punto decimal, el simbolo del euro DELANTE y
 * pegado ("€150,000") y el porcentaje pegado a la cifra ("7.0%"), que es como lo
 * escriben la prensa financiera y los documentos de la UE en ingles.
 *
 * Los componentes no importan las funciones sueltas: piden el juego del idioma
 * activo con `useFormat()` (`i18n/format.ts`). Las exportaciones espanolas de abajo
 * se quedan porque son el formato de referencia del sitio.
 */

const NB = " ";

function withThousands(value: number, separator: string): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

export type Formatters = {
  int: (value: number) => string;
  euros: (value: number) => string;
  percent: (value: number) => string;
  /** Porcentaje con un decimal, para la dilución y el coste efectivo. */
  percentDecimal: (value: number) => string;
  /** Horquilla de porcentajes con la unidad una sola vez. */
  percentRange: (low: number, high: number) => string;
  /** Importe abreviado para una pastilla: "1,5 M€" / "€1.5M". */
  compactEuros: (value: number) => string;
};

export const formatInt = (value: number): string => withThousands(value, ".");

export const formatEuros = (value: number): string => `${withThousands(value, ".")}${NB}€`;

export const formatPercent = (value: number): string => `${Math.round(value)}${NB}%`;

/**
 * Porcentaje con un decimal, para la dilución. Un entero no vale ahí: entre el
 * 3 % y el 4 % de una empresa hay una diferencia que un fundador nota, y
 * redondear a entero la escondía. `toFixed` es deterministico, asi que el
 * prerenderizado y la hidratacion producen el mismo texto.
 */
export const formatPercentDecimal = (value: number): string =>
  `${value.toFixed(1).replace(".", ",")}${NB}%`;

/**
 * Horquilla de porcentajes: "11,8-15,1 %", con la unidad UNA sola vez.
 *
 * POR QUE NO ES `formatPercentDecimal(low) + " a " + formatPercentDecimal(high)`,
 * que es como se escribe la horquilla de euros del simulador - 04/09/2026.
 *
 * Porque no es el mismo caso. En euros son dos importes y el simbolo pertenece a
 * cada uno ("16.000 € a 27.000 €"); en porcentaje la unidad es comun a los dos
 * extremos, asi que repetirla dice dos veces lo mismo. Es ademas como se escribe
 * una horquilla de tipos en cualquier documento financiero.
 *
 * Y resuelve un roto medido: "11,8 % a 15,1 %" a 20px no cabe en la celda de
 * telefono (necesita 160px sobre 150 disponibles), asi que se partia en dos lineas
 * cortando por el nexo, y la segunda linea empezaba por "a 15,1 %", que se lee como
 * si fuera otra cifra distinta. Con la unidad una sola vez cabe de sobra.
 *
 * El separador es un guion normal, no una raya: `check:copy` prohibe la raya y la
 * semirraya en el copy (§4.1).
 */
export const formatPercentRange = (low: number, high: number): string =>
  `${low.toFixed(1).replace(".", ",")}-${high.toFixed(1).replace(".", ",")}${NB}%`;

/*
  Los importes grandes se abrevian en las pastillas del simulador: "10.000.000 €" no
  cabe. El decimal va con COMA en espanol porque `1500 / 1000` devuelve en JavaScript
  "1.5", que se colaba tal cual en la pastilla como "1.5k €".
*/
function compact(value: number, decimal: string, render: (n: string, unit: "M" | "k") => string) {
  const n = (x: number) => String(x).replace(".", decimal);
  if (value >= 1000000) return render(n(value / 1000000), "M");
  if (value >= 1000) return render(n(value / 1000), "k");
  return null;
}

const es: Formatters = {
  int: formatInt,
  euros: formatEuros,
  percent: formatPercent,
  percentDecimal: formatPercentDecimal,
  percentRange: formatPercentRange,
  compactEuros: (value) =>
    compact(value, ",", (n, unit) => (unit === "M" ? `${n}${NB}M€` : `${n}k${NB}€`)) ?? formatEuros(value),
};

const enInt = (value: number) => withThousands(value, ",");
const enEuros = (value: number) => `€${enInt(value)}`;

const en: Formatters = {
  int: enInt,
  euros: enEuros,
  percent: (value) => `${Math.round(value)}%`,
  percentDecimal: (value) => `${value.toFixed(1)}%`,
  percentRange: (low, high) => `${low.toFixed(1)}-${high.toFixed(1)}%`,
  compactEuros: (value) => compact(value, ".", (n, unit) => `€${n}${unit}`) ?? enEuros(value),
};

export const FORMATS = { es, en } as const;
