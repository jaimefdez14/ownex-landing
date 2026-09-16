import type { Localized } from "../i18n/locale";
import { RESOURCES_HUB } from "../i18n/routes";

/**
 * Los recursos publicados, para la seccion de la landing.
 *
 * LA FUENTE DE VERDAD DE CADA ARTICULO ES SU HTML en `public/articulos/` (espanol) y
 * `public/en/articles/` (ingles), no este fichero. Aqui vive solo lo que la landing
 * necesita para pintar tres tarjetas: portada, categoria, titulo, resumen y minutos.
 *
 * Por que los articulos no son parte de esta aplicacion de React (decision del
 * 27/08/2026, ampliada el 01/09/2026 al montar el hub):
 *
 * 1. La landing prerenderiza UNA sola pagina por idioma (`scripts/prerender.mjs`
 *    inyecta el HTML dentro de `dist/index.html` y `dist/en/index.html`). Meter los
 *    articulos aqui obligaria a montar enrutado y prerenderizado por ruta para
 *    conseguir exactamente lo que un fichero HTML ya da gratis: una URL propia,
 *    indexable y servida entera al primer byte.
 *
 * 2. El hub y los articulos tienen su propia hoja (`public/articulos/articulos.css`),
 *    su propia cabecera y su propio pie. No comparten ni un componente con la landing,
 *    asi que no ganan nada viviendo dentro de ella.
 *
 * SI AÑADES UN ARTICULO: crea su HTML en los dos idiomas, dalo de alta en los dos hubs
 * (`public/articulos/index.html` y `public/en/articles/index.html`) y en
 * `public/sitemap.xml` -- con su `xhtml:link` apuntando a la otra version --, y decide
 * si entra o no en estas tres tarjetas. La lista de la landing es una seleccion, no un
 * listado completo: el listado completo es el hub.
 *
 * LAS PORTADAS SE COMPARTEN entre los dos idiomas: son diagramas sin una sola palabra
 * (comprobado), asi que no hay nada que traducir en ellas.
 */

export type Recurso = {
  href: string;
  portada: string;
  categoria: string;
  titulo: string;
  resumen: string;
  minutos: string;
};

/**
 * Cuantos recursos hay publicados en total. Lo dice el enlace al hub.
 *
 * UNA CIFRA POR IDIOMA - 16/09/2026, y hoy las dos valen 16 porque los dos hubs
 * publican lo mismo. No es una constante duplicada por gusto: el enlace promete un
 * listado, asi que tiene que decir lo que hay DETRAS de el, no lo que hay en el sitio.
 * Los dos hubs se han desincronizado ya una vez (durante unas horas el espanol tenia
 * 16 articulos y el ingles 10), y con una sola cifra la version inglesa habria
 * prometido un listado que no existia.
 *
 * SI SE PUBLICA UN ARTICULO: sube la cifra del idioma en el que se publique, y solo la
 * de ese idioma hasta que exista la traduccion.
 */
export const TOTAL_RECURSOS: Localized<number> = { es: 16, en: 16 };

export const HUB_RECURSOS = RESOURCES_HUB;

/**
 * Los tres que se enseñan en la landing. Elegidos por el recorrido que hace un
 * fundador que acaba de entender la propuesta: se puede hacer, cuanto sale, y que
 * estructura hace falta.
 */
export const RECURSOS_DESTACADOS: Localized<Recurso[]> = {
  es: [
    {
      href: "/articulos/ronda-de-financiacion-con-tus-clientes.html",
      portada: "/articulos/portadas/rondas.svg",
      categoria: "Estructura y regulación",
      titulo: "Cómo abrir una ronda de financiación a tus clientes en España",
      resumen:
        "Qué estructura necesitas, qué exige la Ley 6/2023 y por qué el límite de 90.000 euros que todo el mundo cita no es un límite legal.",
      minutos: "9 min",
    },
    {
      href: "/articulos/cuanto-puede-invertir-tu-comunidad.html",
      portada: "/articulos/portadas/comunidad.svg",
      categoria: "Comunidad e inversores",
      titulo: "Cuánto capital puede aportar tu comunidad: cómo estimarlo",
      resumen:
        "Tres variables, tres escenarios y una comprobación contra rondas ya cerradas, para saber qué importe soporta tu base de clientes.",
      minutos: "9 min",
    },
    {
      href: "/articulos/spv-cap-table-limpio.html",
      portada: "/articulos/portadas/cap-table.svg",
      categoria: "Estructura y regulación",
      titulo: "Qué es un SPV y por qué tu próxima ronda depende de él",
      resumen:
        "Cómo un vehículo agrupa a cientos de inversores en una sola línea, qué conserva el inversor y los tres errores que se repiten.",
      minutos: "7 min",
    },
  ],
  en: [
    {
      href: "/en/articles/funding-round-with-your-customers.html",
      portada: "/articulos/portadas/rondas.svg",
      categoria: "Structure and regulation",
      titulo: "How to open a funding round to your customers in Spain",
      resumen:
        "What structure you need, what Law 6/2023 requires and why the €90,000 limit everyone quotes is not a legal limit.",
      minutos: "9 min",
    },
    {
      href: "/en/articles/how-much-can-your-community-invest.html",
      portada: "/articulos/portadas/comunidad.svg",
      categoria: "Community and investors",
      titulo: "How much capital your community can contribute, and how to estimate it",
      resumen:
        "Three variables, three scenarios and a check against rounds already closed, to see what amount your customer base supports.",
      minutos: "9 min",
    },
    {
      href: "/en/articles/spv-clean-cap-table.html",
      portada: "/articulos/portadas/cap-table.svg",
      categoria: "Structure and regulation",
      titulo: "What an SPV is and why your next round depends on it",
      resumen:
        "How a vehicle groups hundreds of investors into a single line, what the investor keeps and the three mistakes that keep repeating.",
      minutos: "7 min",
    },
  ],
};
