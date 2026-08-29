/**
 * Comprobaciones automaticas del §14 sobre el codigo fuente.
 *
 * Alcance: src/, public/, index.html, api/, tailwind.config.js y este README.
 * Quedan fuera node_modules y los ficheros de bloqueo de dependencias, que no
 * forman parte del contenido publicado.
 *
 * Uso: npm run check:copy
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const ROOTS = ["src", "public", "api", "scripts/assets"];
const FILES = ["index.html", "tailwind.config.js", "README.md"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".css", ".html", ".txt", ".xml", ".svg", ".md"]);

function collect() {
  const found = [];

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === "fonts") continue;
        walk(full);
      } else if (EXTENSIONS.has(extname(entry))) {
        found.push(full);
      }
    }
  };

  for (const dir of ROOTS) {
    try {
      walk(join(root, dir));
    } catch {
      // Carpeta opcional.
    }
  }

  for (const file of FILES) {
    try {
      statSync(join(root, file));
      found.push(join(root, file));
    } catch {
      // Fichero opcional.
    }
  }

  return found;
}

/*
 * El README documenta las decisiones tomadas y, para explicarlas, cita la redaccion
 * original del brief, que iba en tuteo. Es documentacion interna, no copy publicado,
 * asi que queda fuera de las reglas de registro y microtipografia. Si sigue dentro de
 * las de vocabulario prohibido, que el §0 extiende a todo el repositorio.
 */
const README = /README\.md$/;

/** Cada regla devuelve las coincidencias que deberian ser cero. */
const rules = [
  {
    name: "Vocabulario prohibido (§0)",
    pattern: /\b(tokeniza\w*|tokens?|blockchain|criptos?|cryptos?|smart\s+contracts?|wallets?)\b/gi,
    /*
      RETIRADA LA EXCEPCION DE "TOKENIZADA" - 29/08/2026.

      Descartaba la frase exacta "Financiación alternativa tokenizada", que era el
      rotulo del hero (aprobada por Jaime el 11-ago-2026). Ese rotulo pasa a decir
      "Para negocios con comunidad", asi que la excepcion se queda sin nada que
      descartar y la regla vuelve a aplicarse entera sobre `src/`.

      Que quede escrito por si vuelve la duda: la palabra no se retira por la regla,
      se retira porque era la PRIMERA linea que se leia en la pagina y gastaba ese
      sitio en la unica palabra que hace pensar en cripto a quien todavia no sabe
      lo que hacemos.
    */
    /*
      SEGUNDA EXCEPCION, 27/08/2026: la carpeta de articulos.

      El §0 prohibe este vocabulario en las SUPERFICIES DEL PRODUCTO, y por un
      motivo que sigue siendo bueno: nada de lo que Ownex enseña a un cliente
      debe parecerse a la jerga del sector con el que no quiere que lo confundan.

      Pero un articulo de captacion por buscador no es una superficie de
      producto: es una respuesta a lo que alguien ya ha escrito en Google. Quien
      busca "tokenizacion de activos" usa esa palabra, y no se le puede responder
      con una pagina que la evita. La regla se levanta AHI y solo ahi.

      Esto no diluye el §0, lo acota: la prohibicion sigue entera en `src/`, en
      `api/` y en el resto de `public/`. Si algun dia un articulo se convierte en
      seccion de la landing, ese texto vuelve a estar sujeto a la regla.
    */
    exclude: [/public\/articulos\//],
  },
  {
    // Se comprueban aparte y respetando mayusculas: en minusculas colisionan con
    // palabras corrientes del espanol ("economica" contiene "mica"). "DLT" se saco
    // de esta lista el 11-ago-2026: Jaime decidio reincorporar a proposito la ficha
    // del DLT Pilot Regime en RegulationSection.tsx (ver el comentario de ese
    // fichero), asi que ya no tiene sentido seguir prohibiendo la sigla.
    name: "Siglas prohibidas (§0)",
    pattern: /\b(MiCA|MICA|Web3|WEB3)\b/g,
  },
  {
    name: "Wordmark incorrecto (§0)",
    pattern: /\b(OwnEX|OWNEX)\b/g,
  },
  {
    name: "Raya o semirraya en el copy (§4.1)",
    pattern: /[—–]/g,
    exclude: [README],
  },
  /*
    Las dos reglas de registro que habia aqui (tuteo e imperativo de segunda
    persona) se han retirado en la v2. El §0 del brief exigia registro neutro, pero
    Jaime decidio adoptar el copy del proyecto de Lovable tal cual, que va en tuteo
    y usa "accionista" en lugar de "propietario". Es una decision consciente y
    documentada en el README, no un descuido, asi que el script deja de vigilarlo.

    Todo lo demas sigue vigilado: el vocabulario prohibido del §0 no se ha tocado.
  */
  {
    name: "Simbolo € o % sin espacio duro (§4.1)",
    pattern: /\d ([€%£])/g,
    exclude: [README],
  },
  {
    name: "Decimal con punto en el copy (§4.1)",
    pattern: /(?<![\d.])\d+\.\d\b(?!\d)/g,
    onlyText: true,
    // Las referencias a apartados del brief (§4.1) y los valores entre corchetes de
    // las clases de Tailwind (`leading-[1.5]`) no son copy: se descartan antes de
    // comparar.
    strip: [/§\s?\d+(\.\d+)*/g, /\[[^\]]*\]/g],
    only: [/\.tsx$/],
  },
];

/**
 * Extrae solo el texto que ve una persona: cadenas entre comillas de los .tsx y
 * el texto suelto del JSX. Evita marcar clases de Tailwind y nombres de simbolos.
 */
function visibleText(source, file) {
  if (!file.endsWith(".tsx") && !file.endsWith(".ts")) return source;

  const strings = source.match(/"[^"\n]{4,}"|'[^'\n]{4,}'/g) ?? [];
  const jsxText = source.match(/>\s*[^<>{}\n][^<>{}]*</g) ?? [];

  return [...strings, ...jsxText]
    .filter((chunk) => !/^["']?(?:[a-z0-9-]+ )*[a-z0-9-]+["']?$/i.test(chunk.trim()) || /[áéíóúñ¿¡]/i.test(chunk))
    .join("\n");
}

let failures = 0;
const files = collect();

for (const rule of rules) {
  const hits = [];

  for (const file of files) {
    if (rule.exclude?.some((pattern) => pattern.test(file))) continue;
    if (rule.only && !rule.only.some((pattern) => pattern.test(file))) continue;

    const source = readFileSync(file, "utf8");
    let haystack = rule.onlyText ? visibleText(source, file) : source;
    for (const pattern of rule.strip ?? []) haystack = haystack.replace(pattern, "");

    const matches = haystack.match(rule.pattern);
    if (matches) {
      hits.push(`  ${file.replace(root + "/", "")}: ${[...new Set(matches)].join(", ")}`);
    }
  }

  if (hits.length > 0) {
    failures += hits.length;
    console.log(`FALLA  ${rule.name}`);
    console.log(hits.join("\n"));
  } else {
    console.log(`OK     ${rule.name}`);
  }
}

console.log("");
console.log(failures === 0 ? "Sin incidencias." : `${failures} fichero(s) con incidencias.`);
process.exit(failures === 0 ? 0 : 1);
