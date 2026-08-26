import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { track } from "../lib/analytics";

/**
 * Barra de conversión fija en el pie, solo en móvil.
 *
 * Por qué existe (19-ago-2026): hasta ahora, en un móvil, la única forma de
 * llegar al formulario desde la mitad de la página era abrir el menú (que
 * además estaba roto, ver `Navbar.tsx`) o seguir bajando hasta el final. Entre
 * los botones del hero y el formulario de contacto hay unas catorce pantallas
 * de scroll sin una sola llamada a la acción a mano. En escritorio eso no pasa
 * porque el botón vive siempre en la barra de navegación; en móvil ese botón no
 * cabe, así que se baja al pie, que es donde está el pulgar.
 *
 * Tres decisiones deliberadas:
 *
 *  - No aparece sobre el hero. Ahí ya hay dos botones a tamaño completo y
 *    taparlos con un tercero sería ruido. Entra al dejar atrás la primera
 *    pantalla, que es justo cuando el CTA del hero deja de estar a la vista.
 *  - Se esconde al llegar al formulario. Una barra que dice "Agendar una
 *    llamada" flotando por encima del propio formulario de agendar tapa campos
 *    y no lleva a ningún sitio nuevo.
 *  - Respeta la safe area del iPhone (`env(safe-area-inset-bottom)`, ver
 *    `.mobile-cta-bar` en index.css), o el botón queda debajo de la barra de
 *    gestos.
 *
 * Sin JavaScript no se pinta, y no pasa nada: es un atajo, no la única vía. El
 * formulario sigue estando al final de la página y en el menú.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contact");

    const onScroll = () => {
      /*
        Umbrales en centesimas del alto de la ventana. Enteros a proposito: el
        `check:copy` del §4.1 marca los decimales con punto, y su extractor de
        texto visible no distingue un `0.9` de codigo de uno de copy (ver la
        regla "Decimal con punto en el copy" en `scripts/check-copy.mjs`).
      */
      const vh = window.innerHeight / 100;
      const pastHero = window.scrollY > vh * 90;
      const atContact = contact ? contact.getBoundingClientRect().top < vh * 85 : false;
      setVisible(pastHero && !atContact);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={
        visible
          ? "mobile-cta-bar theme-dark js-only fixed inset-x-0 bottom-0 z-40 translate-y-0 bg-background/95 backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none md:hidden"
          : "mobile-cta-bar theme-dark js-only pointer-events-none fixed inset-x-0 bottom-0 z-40 translate-y-full bg-background/95 backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none md:hidden"
      }
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/*
          Dos palabras y en `text-caption`, no en `text-micro`: a 375px, con el
          boton al lado, quedan unos 130px para este texto, y `text-micro` lleva
          un tracking de 0.18em que ensancha cualquier frase hasta pasarse. La
          version larga ("30 minutos. Sin compromiso.") se partia en dos lineas y
          estrechaba el boton; la abreviada con tracking se truncaba a mitad. El
          reaseguro que de verdad importa aqui son estas dos palabras.
        */}
        <p className="min-w-0 flex-1 truncate text-caption text-text-secondary">
          Sin compromiso
        </p>
        <a
          href="#contact"
          tabIndex={visible ? undefined : -1}
          onClick={() => track("cta_click", { location: "mobile_bar", label: "Agendar una llamada" })}
          className="inline-flex min-h-touch shrink-0 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-label font-medium text-background shadow-[0_6px_24px_-10px_rgba(52,211,153,0.45)] active:scale-[0.99] motion-reduce:transform-none"
        >
          Agendar una llamada
          <ArrowRight aria-hidden="true" size={16} />
        </a>
      </div>
    </div>
  );
}
