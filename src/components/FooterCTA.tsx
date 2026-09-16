import { LeadForm } from "./LeadForm";
import { LanguageSwitch } from "./LanguageSwitch";
import { clearConsent } from "../lib/consent";
import { hasConsentedAnalytics } from "../lib/env";
import { Reveal } from "./ui/Reveal";
import { useCopy, type Localized } from "../i18n/locale";
import { LEGAL, RESOURCES_HUB } from "../i18n/routes";

/* El hub, con su URL real: es la unica via por la que el buscador llega a los
   diez articulos desde la portada, y cada idioma enlaza el suyo. */
const navLinks: Localized<{ href: string; label: string }[]> = {
  es: [
    { href: "#problem", label: "Problema" },
    { href: "#solution", label: "Solución" },
    { href: "#framework", label: "Cómo funciona" },
    { href: "#examples", label: "Casos de uso" },
    { href: RESOURCES_HUB.es, label: "Recursos" },
    { href: "#faq", label: "FAQ" },
  ],
  en: [
    { href: "#problem", label: "Problem" },
    { href: "#solution", label: "Solution" },
    { href: "#framework", label: "How it works" },
    { href: "#examples", label: "Use cases" },
    { href: RESOURCES_HUB.en, label: "Resources" },
    { href: "#faq", label: "FAQ" },
  ],
};

const COPY = {
  es: {
    eyebrow: "Empezar",
    titleA: "Tus clientes ya construyen tu marca.",
    titleB: "Hagámoslo mutuo.",
    body: "Agenda una llamada de 30 minutos con nosotros. Evaluamos encaje, repasamos la estructura, y te damos una imagen clara de lo que una ronda con Ownex puede significar para tu marca.",
    reassurance: "Sin compromiso. Sin coste.",
    home: "Ownex, ir al inicio",
    sections: "Secciones del sitio",
    legal: "Información legal",
    contact: "Contacto",
    cookies: "Preferencias de cookies",
    disclaimer:
      "Esta web tiene carácter informativo y no constituye una oferta de valores, asesoramiento financiero ni recomendación de inversión.",
    rights: "© 2026 Ownex. Todos los derechos reservados.",
    legalLabels: {
      notice: "Aviso legal",
      privacy: "Política de privacidad",
      cookies: "Política de cookies",
    },
  },
  en: {
    eyebrow: "Get started",
    titleA: "Your customers already build your brand.",
    titleB: "Let's make it mutual.",
    body: "Book a 30-minute call with us. We assess the fit, go through the structure and give you a clear picture of what a round with Ownex can mean for your brand.",
    reassurance: "No commitment. No cost.",
    home: "Ownex, back to the top",
    sections: "Site sections",
    legal: "Legal information",
    contact: "Contact",
    cookies: "Cookie preferences",
    /*
      El aviso de que la web no es una oferta de valores es obligatorio en Espana y
      aqui se traduce sin suavizarlo: los tres terminos que niega (oferta de valores,
      asesoramiento financiero, recomendacion de inversion) son categorias juridicas,
      no adjetivos, asi que se nombran una a una igual que en espanol.
    */
    disclaimer:
      "This website is for information purposes only and does not constitute an offer of securities, financial advice or an investment recommendation.",
    rights: "© 2026 Ownex. All rights reserved.",
    legalLabels: {
      notice: "Legal notice",
      privacy: "Privacy policy",
      cookies: "Cookie policy",
    },
  },
};

/**
 * CTA final y pie.
 *
 * El pie del original solo tenia las anclas de seccion y la linea de copyright. Aqui
 * se le anaden los tres textos legales y el aviso de que la web no constituye una
 * oferta de valores: en Espana son obligatorios, y esta es una pagina que describe
 * operaciones sobre valores.
 */
export function FooterCTA() {
  const t = useCopy(COPY);
  const links = useCopy(navLinks);
  const legalPaths = useCopy(LEGAL);

  const legalLinks = [
    { href: legalPaths.notice, label: t.legalLabels.notice },
    { href: legalPaths.privacy, label: t.legalLabels.privacy },
    { href: legalPaths.cookies, label: t.legalLabels.cookies },
  ];

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
              <Reveal as="p" className="rule-grow label-caps mb-5">
                {t.eyebrow}
              </Reveal>

              <Reveal
                as="h2"
                id="contact-title"
                delay={80}
                className="text-rise display-section mb-8 text-[32px] text-foreground sm:text-display md:text-display-lg lg:text-[64px]"
              >
                {t.titleA}{" "}
                <span className="text-text-tertiary">{t.titleB}</span>
              </Reveal>

              <Reveal as="p" delay={140} className="mb-4 max-w-md text-body-lg text-text-secondary">
                {t.body}
              </Reveal>

              <Reveal as="p" delay={180} className="text-body text-text-tertiary">
                {t.reassurance}
              </Reveal>

              {/*
                EL SEGUNDO CARRIL - 29/08/2026.

                Hasta ahora la pagina tenia NUEVE llamadas a la accion y ocho
                apuntaban aqui, al mismo formulario: una llamada de 30 minutos.
                La novena (el segundo boton del hero) lleva al simulador. O sea
                que quien llega al cierre y todavia no quiere hablar con nadie no
                tenia adonde ir, y esa es la mayoria: alguien que acaba de leer
                sobre abrir su cap table a sus clientes normalmente quiere leer
                antes de agendar nada.

                La llamada SIGUE siendo la accion principal, y a proposito: son
                8 a 12 semanas y unos costes fijos que se pagan antes de captar
                un euro, asi que la venta necesita una conversacion, y Ownex
                necesita cualificar (tamaño de comunidad, si esta levantando
                ronda), cosas que una secuencia de correos hace peor y tres
                semanas mas tarde. Esto no compite con el formulario de al lado:
                recoge a quien ya lo ha descartado.

                Y no inventa ningun entregable nuevo. El desglose YA existe y ya
                se envia: es lo que ofrece el simulador a cambio del correo (ver
                `CalculatorSection`, `origen: "calculadora"`). Aqui solo se dice
                en voz alta que existe, en el punto donde hace falta. Por eso el
                enlace lleva al simulador en vez de abrir un segundo formulario:
                un entregable, un sitio, y el desglose sale con los numeros de
                quien lo pide en lugar de ser un generico.

                DONDE VA. Es un hijo mas de la retícula, no un bloque dentro de la
                columna de texto, y eso resuelve el orden en los dos diseños con
                una sola maqueta:

                  telefono   una columna, asi que cae DETRAS del formulario. Es
                             el orden que toca: primero la accion principal, y la
                             salida despues. Metido en la columna de texto se
                             leia antes que el formulario, o sea ofreciendo la
                             puerta de atras antes de haber pedido nada.
                  `lg`       dos columnas: el formulario ocupa la fila 1 de la
                             derecha y esto cae en la fila 2 de la IZQUIERDA, o
                             sea justo debajo del texto de la seccion, que es
                             donde estaba.
              */}
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
            <div className="flex items-center gap-4">
              <a href="#hero" className="inline-flex min-h-touch items-center" aria-label={t.home}>
                <span className="text-[16px] font-medium tracking-tight text-foreground">
                  Ownex<span className="text-accent-ink">.</span>
                </span>
              </a>

              {/*
                El conmutador va TAMBIEN en el pie, y no es redundante con el de la
                barra: quien llega al final de la pagina en el idioma equivocado ya ha
                leido todo lo que iba a leer, y ahi el sitio natural para cambiarlo es
                donde estan el resto de enlaces de servicio.
              */}
              <LanguageSwitch />
            </div>

            {/*
              `px-1 -mx-1` en los enlaces del pie: mismo hueco a la vista, 8px mas
              de zona pulsable. "FAQ" se quedaba en 23px de ancho y no llegaba al
              minimo de 24x24 de la WCAG 2.2 (§2.5.8). Mismo arreglo que en la
              barra de navegacion.
            */}
            <nav aria-label={t.sections}>
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-touch items-center px-1 -mx-1 text-caption text-text-tertiary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    className="inline-flex min-h-touch items-center px-1 -mx-1 text-caption text-accent-ink transition-colors hover:text-emerald-300"
                  >
                    {t.contact}
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div className="mt-8 space-y-4 border-t border-border pt-8">
            <nav aria-label={t.legal}>
              <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex min-h-touch items-center px-1 -mx-1 text-caption text-text-tertiary transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}

                {/*
                  LA VIA PARA CAMBIAR DE IDEA - 02/09/2026.

                  El consentimiento de analitica no vale de nada si solo se puede
                  dar una vez y no retirar: el art. 7.3 del RGPD exige que
                  retirarlo sea tan facil como darlo. Esto borra la decision
                  guardada y vuelve a abrir el banner, con sus dos botones.

                  Es un boton y no un enlace porque no lleva a ninguna parte:
                  actua sobre el estado de esta misma pagina. Y lleva `js-only`
                  porque sin JavaScript no hay banner que reabrir ni analitica
                  que consentir, asi que el control sobraria.
                */}
                {/* Sin clave de analitica no hay banner, asi que tampoco hay
                    preferencia que revisar. Mismo criterio que `ConsentBanner`. */}
                {hasConsentedAnalytics ? (
                <li>
                  <button
                    type="button"
                    onClick={clearConsent}
                    className="js-only inline-flex min-h-touch items-center px-1 -mx-1 text-caption text-text-tertiary transition-colors hover:text-foreground"
                  >
                    {t.cookies}
                  </button>
                </li>
                ) : null}
              </ul>
            </nav>

            {/* TODO(jaime): redaccion pendiente de validar con el despacho. */}
            <p className="mx-auto max-w-measure text-center text-caption text-text-tertiary">
              {t.disclaimer}
            </p>

            <p className="text-center text-caption text-text-tertiary">{t.rights}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
