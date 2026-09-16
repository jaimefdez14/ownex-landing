import { renderToString } from "react-dom/server";
import { App } from "./App";
import type { Locale } from "./i18n/locale";

export { HEAD } from "./i18n/head";
export { HOME, OG_LOCALE } from "./i18n/routes";
export { env } from "./lib/env";

/**
 * Entrada de prerenderizado.
 *
 * El criterio de aceptacion del §5 exige que la pagina completa se vea y se lea
 * con JavaScript desactivado. Una aplicacion de React renderizada solo en el
 * cliente serviria un contenedor vacio, asi que el HTML se genera en el momento
 * de compilar y el cliente se limita a hidratarlo.
 *
 * Desde el 16/09/2026 se llama una vez por idioma: `scripts/prerender.mjs` escribe
 * `dist/index.html` en espanol y `dist/en/index.html` en ingles.
 */
export function render(locale: Locale) {
  return renderToString(<App locale={locale} />);
}
