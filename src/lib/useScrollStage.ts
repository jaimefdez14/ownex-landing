import { useEffect, useState, type RefObject } from "react";

const STAGE_CLASS = "js-stage-active";

/**
 * Motor del escenario de scroll horizontal de "Cómo funciona".
 *
 * El anclado en pantalla lo hace `position: sticky` en CSS, pero *solo* cuando el
 * propio `.framework-stage` lleva la clase `js-stage-active`, y esa clase la pone
 * y la quita este hook, nunca un `@media` aparte. Así CSS y JavaScript no pueden
 * quedar en desacuerdo sobre si el anclado está activo.
 *
 * Se desactiva con movimiento reducido, y desde el 19-ago-2026 tambien por
 * debajo de 1024px. El motivo del umbral de ancho, que antes no existia:
 *
 * Para que las tres fases cupieran cada una en una pantalla de movil, el CSS
 * ocultaba la ilustracion (`.js-stage-active .defer-paint { display: none }`).
 * O sea que en el dispositivo desde el que entra la mayoria de la gente, la
 * seccion que explica el producto no ensenaba ni una sola pantalla del
 * producto: tres muros de texto seguidos. Y encima el escenario traduce el
 * gesto vertical en desplazamiento horizontal, que en tactil compite con el
 * scroll natural de la pagina.
 *
 * Por debajo de `lg` la seccion vuelve a ser lo que el CSS ya hacia por
 * defecto: tres bloques apilados que se leen de arriba abajo, cada uno con su
 * mockup a tamano completo. El anclado sigue intacto en escritorio, donde hay
 * ancho para las dos columnas y el gesto es de rueda, no de dedo.
 */
const STAGE_MIN_WIDTH = 1024;
export function useScrollStage(
  stageRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  dotsRef: RefObject<HTMLElement | null>,
  phaseLabelRef: RefObject<HTMLElement | null>,
  phaseNumbers: string[],
) {
  const steps = phaseNumbers.length;

  /*
    El ancho no se lee una sola vez al montar: rotar el movil o redimensionar la
    ventana cruza el umbral en los dos sentidos, y el escenario tiene que
    engancharse o soltarse en consecuencia. Arranca en `false` para que el
    servidor y la primera pintura coincidan (sin `window` no hay ancho que
    medir): el efecto de abajo lo corrige en cuanto hay cliente.
  */
  const [wideEnough, setWideEnough] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${STAGE_MIN_WIDTH}px)`);
    const sync = () => setWideEnough(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    if (!wideEnough) return;

    const maxShift = ((steps - 1) / steps) * 100;

    let raf = 0;
    let activeIndex = -1;
    let settleTimer = 0;

    /*
      Sin esto, soltar el dedo (o dejar de girar la rueda) a mitad de camino entre
      dos fases deja el track parado ahi para siempre: la mitad derecha de una fase
      y la mitad izquierda de la siguiente, cortadas y a la vista al mismo tiempo.
      Con rueda de raton es raro pararse justo ahi porque cada gesto mueve mucho
      recorrido de golpe: con el dedo, que se detiene constantemente para leer, es
      el estado de reposo mas probable de todos.

      SETTLE_DELAY despues del ultimo evento de scroll, si el progreso no esta ya
      pegado a una fase, este temporizador termina el movimiento por su cuenta con
      un scroll suave hasta la fase mas cercana. Es el mismo gesto que un carrusel
      nativo con paginacion: el contenido nunca se queda "entre" dos paginas.
    */
    const SETTLE_DELAY = 160;

    const snapToNearest = () => {
      const scrollable = stage.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const rect = stage.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      // Los extremos (entrando o saliendo de la seccion) scrollean con normalidad:
      // solo se corrige el reposo dentro del propio escenario anclado.
      if (progress <= 0 || progress >= 1) return;

      const nearestIndex = Math.round(progress * (steps - 1));
      const targetProgress = nearestIndex / (steps - 1);
      if (Math.abs(progress - targetProgress) < 0.004) return;

      const stageDocTop = rect.top + window.scrollY;
      window.scrollTo({ top: stageDocTop + targetProgress * scrollable, behavior: "smooth" });
    };

    const scheduleSettle = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(snapToNearest, SETTLE_DELAY);
    };

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
      scheduleSettle();
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
      window.clearTimeout(settleTimer);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    // `phaseNumbers` no entra en las dependencias a proposito: su contenido
    // ("01", "02", "03") no cambia en la vida del componente aunque el array se
    // recree en cada render, y anadirlo aqui reengancharia el listener sin
    // necesidad. `steps` (su longitud) es lo unico que de verdad importa.
  }, [stageRef, trackRef, dotsRef, phaseLabelRef, steps, wideEnough]);
}
