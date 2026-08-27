import { useEffect } from "react";

/**
 * Aterrizaje en un ancla al ENTRAR en la pagina (`ownex.co/#contact`).
 *
 * EL FALLO QUE ARREGLA - 27/08/2026. Comprobado sobre `npm run build` + `npm run
 * preview`: abrir `/#contact` o `/#faq` dejaba la pagina arriba del todo, con el
 * fragmento en la barra de direcciones y sin moverse ni un pixel. No es un caso
 * raro: es exactamente lo que pasa cuando alguien pulsa el enlace de una
 * campana, de una firma de correo o de un mensaje. Llegaba al hero, no al sitio
 * al que se le habia mandado.
 *
 * El salto DENTRO de la pagina (pulsar "Contacto" en la barra) siempre funciono:
 * ahi el diseño ya esta asentado. El que fallaba era el de llegada, y hay dos
 * mecanismos que se juntan justo en ese instante:
 *
 *  - `scroll-behavior: smooth` en `html` hace que el salto inicial al fragmento
 *    sea animado. Una animacion de scroll se cancela sola en cuanto algo mas
 *    toca el scroll o el diseño mientras corre.
 *  - `content-visibility: auto` (los mockups de "Cómo funciona") cambia de altura
 *    segun entra y sale de pantalla. Durante el recorrido, la posicion del
 *    destino se mueve bajo los pies de la propia animacion.
 *
 * Se arregla en codigo y no quitando el `smooth`, porque el `smooth` lo quiere
 * la pagina para los saltos internos, que son la mayoria.
 *
 * TRES PASADAS, y cada una tiene su motivo:
 *
 *   inmediata   cubre el caso normal, cuando el diseño ya es el definitivo.
 *   dos rAF     despues de que el navegador haya vuelto a medir tras la primera:
 *               es cuando `content-visibility` ya ha decidido que se salta y que
 *               no, y el destino tiene su posicion buena.
 *   300 ms      red de seguridad para lo que llegue tarde (una fuente que cambia
 *               una altura, una imagen de sector).
 *
 * Las tres van con `behavior: "instant"`, o sea sin animar: un enlace de campana
 * que aterriza a diez mil pixeles no tiene que recorrerlos a la vista de nadie,
 * y ademas animarlo es justo lo que se cancela.
 *
 * OJO CON `"auto"`: NO significa "sin animacion". Significa "lo que diga
 * `scroll-behavior` en CSS", y aqui eso es `smooth`. Con `"auto"` el arreglo
 * reproducia el fallo original clavado: medido en la version compilada, la
 * pagina se quedaba en scroll 28 de 10.901, o sea la animacion arrancando y
 * cortandose a los pocos pixeles. `"instant"` es el valor que salta de verdad.
 *
 * Si no hay fragmento, o apunta a algo que no existe, el hook no hace nada.
 */
export function useHashLanding() {
  useEffect(() => {
    const raw = window.location.hash.slice(1);
    if (!raw) return;

    let id: string;
    try {
      id = decodeURIComponent(raw);
    } catch {
      id = raw;
    }

    const target = document.getElementById(id);
    if (!target) return;

    /* `scroll-margin-top` (80px, en `index.css`) lo respeta `scrollIntoView`. */
    const jump = () => target.scrollIntoView({ behavior: "instant", block: "start" });

    jump();

    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(jump);
    });
    const late = window.setTimeout(jump, 300);

    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      window.clearTimeout(late);
    };
  }, []);
}
