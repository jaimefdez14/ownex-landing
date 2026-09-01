import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, type Connect, type PluginOption } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Índices de directorio para las páginas estáticas de `public/`.
 *
 * EL PROBLEMA (01/09/2026). El hub de recursos vive en `public/articulos/index.html`
 * y se enlaza como `/articulos/`, que es la URL que queremos publicada. Un alojamiento
 * estático (Vercel, o cualquier servidor de ficheros) resuelve ese directorio a su
 * `index.html` sin que haya que decirle nada, y así está verificado sobre el `dist`
 * real. Pero `vite dev` y `vite preview` no: su middleware de estáticos no hace
 * índice de directorio, la petición cae en el fallback de aplicación de una sola
 * página y devuelven la LANDING con un 200.
 *
 * El efecto era desconcertante justo donde más molesta: pulsabas "Ver los 10 recursos
 * publicados" y volvías a la landing, o sea que en desarrollo parecía que solo
 * existían los tres artículos destacados.
 *
 * Esto lo arregla donde estaba roto y no toca producción: reescribe la petición antes
 * del fallback, y solo si el `index.html` existe de verdad en `public/`.
 */
function indicesDeDirectorio(): PluginOption {
  const publicDir = resolve(process.cwd(), "public");

  const middleware: Connect.NextHandleFunction = (req, _res, next) => {
    const url = req.url ?? "/";
    const [ruta] = url.split("?");
    if (ruta !== "/" && !ruta.includes(".")) {
      const limpia = ruta.endsWith("/") ? ruta.slice(0, -1) : ruta;
      if (existsSync(resolve(publicDir, `.${limpia}/index.html`))) {
        req.url = `${limpia}/index.html${url.slice(ruta.length)}`;
      }
    }
    next();
  };

  /*
    Se registra ANTES de los middlewares internos de Vite (llamando a `use` dentro
    del hook, no devolviendo una funcion, que lo pondria detras). Detras no sirve:
    para cuando le llegaria el turno, el fallback ya habria contestado con la
    landing. Delante, la peticion llega reescrita al middleware que sirve el HTML
    de `public/` y este la resuelve como cualquier otra pagina estatica.
  */
  return {
    name: "ownex-indices-de-directorio",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), indicesDeDirectorio()],
  server: {
    port: Number(process.env.PORT) || 5188,
  },
  // `vite preview` reads its port from this key, not from `server`. Sin esto, quitar
  // el `--port` fijo del script `preview` de package.json haría que cayera en el
  // 4173 por defecto de Vite en lugar de respetar el puerto que asigne el harness.
  preview: {
    port: Number(process.env.PORT) || 4173,
  },
  build: {
    assetsInlineLimit: 0,
  },
});
