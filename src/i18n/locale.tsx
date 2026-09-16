import { createContext, useContext, type ReactNode } from "react";

/**
 * Idioma de la pagina.
 *
 * NUEVO EL 16/09/2026: la landing pasa a publicarse en espanol y en ingles.
 *
 * EL IDIOMA LO DECIDE LA URL, Y SOLO ELLA. `/` es espanol y `/en/` es ingles. No
 * se lee `navigator.language` ni se redirige por la cabecera `Accept-Language`, y es
 * a proposito: una redireccion automatica por idioma le esconde a Google una de las
 * dos versiones (su rastreador llega sin preferencia de idioma) y le quita al
 * visitante la version que ha pedido al pegar un enlace. Con una URL por idioma,
 * cada version es indexable, enlazable y cacheable por separado, y el `hreflang`
 * del `<head>` es lo que le dice al buscador cual servir a quien.
 *
 * Las dos versiones se PRERENDERIZAN en el build (`scripts/prerender.mjs`), asi que
 * el HTML servido ya viene en su idioma y el cliente solo hidrata. Por eso el idioma
 * no puede ser estado que cambie en caliente: cambiar de idioma es cambiar de pagina,
 * que es exactamente lo que hace el conmutador (`LanguageSwitch`).
 */

export type Locale = "es" | "en";

export const LOCALES: readonly Locale[] = ["es", "en"];

/** Una pieza de copy en los dos idiomas. El ingles tiene que tener la misma forma. */
export type Localized<T> = Record<Locale, T>;

export function localeFromPath(pathname: string): Locale {
  return /^\/en(\/|$)/.test(pathname) ? "en" : "es";
}

const LocaleContext = createContext<Locale>("es");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Devuelve la variante del idioma activo. */
export function useCopy<T>(copy: Localized<T>): T {
  return copy[useLocale()];
}
