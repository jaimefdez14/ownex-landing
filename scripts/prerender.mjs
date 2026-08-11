import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Inyecta el HTML generado por `entry-server` dentro de dist/index.html.
 *
 * Sin este paso, un visitante con JavaScript desactivado recibiria un <div> vacio
 * y el criterio de aceptacion del §5 no se cumpliria. Con este paso, el HTML
 * servido ya contiene la pagina entera y el JavaScript solo la hidrata.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = resolve(root, "dist/index.html");

const { render } = await import(resolve(root, "dist-ssr/entry-server.js"));
const html = render();

const template = readFileSync(distIndex, "utf8");

if (!template.includes('<div id="root"></div>')) {
  throw new Error("No se ha encontrado el contenedor #root en dist/index.html");
}

writeFileSync(distIndex, template.replace('<div id="root"></div>', `<div id="root">${html}</div>`));

rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });

console.log("Prerenderizado listo: dist/index.html contiene la pagina completa.");
