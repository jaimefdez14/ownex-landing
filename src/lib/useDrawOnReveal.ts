import { useEffect, type RefObject } from "react";

/**
 * Traza las rutas de un SVG cuando entra en pantalla.
 *
 * PRINCIPIO DE SEGURIDAD, y es el motivo de que este hook sea autonomo en vez
 * de apoyarse en la clase `is-visible` de un ancestro:
 *
 *   nada se oculta hasta que este codigo puede garantizar que lo va a mostrar.
 *
 * La primera version dejaba el estado oculto en el CSS (`stroke-dashoffset` a la
 * longitud completa bajo `html.js`) y esperaba que un ancestro `.reveal` o
 * `.draw-on` recibiera `is-visible`. Medido: cargando la pagina y sin tocar
 * nada, a los 4 segundos las tres graficas seguian SIN TRAZAR y cinco rellenos
 * invisibles. Basta con que la cadena de clases no cuadre, o con que el ancestro
 * este bajo `content-visibility: auto` fuera de pantalla, para que una grafica
 * no aparezca jamas. Un efecto decorativo no puede tener ese modo de fallo.
 *
 * Ahora el orden es: medir -> armar -> observar -> disparar, todo aqui. Si
 * cualquier paso falla, el SVG se queda como esta, o sea VISIBLE, porque el
 * estado oculto solo se aplica en el paso "armar", justo despues de haber
 * montado el observador que lo va a desarmar.
 *
 * Salvaguardas, en el mismo espiritu que `useReveal`:
 *  - Sin `IntersectionObserver` o con movimiento reducido, no se arma nada.
 *  - Pase lo que pase, a los 2500 ms se desarma lo que siga pendiente.
 */
export function useDrawOnReveal(
  ref: RefObject<SVGSVGElement | null>,
  deps: unknown[] = [],
) {
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const lineas = Array.from(svg.querySelectorAll<SVGPathElement>(".draw-line"));
    if (lineas.length === 0) return;

    const desarmar = () => svg.classList.add("draw-done");

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      desarmar();
      return;
    }

    // 1) Medir. Sin longitud real no se arma: una longitud inventada deja el
    //    trazo a medias en cuanto el grafico cambia de dominio.
    let medidas = 0;
    for (const linea of lineas) {
      if (typeof linea.getTotalLength !== "function") continue;
      const len = linea.getTotalLength();
      if (!Number.isFinite(len) || len === 0) continue;
      linea.style.setProperty("--draw-len", String(Math.ceil(len)));
      medidas += 1;
    }
    if (medidas === 0) {
      desarmar();
      return;
    }

    // 2) Armar: a partir de aqui el SVG esta oculto, y el observador de abajo
    //    ya existe para descubrirlo.
    svg.classList.add("draw-armed");
    svg.classList.remove("draw-done");

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        desarmar();
        observer.disconnect();
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(svg);

    const red = window.setTimeout(desarmar, 2500);

    return () => {
      window.clearTimeout(red);
      observer.disconnect();
      desarmar();
    };
    // Las dependencias las decide quien lo usa: son los datos que cambian la ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps]);
}
