import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useCopy } from "../../i18n/locale";

/**
 * Fila deslizable en telefono, reticula desde `md`.
 *
 * 14/11/2026, a peticion de Jaime: la landing en movil medía 15.000px y las
 * tarjetas apiladas (sectores, solucion, normas) eran la mitad del problema. Es
 * el patron que ya usan el hero y Recursos (tarjeta a un 85 por ciento del ancho, la siguiente asoma
 * por la derecha, `snap` para que cada gesto pare en una tarjeta entera), con
 * dos piezas mas:
 *
 *  - PUNTOS de posicion debajo. Con seis tarjetas, el borde que asoma dice que
 *    hay mas pero no cuantas; los puntos lo dicen y llevan a cada una con raton
 *    o teclado. Sin JavaScript no hacen nada, asi que se esconden con
 *    `visibility` (guardan su hueco: cero salto de maqueta al hidratar).
 *  - `tabIndex={0}` y `aria-label` en la tira: si las tarjetas no llevan nada
 *    enfocable, sin esto el tabulador salta la tira y las tarjetas 2..n quedan
 *    fuera del teclado (ver el comentario largo en HeroSection).
 *
 * Desde `md` la tira es una `<ul>` normal y manda `className`, que trae la
 * reticula de cada seccion (`md:grid md:grid-cols-3`...). Cada `<li>` debe llevar
 * `SWIPE_ITEM` para tener el ancho y el punto de anclaje de la tira.
 */
export const SWIPE_ITEM = "w-[85%] shrink-0 snap-start md:w-auto";

const COPY = {
  es: { goTo: (n: number, total: number) => `Ver tarjeta ${n} de ${total}` },
  en: { goTo: (n: number, total: number) => `Show card ${n} of ${total}` },
};

export function SwipeRow({
  label,
  count,
  className,
  children,
}: {
  label: string;
  /** Numero de tarjetas, para pintar los puntos en el servidor sin medir nada. */
  count: number;
  className?: string;
  children: ReactNode;
}) {
  const t = useCopy(COPY);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  /* La tarjeta activa es la que tiene el borde izquierdo mas cerca del inicio. */
  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const start = el.scrollLeft + items[0].offsetLeft;
    let best = 0;
    items.forEach((item, index) => {
      if (Math.abs(item.offsetLeft - start) < Math.abs(items[best].offsetLeft - start)) best = index;
    });
    /* Al final del recorrido la ultima tarjeta no puede llegar al borde izquierdo. */
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) best = items.length - 1;
    setActive(best);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [measure]);

  const goTo = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: items[index].offsetLeft - items[0].offsetLeft,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label={label}
        className={cn(
          "-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:mx-0 md:overflow-visible md:px-0 md:pb-0",
          className,
        )}
      >
        {children}
      </ul>

      <div className="swipe-dots mt-3 flex justify-center md:hidden">
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={t.goTo(index + 1, count)}
            aria-current={index === active ? "true" : undefined}
            className="group flex h-6 w-6 items-center justify-center"
          >
            <span
              className={cn(
                "block h-[6px] rounded-full transition-all duration-200",
                index === active ? "w-4 bg-foreground" : "w-[6px] bg-text-tertiary/50 group-hover:bg-text-tertiary",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
