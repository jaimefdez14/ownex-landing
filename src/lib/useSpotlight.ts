import { useEffect } from "react";

/**
 * Resplandor que sigue al cursor dentro de los bloques oscuros.
 *
 * Existió hasta el 25/08/2026 y se retiró al pasar la página a claro, con buen
 * criterio: sobre blanco no despegaba nada y gastaba acento donde no tocaba.
 * Vuelve acotado a `.theme-dark .spotlight`, que es donde el efecto sí existe.
 *
 * Un único listener en `document`, delegado, en vez de uno por tarjeta: la
 * página tiene tres bloques oscuros y varias tarjetas dentro, y registrar un
 * `mousemove` en cada una es la forma fácil de que el hilo principal se llene
 * de trabajo por nada.
 *
 * Solo escribe dos variables CSS con la posición relativa; el pintado lo hace
 * el `::before` de `index.css` en su propia capa, así que no hay reflow.
 */
export function useSpotlight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    /*
      En táctil no hay cursor que seguir: el `mousemove` que emulan algunos
      navegadores al tocar dejaría el resplandor encendido en el último punto
      tocado, que es peor que no tenerlo.
     */
    if (!window.matchMedia("(hover: hover)").matches) return;

    const onMove = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const zona = target?.closest?.(".spotlight") as HTMLElement | null;
      if (!zona) return;

      const rect = zona.getBoundingClientRect();
      zona.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      zona.style.setProperty("--my", `${event.clientY - rect.top}px`);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    return () => document.removeEventListener("mousemove", onMove);
  }, []);
}
