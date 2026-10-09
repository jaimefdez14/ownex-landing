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
    title: "Ownex | Convierte a tus clientes en accionistas",
    description:
      "Plataforma B2B de co-propiedad para marcas de consumo. Estructura legal, emisión de equity o deuda dirigida a tu comunidad y gestión continua de inversores.",
    ogTitle: "Convierte a tus clientes en accionistas | Ownex",
    ogDescription:
      "Tus mejores clientes ya hacen crecer tu marca. Permíteles ser parte del negocio y levanta financiación desde tu comunidad.",
    ogImage: "/og-image.png",
    ogImageAlt: "Ownex. Convierte a tus clientes en accionistas.",
  },
  en: {
    title: "Ownex | Turn your customers into shareholders",
    description:
      "B2B co-ownership platform for consumer brands. Legal structure, equity or debt issuance aimed at your community and ongoing investor management.",
    ogTitle: "Turn your customers into shareholders | Ownex",
    ogDescription:
      "Your best customers already grow your brand. Let them become part of the business and raise funding from your community.",
    ogImage: "/og-image-en.png",
    ogImageAlt: "Ownex. Turn your customers into shareholders.",
  },
};
