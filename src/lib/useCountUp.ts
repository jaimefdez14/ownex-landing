import { useEffect, useRef, type RefObject } from "react";

/**
 * Conteo ascendente para las cifras de ejemplo de los mockups de producto
 * (ProductMockups, HeroMetrics). Portado de la v1 sin cambios: es agnostico de
 * estilo, solo depende de la API del DOM.
 *
 * El valor final es siempre el que ya esta en el marcado: es lo que `AnimatedNumber`
 * renderiza como hijo de React, y por tanto lo que se ve sin JavaScript y lo que lee
 * un lector de pantalla. Esta funcion no pasa nunca por el estado de React: solo
 * reescribe `element.textContent` de forma imperativa, fotograma a fotograma, y
 * aterriza siempre en el mismo texto final que ya estaba antes de empezar. No hay
 * desajuste de hidratacion posible porque React nunca ve los valores intermedios.
 *
 * Mismas garantias que `useReveal`: respeta `prefers-reduced-motion` (en ese caso no
 * hace nada, el numero ya es correcto), usa un observador propio y se desconecta
 * tras dispararse una vez.
 */
/*
  CORREGIDO EL 27/08/2026 - CONTABA DESDE CERO CADA VEZ.

  El efecto llevaba `[target]` en las dependencias y `run()` empezaba siempre en
  cero. Con una cifra fija eso da un contador de entrada, que es lo que se
  buscaba. Con una cifra VIVA da un fallo muy visible: el panel del hero recibe
  una suscripcion cada 4,2 segundos, asi que el capital captado se desplomaba a
  cero y volvia a subir hasta 185.000 cada 4,2 segundos, indefinidamente durante
  los primeros seis minutos. Lo mismo el numero de accionistas y el ticket medio.

  Ahora el hook recuerda lo ultimo que pinto:

    la primera vez        cuenta de cero al objetivo, y espera a estar en
                          pantalla para hacerlo (es un contador de entrada);
    los cambios de despues interpolan DESDE la cifra anterior, corto, y sin
                          volver a montar un observador: el elemento ya se vio.

  Con eso una suscripcion de 400 euros se ve como lo que es, 400 euros subiendo,
  y no como un contador que se reinicia.
*/
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  format: (value: number) => string,
  durationMs = 1400,
  /*
    `animarEntrada = false` para cifras que YA son correctas en el primer
    fotograma y solo tienen que moverse cuando el visitante las cambia. El cebo
    del hero es el caso: la cifra que promete no es un dato que llega, es la
    respuesta a la pastilla que hay pulsada; contarla desde cero al cargar solo
    la hace parecer un cartel a medio pintar (y, con el `content-visibility` del
    hero de por medio, la animacion de entrada se congelaba a la vista). Con
    `false`, la primera pasada solo registra el valor; los cambios de despues
    interpolan igual que siempre.
  */
  animarEntrada = true,
) {
  /** Lo ultimo que este hook pinto. `null` mientras no ha pintado nada. */
  const pintado = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      /*
        No se toca el DOM: `AnimatedNumber` ya pinta `format(value)` en su
        render, asi que la cifra correcta esta puesta con o sin este hook.
      */
      pintado.current = target;
      return;
    }

    /*
      Sin animacion de entrada: la primera pasada solo apunta el valor (la cifra
      correcta ya la pinto `AnimatedNumber` en su render) y sale. La segunda vez
      que `target` cambie, `pintado.current` ya no es `null` y se anima el delta
      por el camino normal.
    */
    if (!animarEntrada && pintado.current === null) {
      pintado.current = target;
      return;
    }

    let frame = 0;

    const run = () => {
      const desde = pintado.current ?? 0;
      const salto = target - desde;
      if (salto === 0) return;

      /*
        El recorrido largo es solo para la entrada. Un cambio posterior es un
        delta pequeno y merece un gesto corto: con 1400ms, dos suscripciones
        seguidas se solaparian y la cifra iria siempre por detras de la realidad.
      */
      const duracion = pintado.current === null ? durationMs : 420;
      const start = performance.now();

      const tick = (now: number) => {
        /*
          Acotado por ABAJO tambien, y no es defensa preventiva: `now` es la marca
          de tiempo del fotograma, que el navegador fija al COMENZAR ese fotograma.
          Puede ser anterior al `performance.now()` que se guardo en `start` justo
          antes de pedirlo, asi que la primera llamada llega a veces con una
          diferencia negativa. Sin el limite inferior, `eased` se dispara y la
          primera cosa que se pinta es un importe en negativo: el panel del hero
          llego a ensenar "-1.395 €" de capital captado.
        */
        const progress = Math.min(Math.max((now - start) / duracion, 0), 1);
        const eased = 1 - (1 - progress) ** 3;
        const valor = desde + salto * eased;

        el.textContent = format(valor);
        pintado.current = valor;

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          el.textContent = format(target);
          pintado.current = target;
        }
      };

      frame = requestAnimationFrame(tick);
    };

    /*
      El observador solo hace falta la PRIMERA vez, para no gastar el contador de
      entrada mientras el elemento esta fuera de pantalla. Despues el elemento ya
      se ha visto y montar un observador nuevo en cada cambio seria tirar trabajo.
    */
    if (pintado.current !== null) {
      run();
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          run();
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);
}
