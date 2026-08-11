/**
 * Formato de cifras en espanol (§4.1): punto de millar, coma decimal, espacio duro
 * antes de € y %. Sin `toLocaleString`: el conteo ascendente corre en el servidor
 * (durante el prerenderizado) y en el navegador (al hidratar), y las dos ejecuciones
 * tienen que producir exactamente el mismo texto o React marca un desajuste de
 * hidratacion. Una funcion propia y deterministica elimina ese riesgo.
 */

const NB = " ";

function withThousands(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const formatInt = (value: number): string => withThousands(value);

export const formatEuros = (value: number): string => `${withThousands(value)}${NB}€`;

export const formatPercent = (value: number): string => `${Math.round(value)}${NB}%`;
