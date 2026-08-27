import { useEffect, useState } from "react";

/**
 * La ronda del panel del hero, en marcha.
 *
 * El panel enseñaba una captura congelada: un capital fijo, una barra parada y
 * una fila de actividad que decía "hace 2 min" para siempre. Es la primera
 * pantalla del sitio y lo único que se movía en ella era el conteo inicial de
 * las cifras.
 *
 * Esto lo pone en marcha: cada pocos segundos entra una suscripción nueva, el
 * capital sube, la barra avanza y el contador de accionistas se incrementa. No
 * es decoración: es exactamente lo que el producto hace, y verlo pasar dice más
 * que el párrafo que hay al lado.
 *
 * Tres decisiones deliberadas:
 *
 *  - Los importes salen de una lista fija y ciclan, no son aleatorios. Un
 *    `Math.random()` daría cifras distintas en el servidor y en el cliente y
 *    rompería la hidratación; además así el guion es el mismo para todo el
 *    mundo y se puede razonar sobre él.
 *  - Arranca en los valores de siempre (185.250 €, 247 accionistas) y sube desde
 *    ahí, así que el HTML prerenderizado y el primer fotograma coinciden.
 *  - Se detiene con `prefers-reduced-motion`.
 *
 * Hubo una version que ademas condicionaba el ARRANQUE a
 * `document.visibilityState === "visible"`. Se retiro: no hacia falta, porque
 * `setInterval` no acumula disparos en una pestana oculta (el navegador lo
 * ralentiza, no lo encola), y en cambio si anadia un modo de fallo real: en
 * cualquier contexto que reporte `hidden` de mas, la ronda no arrancaba nunca y
 * el panel se quedaba congelado. Menos condiciones, menos formas de romperse.
 */

const INICIO = { capital: 185250, accionistas: 247 };
const OBJETIVO = 250000;

/*
  Guion de suscripciones. Ciclico y fijo: mismo resultado en servidor y cliente.

  REVISADO EL 27/08/2026, Y LOS NUMEROS NO SON DECORATIVOS. Suman 6000 en ocho
  entradas, o sea 750 de media, que es exactamente el ticket medio del que parte
  el panel (185.250 / 247 = 750). Y ordenados de menor a mayor su mediana es 400,
  que es la otra cifra que el panel enseña al lado.

  Eso hace que la aritmetica se sostenga sola: al cerrar cada ciclo de ocho, la
  media vuelve a ser 750 exacta ((185250 + 6000) / (247 + 8) = 750). El guion
  anterior sumaba 10.700 y llevaba la media real a 847 mientras el panel seguia
  enseñando 750 a fuego.
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

export function useLiveRound() {
  const [capital, setCapital] = useState(INICIO.capital);
  const [accionistas, setAccionistas] = useState(INICIO.accionistas);
  const [ultima, setUltima] = useState<Suscripcion>({ importe: TICKETS[0], id: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paso = 0;
    let acumulado = INICIO.capital;

    /*
      LA RONDA SE PARA ENTERA, no solo el capital.

      Antes el capital se topaba con un `Math.min` pero el contador de accionistas
      seguia subiendo para siempre. El panel se volvia absurdo cuanto mas rato lo
      tuvieras abierto: a los cinco minutos eran 318 accionistas para 249.000
      euros; a la hora, 1104 accionistas para el mismo capital congelado, o sea
      226 euros de ticket medio en una ronda que anuncia 750.

      Ahora la condicion se comprueba ANTES de aplicar nada y para el intervalo,
      asi que las dos cifras se detienen juntas y la ronda se queda en un estado
      coherente indefinidamente. Que es ademas lo que hace una ronda real cuando
      se acerca a su objetivo: dejar de aceptar.
    */
    const tick = () => {
      const importe = TICKETS[paso % TICKETS.length];

      if (acumulado + importe > TOPE) {
        window.clearInterval(timer);
        return;
      }

      paso += 1;
      acumulado += importe;
      setUltima({ importe, id: paso });
      setAccionistas((n) => n + 1);
      setCapital(acumulado);
    };

    const timer = window.setInterval(tick, CADA);
    return () => window.clearInterval(timer);
  }, []);

  return {
    capital,
    accionistas,
    ultima,
    /*
      Derivado, nunca a fuego. Es la cifra que el panel enseña al lado del capital
      y del numero de accionistas, asi que si se escribe aparte deja de cuadrar
      con ellas en cuanto entra la primera suscripcion.
    */
    ticketMedio: Math.round(capital / accionistas),
    /*
      `floor` y no `round`: con 249.000 de 250.000, redondear da 100 y el panel
      anunciaba el objetivo cumplido con mil euros aun por captar.
    */
    progreso: Math.floor((capital / OBJETIVO) * 100),
    objetivo: OBJETIVO,
  };
}
