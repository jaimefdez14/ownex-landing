/**
 * Los recursos publicados, para la seccion de la landing.
 *
 * LA FUENTE DE VERDAD DE CADA ARTICULO ES SU HTML en `public/articulos/`, no este
 * fichero. Aqui vive solo lo que la landing necesita para pintar tres tarjetas:
 * portada, categoria, titulo, resumen y minutos.
 *
 * Por que los articulos no son parte de esta aplicacion de React (decision del
 * 27/08/2026, ampliada el 01/09/2026 al montar el hub):
 *
 * 1. La landing prerenderiza UNA sola pagina (`scripts/prerender.mjs` inyecta el
 *    HTML dentro de `dist/index.html`). Meter los articulos aqui obligaria a montar
 *    enrutado y prerenderizado por ruta para conseguir exactamente lo que un fichero
 *    HTML ya da gratis: una URL propia, indexable y servida entera al primer byte.
 *
 * 2. El hub y los articulos tienen su propia hoja (`public/articulos/articulos.css`),
 *    su propia cabecera y su propio pie. No comparten ni un componente con la landing,
 *    asi que no ganan nada viviendo dentro de ella.
 *
 * SI AÑADES UN ARTICULO: crea su HTML, dalo de alta en `public/articulos/index.html`
 * y en `public/sitemap.xml`, y decide si entra o no en estas tres tarjetas. La lista
 * de la landing es una seleccion, no un listado completo: el listado completo es el hub.
 */

export type Recurso = {
  href: string;
  portada: string;
  categoria: string;
  titulo: string;
  resumen: string;
  minutos: string;
};

/** Cuantos recursos hay publicados en total. Lo dice el enlace al hub. */
export const TOTAL_RECURSOS = 10;

export const HUB_RECURSOS = "/articulos/";

/**
 * Los tres que se enseñan en la landing. Elegidos por el recorrido que hace un
 * fundador que acaba de entender la propuesta: se puede hacer, cuanto sale, y que
 * estructura hace falta.
 */
export const RECURSOS_DESTACADOS: Recurso[] = [
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
];
