import type { Locale, Localized } from "./locale";

/**
 * Las URL que cambian con el idioma.
 *
 * Las anclas de seccion (`#contact`, `#faq`...) NO cambian: son identificadores, no
 * copy, y mantenerlos iguales es lo que permite que el conmutador de idioma conserve
 * la seccion en la que estabas (`/en/#faq` lleva al mismo sitio que `/#faq`).
 *
 * Lo que si cambia son las paginas estaticas de `public/`. Las inglesas viven bajo
 * `public/en/` con slugs en ingles, porque un slug es texto que el buscador lee y que
 * la persona ve en el enlace.
 */

export const HOME: Localized<string> = { es: "/", en: "/en/" };

export const RESOURCES_HUB: Localized<string> = { es: "/articulos/", en: "/en/articles/" };

export const LEGAL: Localized<{ notice: string; privacy: string; cookies: string }> = {
  es: { notice: "/aviso-legal.html", privacy: "/privacidad.html", cookies: "/cookies.html" },
  en: { notice: "/en/legal-notice.html", privacy: "/en/privacy.html", cookies: "/en/cookies.html" },
};

/** Etiqueta de `og:locale`, que usa la convencion idioma_REGION. */
export const OG_LOCALE: Record<Locale, string> = { es: "es_ES", en: "en_GB" };
