import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

/**
 * Se marca <html> como "js" ANTES de renderizar (§5.3).
 * Solo a partir de esta linea puede existir el estado oculto de las revelaciones.
 * Si este archivo no llega a ejecutarse, el CSS deja todo el contenido visible.
 */
document.documentElement.classList.add("js");

const container = document.getElementById("root");

if (container) {
  // El HTML llega prerenderizado desde el build, asi que se hidrata en lugar de
  // volver a pintarlo. En desarrollo el contenedor esta vacio y se monta normal.
  if (container.hasChildNodes()) {
    hydrateRoot(container, <App />);
  } else {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
