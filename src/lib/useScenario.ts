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

  LOS TRAMOS SE ABREN, 31/08/2026, a peticion de Jaime: eran 50, 100, 250 y 500 y
  pasan a 100, 500, 1.000 y 5.000. Se va el 50 (el escenario mas pequeno ya no
  entra) y el techo se multiplica por diez.

  EL TECHO SE PUSO PRIMERO EN 10.000 Y SE BAJO A 5.000 EL MISMO DIA. 10.000
  inversores por el ticket de partida son 15 M€, y eso pasaba por encima del
  limite de importe del art. 35.2.b de la Ley 6/2023 (8 M€ en 12 meses), que es la
  exencion de folleto sobre la que se apoya el producto entero. Una calculadora
  que ofrece de un toque un escenario que la propia operacion no puede hacer no es
  un cebo, es una promesa que no se puede cumplir. A 5.000 el bruto se queda en
  7,5 M€, por debajo de ese techo.

  EL MODELO DE COSTE YA CUBRE ESTE TAMANO -- 31/08/2026, mismo dia, poco despues.
  Cuando se subieron los tramos, `lib/capitalEstimate.ts` se declaraba valido solo
  "hasta 1,5 M€ de captacion bruta" y avisaba de que por encima faltaba una fee
  variable de ERIR. Esa fee ya esta puesta: 0,2 % sobre el bruto, tomado de la hoja
  `Supuestos` del modelo financiero canonico y aplicado en todo el rango (en la
  fuente arranca en 1,5 M€, pero el escalon se descarto por ser demasiado detalle
  para una calculadora de alto nivel -- el porque, en ese archivo). El tramo de
  5.000 pasa de 238.000-617.000 € a 253.000-632.000 €.

  LO QUE EL CAMBIO NO ARREGLA: LA DILUCION, y no es culpa del tramo. Con la
  valoracion de partida (2 M€ pre-money) sale asi, medido:

      100 inversores -> 150.000 € de bruto ->  7,0 % de dilucion
      500            -> 750.000 €           -> 27,3 %
    1.000            -> 1,5 M€              -> 42,9 %
    5.000            -> 7,5 M€              -> 78,9 %

  O sea que el problema no esta en el tramo de arriba: ya en 500 el fundador cede
  mas de una cuarta parte, y en 1.000 casi la mitad. Lo que empuja esos numeros es
  el pre-money de 2 M€, que este cebo ni pregunta y que la calculadora trae como
  valor de partida. Si algun dia molesta, se toca ahi (`PREMONEY_POR_DEFECTO`), no
  en esta lista.
*/
export const TRAMOS_INVERSORES = [100, 500, 1000, 5000];
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
