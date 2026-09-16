import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { localeFromPath } from "./i18n/locale";
import "./index.css";

/**
 * Se marca <html> como "js" ANTES de renderizar (§5.3).
 * Solo a partir de esta linea puede existir el estado oculto de las revelaciones.
 * Si este archivo no llega a ejecutarse, el CSS deja todo el contenido visible.
 */
document.documentElement.classList.add("js");

/*
  El idioma sale de la URL, igual que en el prerenderizado: `/en/` hidrata el HTML
  ingles y cualquier otra ruta el espanol. Tienen que coincidir o React encontraria
  un texto distinto del que el servidor pinto.

  El `lang` ya viene bien puesto en el HTML compilado; se fija aqui tambien para
  `vite dev`, que sirve siempre el `index.html` espanol.
*/
const locale = localeFromPath(window.location.pathname);
document.documentElement.lang = locale;

const container = document.getElementById("root");

if (container) {
  // El HTML llega prerenderizado desde el build, asi que se hidrata en lugar de
  // volver a pintarlo. En desarrollo el contenedor esta vacio y se monta normal.
  if (container.hasChildNodes()) {
    hydrateRoot(container, <App locale={locale} />);
  } else {
    createRoot(container).render(
      <StrictMode>
        <App locale={locale} />
      </StrictMode>,
    );
  }
}
