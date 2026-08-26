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

/** Guion de suscripciones. Ciclico y fijo: mismo resultado en servidor y cliente. */
const TICKETS = [250, 1000, 500, 2500, 750, 400, 5000, 300];

const CADA = 4200;

export type Suscripcion = { importe: number; id: number };

export function useLiveRound() {
  const [capital, setCapital] = useState(INICIO.capital);
  const [accionistas, setAccionistas] = useState(INICIO.accionistas);
  const [ultima, setUltima] = useState<Suscripcion>({ importe: TICKETS[0], id: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let paso = 0;
    let timer = 0;

    const tick = () => {
      const importe = TICKETS[paso % TICKETS.length];
      paso += 1;
      setUltima({ importe, id: paso });
      setAccionistas((n) => n + 1);
      /*
        El capital se frena al acercarse al objetivo en vez de pasarse. Una barra
        de progreso que rebasa el 100 % delata que la cifra es de adorno.
      */
      setCapital((c) => Math.min(OBJETIVO - 1000, c + importe));
    };

    timer = window.setInterval(tick, CADA);
    return () => window.clearInterval(timer);
  }, []);

  return {
    capital,
    accionistas,
    ultima,
    progreso: Math.round((capital / OBJETIVO) * 100),
    objetivo: OBJETIVO,
  };
}
