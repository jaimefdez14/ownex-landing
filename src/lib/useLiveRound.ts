import { useSyncExternalStore } from "react";

/**
 * La emision en marcha, compartida por todas las pantallas que la enseñan.
 *
 * REHECHO EL 27/08/2026 COMO ESTADO UNICO DE MODULO. Antes cada llamada montaba su
 * propio `useState` y su propio intervalo, lo cual valia cuando solo lo usaba el
 * panel del hero. Ahora lo usan cuatro pantallas (hero, expediente, panel de
 * inversores y portal), y con un intervalo por pantalla cada una iria por su
 * cuenta: cuatro versiones distintas de la MISMA emision en la misma pagina.
 *
 * Con un estado unico, lo que se enseña deja de ser "cuatro maquetas que se
 * mueven" y pasa a ser una sola emision vista desde cuatro sitios. Que es
 * exactamente lo que el producto es, y el argumento que la seccion quiere hacer.
 *
 * `useSyncExternalStore` y no un contexto de React: es la API pensada para esto,
 * resuelve el renderizado en servidor con su tercer argumento (el prerenderizado
 * pinta los valores de partida, iguales a los del cliente en su primer
 * fotograma, asi que no hay salto al hidratar) y no obliga a envolver el arbol.
 */

const INICIO = { capital: 185250, accionistas: 247 };
const OBJETIVO = 250000;

/*
  Guion de suscripciones. Ciclico y fijo: mismo resultado en servidor y cliente.

  Los numeros no son decorativos. Suman 6000 en ocho entradas, o sea 750 de media,
  que es exactamente el ticket medio del que parte la emision (185.250 / 247 =
  750). Y ordenados de menor a mayor su mediana es 400, la otra cifra que el panel
  enseña al lado. Al cerrar cada ciclo de ocho, la media vuelve a ser 750 exacta.
*/
const TICKETS = [400, 250, 900, 400, 2000, 300, 400, 1350];

const CADA = 4200;

/*
  Donde se para la ronda. El capital nunca llega al objetivo, se queda 1000 por
  debajo: una barra de progreso que rebasa el 100 % delata que la cifra es de
  adorno.
*/
const TOPE = OBJETIVO - 1000;

export type Suscripcion = { importe: number; id: number };

export type Ronda = {
  capital: number;
  accionistas: number;
  ultima: Suscripcion;
  /*
    Reparto de una votacion abierta, para el portal del accionista. Se mueve con
    las suscripciones porque son los mismos accionistas los que votan, y oscila en
    una horquilla estrecha: una votacion que salta veinte puntos cada cuatro
    segundos no parece una votacion, parece una animacion.
  */
  votoA: number;
};

const ESTADO_INICIAL: Ronda = {
  capital: INICIO.capital,
  accionistas: INICIO.accionistas,
  ultima: { importe: TICKETS[0], id: 0 },
  votoA: 62,
};

let estado: Ronda = ESTADO_INICIAL;
const oyentes = new Set<() => void>();
let timer = 0;
let paso = 0;

const avisar = () => oyentes.forEach((f) => f());

const tick = () => {
  const importe = TICKETS[paso % TICKETS.length];

  /*
    LA RONDA SE PARA ENTERA, no solo el capital. Con solo el capital topado, el
    contador de accionistas seguia subiendo para siempre y el panel se volvia
    absurdo cuanto mas rato estuviera abierto: a la hora, 1104 accionistas para un
    capital congelado, o sea 226 € de ticket medio en una ronda que anuncia 750.
    Comprobando ANTES de aplicar nada, las dos cifras se detienen juntas.
  */
  if (estado.capital + importe > TOPE) {
    window.clearInterval(timer);
    timer = 0;
    return;
  }

  paso += 1;
  estado = {
    capital: estado.capital + importe,
    accionistas: estado.accionistas + 1,
    ultima: { importe, id: paso },
    votoA: 60 + (paso % 5),
  };
  avisar();
};

const subscribe = (alCambiar: () => void) => {
  oyentes.add(alCambiar);

  if (timer === 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer = window.setInterval(tick, CADA);
  }

  return () => {
    oyentes.delete(alCambiar);
    /*
      El intervalo se para cuando ya no queda nadie escuchando. No es limpieza
      preventiva: sin esto, una pantalla desmontada seguiria haciendo avanzar la
      ronda de fondo.
    */
    if (oyentes.size === 0 && timer !== 0) {
      window.clearInterval(timer);
      timer = 0;
    }
  };
};

const leer = () => estado;
const leerEnServidor = () => ESTADO_INICIAL;

export function useLiveRound() {
  const ronda = useSyncExternalStore(subscribe, leer, leerEnServidor);

  return {
    ...ronda,
    /*
      Derivado, nunca a fuego: es una division de las otras dos cifras, asi que
      escrito aparte dejaria de cuadrar con ellas en cuanto entre una suscripcion.
    */
    ticketMedio: Math.round(ronda.capital / ronda.accionistas),
    /*
      `floor` y no `round`: con 249.000 de 250.000, redondear da 100 y el panel
      anunciaria el objetivo cumplido con mil euros aun por captar.
    */
    progreso: Math.floor((ronda.capital / OBJETIVO) * 100),
    objetivo: OBJETIVO,
  };
}
