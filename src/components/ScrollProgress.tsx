import { useEffect, useRef } from "react";

/**
 * Barra de progreso de scroll. Una linea de 2px pegada al borde superior de la
 * ventana, por delante de la barra de navegacion (`z-[60]` frente a su `z-50`).
 *
 * El ancho se escribe con `transform: scaleX(...)` en lugar de `width` para que el
 * navegador lo resuelva en la capa de composicion y no dispare layout en cada
 * fotograma de scroll. Sin JavaScript la barra no aparece: es un indicador de
 * progreso, no contenido, asi que no hace falta un estado de reserva.
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? Math.min(Math.max(doc.scrollTop / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${ratio})`;
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 motion-reduce:transition-none"
        style={{ transform: "scaleX(0)", transition: "transform 150ms ease-out" }}
      />
    </div>
  );
}
