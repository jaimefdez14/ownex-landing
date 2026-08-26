import { LeadForm } from "./LeadForm";
import { Reveal } from "./ui/Reveal";

const navLinks = [
  { href: "#problem", label: "Problema" },
  { href: "#solution", label: "Solución" },
  { href: "#framework", label: "Cómo funciona" },
  { href: "#examples", label: "Casos de uso" },
  { href: "#faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/aviso-legal.html", label: "Aviso legal" },
  { href: "/privacidad.html", label: "Política de privacidad" },
  { href: "/cookies.html", label: "Política de cookies" },
];

/**
 * CTA final y pie.
 *
 * El pie del original solo tenia las anclas de seccion y la linea de copyright. Aqui
 * se le anaden los tres textos legales y el aviso de que la web no constituye una
 * oferta de valores: en Espana son obligatorios, y esta es una pagina que describe
 * operaciones sobre valores.
 */
export function FooterCTA() {
  return (
    <footer>
      <section
        id="contact"
        aria-labelledby="contact-title"
        className="section-padding spotlight bg-background theme-dark"
      >
        <div className="shell">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal as="p" className="label-caps mb-5">
                Empezar
              </Reveal>

              <Reveal
                as="h2"
                id="contact-title"
                delay={80}
                className="display-section mb-8 text-[32px] text-foreground sm:text-display md:text-display-lg lg:text-[64px]"
              >
                Tus clientes ya construyen tu marca.{" "}
                <span className="text-text-tertiary">Hagámoslo mutuo.</span>
              </Reveal>

              <Reveal as="p" delay={140} className="mb-4 max-w-md text-body-lg text-text-secondary">
                Agenda una llamada de 30 minutos con nosotros. Evaluamos encaje, repasamos la
                estructura, y te damos una imagen clara de lo que una ronda con Ownex puede
                significar para tu marca.
              </Reveal>

              <Reveal as="p" delay={180} className="text-body text-text-tertiary">
                Sin compromiso. Sin coste.
              </Reveal>
            </div>

            {/*
              El cierre es oscuro, pero el formulario va en tarjeta clara
              (`brand/BRAND.md` §9.1, regla 2): la seccion conserva el peso del
              cierre y los campos conservan la usabilidad del claro, que es donde
              un formulario se rellena sin friccion. `theme-light` basta - los
              campos, los rotulos y el boton resuelven solos contra ese tema.
            */}
            <Reveal delay={150} className="theme-light">
              <LeadForm />
            </Reveal>
          </div>
        </div>
      </section>

      <div className="bg-background theme-dark">
        <div className="shell py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <a href="#hero" className="inline-flex min-h-touch items-center" aria-label="Ownex, ir al inicio">
              <span className="text-[16px] font-medium tracking-tight text-foreground">
                Ownex<span className="text-emerald-400">.</span>
              </span>
            </a>

            <nav aria-label="Secciones del sitio">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-touch items-center text-caption text-text-tertiary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    className="inline-flex min-h-touch items-center text-caption text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Contacto
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-8 space-y-4 border-t border-border pt-8">
            <nav aria-label="Información legal">
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-touch items-center text-caption text-text-tertiary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* TODO(jaime): redaccion pendiente de validar con el despacho. */}
            <p className="mx-auto max-w-measure text-center text-caption text-text-tertiary">
              Esta web tiene carácter informativo y no constituye una oferta de valores, asesoramiento
              financiero ni recomendación de inversión.
            </p>

            <p className="text-center text-caption text-text-tertiary">
              © 2026 Ownex. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
