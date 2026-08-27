import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { track } from "../lib/analytics";
import { cn } from "../lib/cn";
import { useActiveSection } from "../lib/useActiveSection";

const links = [
  { label: "Problema", href: "#problem" },
  { label: "Solución", href: "#solution" },
  { label: "Cómo funciona", href: "#framework" },
  { label: "Casos de uso", href: "#examples" },
  { label: "FAQ", href: "#faq" },
  { label: "Contacto", href: "#contact" },
];

/**
 * Barra de navegacion. Transparente sobre el hero y con fondo difuminado al hacer
 * scroll, como en el original.
 *
 * Dos cosas que el original no tenia y aqui si: el menu movil atrapa el foco y se
 * cierra con Esc, y el boton de hamburguesa desaparece sin JavaScript en lugar de
 * quedarse como un control muerto.
 *
 * Los rotulos van con mayuscula solo en la primera palabra ("Cómo funciona", no
 * "Cómo Funciona"): la capitalizacion de cada palabra es una convencion inglesa que
 * en una web en espanol se lee como descuido.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const sectionIds = useMemo(() => links.map((link) => link.href.slice(1)), []);
  const activeSection = useActiveSection(sectionIds);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a[href]")?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onCta = () => {
    track("cta_click", { location: "nav", label: "Agendar una llamada" });
    setOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "theme-light fixed inset-x-0 top-0 z-50 transition-colors duration-300",
          scrolled ? "bg-background/80 shadow-[0_1px_0_rgb(14_15_12_/_0.06)] backdrop-blur-xl" : "",
        )}
      >
        <nav aria-label="Principal" className="shell flex h-16 items-center justify-between gap-6">
          <a
            href="#hero"
            className="inline-flex min-h-touch items-center text-label text-foreground"
            aria-label="Ownex, ir al inicio"
          >
            <span className="text-[16px] font-medium tracking-tight">
              Ownex<span className="text-emerald-400">.</span>
            </span>
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {links.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    /*
                      `location` y no `true`: el enlace no lleva a otra pagina,
                      lleva a un punto de ESTA, que es exactamente el caso que
                      ese valor describe en ARIA. `page` seria mentira y `true`
                      es el comodin generico.
                    */
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      /*
                        `px-1 -mx-1` no cambia nada de lo que se ve: el relleno
                        que se anade por dentro se resta por fuera, asi que el
                        hueco entre rotulos queda igual. Lo que hace es ensanchar
                        la zona pulsable. "FAQ" medi­a 23px de ancho, y el minimo
                        de 24x24 de la WCAG 2.2 (§2.5.8) no lo cumplia por uno.
                      */
                      "inline-flex min-h-touch items-center gap-2 px-1 -mx-1 text-caption transition-colors hover:text-foreground",
                      isActive ? "text-foreground" : "text-text-secondary",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-1 w-1 rounded-full bg-emerald-400 transition-all duration-300 motion-reduce:transition-none",
                        isActive ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <ButtonLink
              href="#contact"
              variant="secondary"
              size="sm"
              onClick={onCta}
              className="hidden md:inline-flex"
            >
              Agendar una llamada
            </ButtonLink>

            <button
              ref={triggerRef}
              type="button"
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
              onClick={() => setOpen((value) => !value)}
              className="js-only inline-flex min-h-touch w-12 items-center justify-center rounded-md text-foreground md:hidden"
            >
              {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/*
        El panel VA FUERA del <header>, y no es un detalle de estilo: cuando la
        barra lleva `backdrop-blur-xl` (o sea, en cuanto has bajado 20px, que es
        casi siempre que alguien abre el menu), `backdrop-filter` convierte al
        header en el bloque contenedor de sus descendientes `position: fixed`.
        El panel dejaba entonces de medirse contra el viewport y pasaba a
        medirse contra una barra de 64px: con `top-16 bottom-0` dentro de una
        caja de 64px, el resultado era un panel de 1px de alto. Los enlaces se
        salian por encima del contenido de la pagina, sin fondo detras y
        completamente ilegibles. Como hermano del header, `fixed` vuelve a
        resolverse contra el viewport y el panel ocupa la pantalla entera.
      */}
      <div
        id="menu-movil"
        ref={panelRef}
        hidden={!open}
        className="theme-light fixed inset-x-0 bottom-0 top-16 z-[60] bg-background md:hidden"
      >
        <ul className="shell flex flex-col gap-2 py-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex min-h-touch items-center text-title text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-6">
            <ButtonLink href="#contact" size="lg" fullWidth onClick={onCta}>
              Agendar una llamada
            </ButtonLink>
          </li>
        </ul>
      </div>
    </>
  );
}
