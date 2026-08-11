import { useEffect, type RefObject } from "react";

const STAGE_CLASS = "js-stage-active";

/**
 * Motor del escenario de scroll horizontal de "Cómo funciona".
 *
 * El anclado en pantalla lo hace `position: sticky` en CSS, pero *solo* cuando el
 * propio `.framework-stage` lleva la clase `js-stage-active`, y esa clase la pone
 * y la quita este hook, nunca un `@media` aparte. Así CSS y JavaScript no pueden
 * quedar en desacuerdo sobre si el anclado está activo.
 *
 * Se desactiva con movimiento reducido y punto: el CSS por defecto ya es la
 * cuadrícula normal, apta para cualquier ancho. Por lo demás el anclado es el
 * mismo en móvil que en escritorio: no hay ya un umbral de ancho que lo apague.
 * Por debajo de `lg` cada fase sigue apilando texto e ilustración en vez de
 * repartirlos en dos columnas (ver `FrameworkSection.tsx` e `index.css`), y si
 * aun así no caben en una pantalla, `.framework-panel-inner` se desplaza en
 * vertical por dentro sin romper el desplazamiento horizontal entre fases: el
 * dedo agota primero ese scroll interno y solo entonces el gesto pasa a mover
 * la página, que es lo que hace avanzar de fase.
 */
export function useScrollStage(
  stageRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  dotsRef: RefObject<HTMLElement | null>,
  phaseLabelRef: RefObject<HTMLElement | null>,
  phaseNumbers: string[],
) {
  const steps = phaseNumbers.length;
  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const maxShift = ((steps - 1) / steps) * 100;

    let raf = 0;
    let activeIndex = -1;

    const update = () => {
      raf = 0;
      const rect = stage.getBoundingClientRect();
      const scrollable = stage.offsetHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(-rect.top / scrollable, 0), 1) : 0;

      track.style.transform = `translateX(-${(progress * maxShift).toFixed(3)}%)`;

      const next = Math.min(steps - 1, Math.round(progress * (steps - 1)));
      if (next !== activeIndex) {
        activeIndex = next;
        const dots = dotsRef.current?.children;
        if (dots) {
          for (let i = 0; i < dots.length; i++) {
            dots[i].setAttribute("data-active", String(i === activeIndex));
          }
        }
        if (phaseLabelRef.current) {
          phaseLabelRef.current.textContent = phaseNumbers[activeIndex];
        }
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    stage.classList.add(STAGE_CLASS);
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      stage.classList.remove(STAGE_CLASS);
      track.style.transform = "";
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    // `phaseNumbers` no entra en las dependencias a proposito: su contenido
    // ("01", "02", "03") no cambia en la vida del componente aunque el array se
    // recree en cada render, y anadirlo aqui reengancharia el listener sin
    // necesidad. `steps` (su longitud) es lo unico que de verdad importa.
  }, [stageRef, trackRef, dotsRef, phaseLabelRef, steps]);
}
