import { useEffect } from "react";

/**
 * Resplandor que sigue al cursor dentro de las zonas marcadas con `.spotlight`.
 *
 * Existió hasta el 25/08/2026 y se retiró al pasar la página a claro, con buen
 * criterio: sobre blanco no despegaba nada y gastaba acento donde no tocaba.
 * Volvió el 26/08 acotado a `.theme-dark .spotlight`, y el 31/08 se extendió a
 * `.theme-light-alt` -- el lienzo verde -- a petición de Jaime.
 *
 * ESTE HOOK NO SABE DE TEMAS, y ahí está la gracia de que la extensión no le haya
 * costado una línea: lo único que hace es escribir la posición del cursor relativa
 * a la zona que lo contiene. Qué se pinta con esas dos coordenadas, y si se pinta
 * algo, lo decide entero `index.css` (halo de acento sobre negro, halo blanco sobre
 * el verde, nada sobre blanco puro). Para añadir una superficie más basta una regla
 * CSS; aquí no se toca nada.
 *
 * Un único listener en `document`, delegado, en vez de uno por zona: la página
 * tiene ya ocho zonas con `.spotlight` y varias tarjetas dentro de cada una, y
 * registrar un `mousemove` en cada una es la forma fácil de que el hilo principal
 * se llene de trabajo por nada.
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
