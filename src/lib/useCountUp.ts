import { useEffect, type RefObject } from "react";

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
export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  target: number,
  format: (value: number) => string,
  durationMs = 1400,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || typeof IntersectionObserver === "undefined") return;

    let frame = 0;

    const run = () => {
      const start = performance.now();

      const tick = (now: number) => {
        /*
          Acotado por ABAJO tambien, y no es defensa preventiva: `now` es la marca
          de tiempo del fotograma, que el navegador fija al COMENZAR ese fotograma.
          Puede ser anterior al `performance.now()` que se guardo en `start` justo
          antes de pedirlo, asi que la primera llamada llega a veces con una
          diferencia negativa. Sin el limite inferior, `eased` se dispara a un
          numero negativo grande y la primera cosa que se pinta es un importe en
          negativo: el panel del hero llego a enseñar "-1.395 €" de capital
          captado. Con el limite, el peor caso es empezar en cero.
        */
        const progress = Math.min(Math.max((now - start) / durationMs, 0), 1);
        const eased = 1 - (1 - progress) ** 3;
        el.textContent = format(target * eased);

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        } else {
          el.textContent = format(target);
        }
      };

      frame = requestAnimationFrame(tick);
    };

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
