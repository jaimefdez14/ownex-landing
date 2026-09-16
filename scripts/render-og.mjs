/**
 * Genera `public/og-image.png` a partir de `scripts/assets/og-image.html`.
 *
 * Uso: npm run og
 *
 * Existia el HTML fuente pero no la forma de convertirlo, asi que el PNG se
 * regeneraba a mano y se quedo cuatro semanas por detras del copy de la pagina
 * (ver el comentario de cabecera del HTML). Con esto es un comando.
 *
 * No anade ninguna dependencia: `puppeteer-core` ya viene con `lighthouse`, que
 * el proyecto usa para auditar, y el Chrome es el que hay instalado en la
 * maquina. Si no encuentra ninguno, lo dice y no rompe el build: este script no
 * forma parte de `npm run build` a proposito, porque la tarjeta cambia cuando
 * cambia el mensaje, no en cada despliegue.
 */

import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/*
  UNA TARJETA POR IDIOMA - 16/09/2026. La tarjeta lleva el titular del hero, asi que
  una sola en espanol seria lo primero que ve quien recibe el enlace ingles por
  WhatsApp o LinkedIn. Las dos fuentes son el mismo diseno con el copy cambiado.
*/
const CARDS = [
  { source: "scripts/assets/og-image.html", target: "public/og-image.png" },
  { source: "scripts/assets/og-image-en.html", target: "public/og-image-en.png" },
];

/* Rutas habituales del navegador, de mas a menos preferida. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const executablePath = CANDIDATES.find((path) => existsSync(path));

if (!executablePath) {
  console.error(
    "No se ha encontrado un Chrome instalado. Indica la ruta con CHROME_PATH=... npm run og",
  );
  process.exit(1);
}

const browser = await puppeteer.launch({ executablePath, headless: "new" });

try {
  const page = await browser.newPage();
  /*
    `deviceScaleFactor: 1` y no 2. Las dimensiones que declara `index.html`
    (`og:image:width` 1200, `og:image:height` 630) tienen que coincidir con el
    fichero: una tarjeta de 2400x1260 anunciada como 1200x630 la reescalan mal
    algunos clientes de chat.
  */
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });

  for (const card of CARDS) {
    const source = resolve(root, card.source);
    const target = resolve(root, card.target);
    await page.goto(pathToFileURL(source).href, { waitUntil: "networkidle0" });
    /* Sin esto la captura puede salir con la fuente de reserva. */
    await page.evaluateHandle("document.fonts.ready");
    await page.screenshot({ path: target, type: "png" });
    console.log(`Tarjeta generada: ${target}`);
  }
} finally {
  await browser.close();
}
