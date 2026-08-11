import { useEffect } from "react";

/**
 * Revelacion al hacer scroll (§5).
 *
 * El hook no oculta nada: el CSS ya deja todo visible por defecto y el estado
 * oculto solo existe bajo `html.js`. Lo unico que hace este codigo es anadir
 * `is-visible` a los elementos que entran en pantalla.
 *
 * Salvaguardas, en este orden:
 *  - Si el navegador no soporta IntersectionObserver, se marca todo visible.
 *  - Si el usuario pide movimiento reducido, se marca todo visible.
 *  - Pase lo que pase, a los 2000 ms se marca visible todo lo que siga pendiente.
 *
 * Consecuencia: es imposible que un fallo del observador deje contenido invisible.
 */
export function useReveal() {
  useEffect(() => {
    const revealAll = () => {
      document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)").forEach((el) => {
        el.classList.add("is-visible");
      });
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => observer.observe(el));

    // Red de seguridad temporal (§5.4).
    const safety = window.setTimeout(revealAll, 2000);

    return () => {
      window.clearTimeout(safety);
      observer.disconnect();
    };
  }, []);
}
