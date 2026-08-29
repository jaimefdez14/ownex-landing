import { useSyncExternalStore } from "react";

/**
 * El numero de inversores del escenario, compartido entre el cebo del hero y la
 * calculadora.
 *
 * NUEVO EL 29/08/2026, con el campo cebo de la primera pantalla.
 *
 * El cebo del hero y la calculadora estiman LO MISMO con distinto nivel de
 * detalle: si el visitante toca "250" arriba y catorce pantallas despues la
 * calculadora le recibe con 100, el cebo deja de ser una entrada al calculo y
 * pasa a ser un cartel que dice otra cosa. Peor aun: le obliga a volver a
 * decidir una cifra que ya habia decidido.
 *
 * Con el numero aqui, la calculadora ya esta puesta en su escenario cuando el
 * ancla le deja delante. El resto de supuestos (ticket medio y valoracion) se
 * quedan donde estaban, en el estado local de la calculadora: el cebo no los
 * pregunta, asi que no tiene nada que decir sobre ellos.
 *
 * Mismo mecanismo que `useLiveRound` y por el mismo motivo: `useSyncExternalStore`
 * resuelve el prerenderizado con su tercer argumento (servidor y primer
 * fotograma del cliente leen el mismo valor de partida, asi que no hay salto al
 * hidratar) y no obliga a envolver el arbol en un contexto para compartir un
 * unico entero entre dos secciones que no se conocen.
 */

/*
  LOS SUPUESTOS DE PARTIDA VIVEN AQUI, no en `CalculatorSection`.

  Estaban en su `DEFAULTS` local, que valia mientras la calculadora era el unico
  sitio que estimaba nada. Ahora el cebo del hero estima con el MISMO ticket
  medio, y la cifra que promete arriba tiene que ser exactamente la que el
  visitante encuentra abajo al llegar. Dos constantes con el mismo numero escrito
  en dos ficheros distintos duran hasta que alguien cambia una.

  `CalculatorSection` los importa de aqui; el cebo del hero solo necesita el
  ticket, y la valoracion no la pregunta ninguno de los dos.
*/
export const INVERSORES_POR_DEFECTO = 100;

/*
  Los atajos de numero de inversores. Los usan las pastillas del cebo del hero y
  las de la calculadora, y son LOS MISMOS a proposito: si el hero ofreciera unos
  tramos y la calculadora otros, el valor elegido arriba podria llegar abajo sin
  ninguna pastilla marcada, y una fila de atajos donde ninguno esta activo se lee
  como un control roto.

  Por eso el valor por defecto tiene que ser uno de la lista: al pintarse el hero
  hay siempre un tramo marcado y una cifra que se corresponde con el.
*/
export const TRAMOS_INVERSORES = [50, 100, 250, 500];
export const TICKET_POR_DEFECTO = 1500;
export const PREMONEY_POR_DEFECTO = 2000000;

let inversores = INVERSORES_POR_DEFECTO;
const oyentes = new Set<() => void>();

const subscribe = (alCambiar: () => void) => {
  oyentes.add(alCambiar);
  return () => {
    oyentes.delete(alCambiar);
  };
};

const leer = () => inversores;
const leerEnServidor = () => INVERSORES_POR_DEFECTO;

function fijar(valor: number) {
  if (valor === inversores) return;
  inversores = valor;
  oyentes.forEach((avisar) => avisar());
}

/** Devuelve el numero de inversores del escenario y como cambiarlo. */
export function useInvestors(): [number, (valor: number) => void] {
  return [useSyncExternalStore(subscribe, leer, leerEnServidor), fijar];
}
