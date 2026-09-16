import { readFileSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Inyecta el HTML generado por `entry-server` dentro de dist/index.html.
 *
 * Sin este paso, un visitante con JavaScript desactivado recibiria un <div> vacio
 * y el criterio de aceptacion del §5 no se cumpliria. Con este paso, el HTML
 * servido ya contiene la pagina entera y el JavaScript solo la hidrata.
 *
 * DOS PAGINAS DESDE EL 16/09/2026, UNA POR IDIOMA. La misma plantilla compilada
 * (mismos scripts y hojas con hash) se escribe dos veces:
 *
 *   dist/index.html      espanol, en `/`
 *   dist/en/index.html   ingles, en `/en/`
 *
 * Para cada una se reescriben `lang`, titulo, descripcion, URL canonica y las
 * etiquetas de Open Graph y Twitter con los valores de `src/i18n/head.ts`, y se
 * anaden los `hreflang` que emparejan las dos versiones. Si alguna etiqueta no
 * aparece en la plantilla, el build falla: una pagina inglesa con la descripcion
 * en espanol no avisa de nada y se queda asi en los buscadores.
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distIndex = resolve(root, "dist/index.html");

const { render, HEAD, HOME, OG_LOCALE, env } = await import(resolve(root, "dist-ssr/entry-server.js"));

const template = readFileSync(distIndex, "utf8");

if (!template.includes('<div id="root"></div>')) {
  throw new Error("No se ha encontrado el contenedor #root en dist/index.html");
}

const LOCALES = ["es", "en"];
const site = env.siteUrl.replace(/\/$/, "");
const absolute = (path) => `${site}${path}`;

const escapeAttr = (value) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Sustituye UNA etiqueta y exige que exista exactamente una vez. */
function replaceOnce(html, pattern, replacement, what) {
  const matches = html.match(new RegExp(pattern.source, "g"));
  if (!matches || matches.length !== 1) {
    throw new Error(`Prerender: se esperaba una sola etiqueta "${what}" en la plantilla y hay ${matches?.length ?? 0}`);
  }
  return html.replace(pattern, replacement);
}

function meta(html, attr, key, value) {
  const pattern = new RegExp(`<meta\\s+${attr}="${escapeRe(key)}"\\s+content="[^"]*"\\s*/>`);
  return replaceOnce(html, pattern, `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`, key);
}

function withHead(html, locale) {
  const head = HEAD[locale];
  const url = absolute(HOME[locale]);
  const image = absolute(head.ogImage);

  let out = replaceOnce(html, /<html lang="[^"]*">/, `<html lang="${locale}">`, "html lang");
  out = replaceOnce(out, /<title>[\s\S]*?<\/title>/, `<title>${escapeAttr(head.title)}</title>`, "title");
  out = replaceOnce(
    out,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`,
    "canonical",
  );
  out = meta(out, "name", "description", head.description);
  out = meta(out, "property", "og:url", url);
  out = meta(out, "property", "og:title", head.ogTitle);
  out = meta(out, "property", "og:description", head.ogDescription);
  out = meta(out, "property", "og:image", image);
  out = meta(out, "property", "og:image:alt", head.ogImageAlt);
  out = meta(out, "property", "og:locale", OG_LOCALE[locale]);
  out = meta(out, "name", "twitter:title", head.ogTitle);
  out = meta(out, "name", "twitter:description", head.ogDescription);
  out = meta(out, "name", "twitter:image", image);

  /*
    Los `hreflang` van en LAS DOS paginas y cada una se nombra tambien a si misma:
    Google ignora un emparejamiento que no es reciproco. `x-default` apunta al
    espanol, que es el mercado de la operacion y la version que manda.
  */
  const alternates = [
    ...LOCALES.map((l) => `<link rel="alternate" hreflang="${l}" href="${absolute(HOME[l])}" />`),
    `<link rel="alternate" hreflang="x-default" href="${absolute(HOME.es)}" />`,
    ...LOCALES.filter((l) => l !== locale).map(
      (l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}" />`,
    ),
  ].join("\n    ");

  return replaceOnce(out, /<\/head>/, `    ${alternates}\n  </head>`, "</head>");
}

for (const locale of LOCALES) {
  const page = withHead(template, locale).replace(
    '<div id="root"></div>',
    `<div id="root">${render(locale)}</div>`,
  );
  const target = locale === "es" ? distIndex : resolve(root, `dist${HOME[locale]}index.html`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, page);
  console.log(`Prerenderizado listo (${locale}): ${target.replace(root + "/", "")}`);
}

rmSync(resolve(root, "dist-ssr"), { recursive: true, force: true });
