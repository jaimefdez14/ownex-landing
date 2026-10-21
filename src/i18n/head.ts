import type { Localized } from "./locale";

/**
 * Los metadatos del `<head>` de la landing, por idioma.
 *
 * `index.html` sigue llevando los espanoles escritos a mano, porque es lo que sirve
 * `vite dev`. En el build, `scripts/prerender.mjs` reescribe cada etiqueta con los
 * valores de aqui para las DOS paginas (`/` y `/en/`), asi que en produccion la
 * fuente de verdad es este fichero. Si se cambia un titular, se cambia aqui; el
 * `index.html` solo hace falta tocarlo para que el servidor de desarrollo lo refleje.
 *
 * El prerenderizado falla si alguna etiqueta que tiene que reescribir no aparece en la
 * plantilla: un `<head>` a medio traducir es peor que un build roto, porque no avisa.
 */

export type HeadMeta = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogImageAlt: string;
};

export const HEAD: Localized<HeadMeta> = {
  es: {
    title: "Ownex | Convierte a tu comunidad en accionistas",
    description:
      "Plataforma B2B de co-propiedad para negocios de consumo. Estructura legal, emisión de equity o deuda dirigida a tu comunidad y gestión continua de inversores.",
    ogTitle: "Convierte a tu comunidad en accionistas | Ownex",
    ogDescription:
      "Quienes ya compran, recomiendan y defienden tu negocio pueden ser parte de él. Entran juntos en una sola línea de tu cap table, y tú mantienes el control.",
    ogImage: "/og-image.png",
    ogImageAlt: "Ownex. Convierte a tu comunidad en accionistas.",
  },
  en: {
    title: "Ownex | Turn your community into shareholders",
    description:
      "B2B co-ownership platform for consumer businesses. Legal structure, equity or debt issuance aimed at your community and ongoing investor management.",
    ogTitle: "Turn your community into shareholders | Ownex",
    ogDescription:
      "The people who already buy, recommend and stand up for your business can own part of it. They come in together as a single line on your cap table, and you stay in control.",
    ogImage: "/og-image-en.png",
    ogImageAlt: "Ownex. Turn your community into shareholders.",
  },
};
