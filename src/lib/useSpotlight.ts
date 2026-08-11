import { useEffect } from "react";

/**
 * Resplandor que sigue al cursor sobre las tarjetas `.glass-card-hover`.
 *
 * Un unico listener delegado en `document`, no uno por tarjeta: coherente con el
 * patron ya usado en `DotField` (un solo reloj, no uno por elemento) y con
 * `useReveal` (un unico observer). Actualiza `--mx`/`--my` en la tarjeta bajo el
 * cursor con `requestAnimationFrame`, y el propio CSS (`.glass-card-hover::before`)
 * hace el resto: sin JavaScript la tarjeta se queda con su borde esmeralda de
 * siempre, sin el resplandor, pero nada se rompe.
 *
 * Se desactiva en tactil: sin puntero fino no hay resplandor que seguir, igual que
 * `DotField` desactiva su propia reticula reactiva en el mismo caso.
 */
export function useSpotlight() {
  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    let raf = 0;
    let pendingEvent: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      const event = pendingEvent;
      if (!event) return;

      const target = (event.target as HTMLElement | null)?.closest<HTMLElement>(".glass-card-hover");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--mx", `${x}%`);
      target.style.setProperty("--my", `${y}%`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pendingEvent = event;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
