import type { MouseEvent } from "react";
import { LOCALES, useLocale, type Locale } from "../i18n/locale";
import { HOME } from "../i18n/routes";
import { track } from "../lib/analytics";
import { cn } from "../lib/cn";

/**
 * Conmutador de idioma: "ES / EN".
 *
 * NUEVO EL 16/09/2026, con la version inglesa de la landing.
 *
 * SON ENLACES, NO BOTONES. Cambiar de idioma es cambiar de pagina (`/` y `/en/` son
 * dos documentos prerenderizados, ver `i18n/locale.tsx`), asi que el control tiene
 * que ser lo que es: un `<a href>` con `hreflang`. Funciona sin JavaScript, se puede
 * abrir en otra pestana y el buscador lo sigue.
 *
 * CONSERVA LA SECCION. Con JavaScript, el clic anade el fragmento en el que estas:
 * quien cambia de idioma leyendo las preguntas frecuentes aterriza en las preguntas
 * frecuentes del otro idioma, no en el hero. Las anclas son las mismas en los dos
 * (`i18n/routes.ts`), y `useHashLanding` resuelve el salto al llegar. Con Cmd/Ctrl o
 * boton central se deja pasar el enlace tal cual, para no romper "abrir en pestana".
 *
 * SIN ACENTO. Es un control de servicio, no una llamada a la accion: el idioma activo
 * va en tinta principal y el otro en secundaria, y el presupuesto de acento de la
 * barra sigue siendo del boton de "Agendar una llamada".
 *
 * Nombre accesible: el idioma entero ("English"), que contiene el rotulo visible
 * ("EN"), asi que quien navega por voz puede decir lo que ve (WCAG §2.5.3). El `lang`
 * de cada enlace hace que un lector de pantalla pronuncie cada nombre en su idioma.
 */

const NAME: Record<Locale, string> = { es: "Español", en: "English" };
const SHORT: Record<Locale, string> = { es: "ES", en: "EN" };
const GROUP_LABEL: Record<Locale, string> = { es: "Idioma", en: "Language" };

export function LanguageSwitch({ className }: { className?: string }) {
  const locale = useLocale();

  const onSwitch = (target: Locale) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    track("language_switch", { from: locale, to: target });
    window.location.assign(`${HOME[target]}${window.location.hash}`);
  };

  return (
    <ul aria-label={GROUP_LABEL[locale]} className={cn("flex items-center", className)}>
      {LOCALES.map((option, index) => (
        <li key={option} className="flex items-center">
          {index > 0 ? (
            <span aria-hidden="true" className="text-caption text-text-tertiary">
              /
            </span>
          ) : null}
          {option === locale ? (
            <span
              aria-current="true"
              lang={option}
              className="inline-flex min-h-touch items-center px-2 text-caption font-medium text-foreground"
            >
              <span className="sr-only">{NAME[option]}</span>
              <span aria-hidden="true">{SHORT[option]}</span>
            </span>
          ) : (
            <a
              href={HOME[option]}
              hrefLang={option}
              lang={option}
              onClick={onSwitch(option)}
              className="inline-flex min-h-touch items-center px-2 text-caption text-text-secondary transition-colors hover:text-foreground"
            >
              <span className="sr-only">{NAME[option]}</span>
              <span aria-hidden="true">{SHORT[option]}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
