import { Reveal } from "./ui/Reveal";

/**
 * Banda de cifras bajo el hero.
 *
 * Cuatro respuestas a las cuatro preguntas que un fundador se hace antes de
 * seguir leyendo: cuánto tarda, qué le hace a su cap table, qué cuesta y qué
 * arriesga por hablar con nosotros. Van juntas y a la vista, no repartidas en
 * cuatro secciones distintas, porque es la información que decide si sigue
 * bajando o cierra la pestaña.
 *
 * Es una tabla de datos, no una lista de argumentos: cada celda es una cifra
 * con su unidad y una línea que la explica. Sin iconos y sin adorno, que es lo
 * que hace que se lea como un dato y no como un eslogan.
 *
 * Los separadores son bordes verticales entre columnas y desaparecen en el
 * primer elemento de cada fila. En móvil (una sola columna) no hay filete: la
 * separación la marca el hueco vertical.
 *
 * VA EN OSCURO, y por dos motivos. El primero es que las cifras grandes en
 * blanco sobre negro tienen una fuerza que sobre un lienzo claro no tienen, y
 * esta banda existe para que cuatro números se lean de un vistazo. El segundo es
 * de ritmo: la sección que viene detrás ("El desajuste") ya es el lienzo alterno
 * verde, así que en claro esta banda se habría fundido con ella en un solo
 * bloque continuo y el hero habría perdido su cierre.
 */

const metrics = [
  {
    figure: "8 a 12",
    unit: "semanas",
    detail: "De la estructuración a la emisión activa.",
  },
  {
    figure: "1",
    unit: "línea",
    detail: "Todos los accionistas, agregados en tu cap table vía SPV.",
  },
  /*
    ESTE HUECO LLEVA DOS SUSTITUCIONES EL MISMO DIA.

    Empezo siendo la comision ("5 % del capital captado, cobrado solo al cerrar la
    ronda"). Jaime la quito: no quiere hablar de precio en la primera pantalla, y
    tiene sentido comercial, porque un porcentaje sin contexto invita a comparar
    antes de entender que se compara. Se propuso en su lugar el limite legal de la
    oferta (8 M€) y Jaime eligio esta, el argumento de marca blanca.

    Las otras tres responden a una objecion cada una: cuanto tarda, que le pasa a
    mi cap table, y que me cuesta averiguar si encajo. Esta responde a "¿y mis
    clientes van a ver que hay un tercero por medio?", que es la que decide si una
    marca con comunidad se atreve o no.

    DONDE ESTA EL LIMITE DE LA AFIRMACION, para no pasarse: el 100 % vale para la
    RELACION, que es lo que la marca controla, y por eso la frase dice eso y no
    "de todo". Los documentos legales que recibe el inversor (el documento de la
    emision, los certificados de legitimacion) los emiten las entidades reguladas y
    llevan su nombre. Ownex sigue sin aparecer en ninguno.

    Va en tuteo como sus dos vecinas ("tu cap table", "tu marca"). El registro
    impersonal que se acaba de aplicar es SOLO de la seccion de producto: cambiar
    esta banda entera no lo ha pedido nadie.
  */
  {
    figure: "100",
    unit: "%",
    detail: "De la relación con tus accionistas ocurre bajo tu marca.",
  },
  {
    figure: "0",
    unit: "€",
    detail: "Para evaluar el encaje de tu marca con nosotros.",
  },
];

export function HeroMetrics() {
  return (
    /*
      LA JUNTA CON EL HERO - 27/08/2026.

      Antes el hero blanco se acababa y el negro empezaba, a hueso. Un corte recto
      entre dos colores opuestos es lo que hace que dos secciones parezcan dos
      paginas pegadas en vez de una sola que continua.

      Ahora esta banda sube unos pixeles POR ENCIMA del hero y redondea sus dos
      esquinas de arriba, asi que se lee como un panel que se desliza sobre la
      pagina. Es el gesto de la mayoria de los productos que se toman en serio hoy
      (Linear, Stripe, Vercel) y cuesta tres propiedades, no una libreria.

      Los detalles que lo hacen funcionar y no parecer un accidente:

        `-mt-*`   el solape. Sale del relleno inferior del hero (80px), asi que
                  se come hueco muerto y no contenido.
        `z-10`    la banda tiene que pintarse ENCIMA del hero para que el solape
                  se vea; sin esto queda por debajo y el redondeo no se aprecia.
        `shadow`  una sombra hacia ARRIBA (desplazamiento negativo). Es la que
                  convierte el solape en profundidad: sin ella el redondeo se lee
                  como un recorte, con ella como un plano que se levanta.

      El radio crece con el ancho: 20px en movil, 32 desde `md`. Un radio fijo se
      queda enorme en 390px y ridiculo en 1440.

      `dock-in` es el movimiento que remata la junta: la banda llega encogida y se
      ensancha hasta su sitio segun entra en pantalla, ligada al scroll. Vive en
      `index.css` (bloque 14), con el porque de su `transform-origin`.
    */
    <section
      aria-label="Ownex en cuatro cifras"
      className="dock-in relative z-10 -mt-5 rounded-t-[20px] shadow-[0_-16px_40px_-20px_rgb(14_15_12_/_0.28)] spotlight bg-background theme-dark md:-mt-8 md:rounded-t-[32px]"
    >
      <div className="shell py-12 md:py-16">
        <Reveal>
          {/*
            UNA COLUMNA EN MOVIL - 28/08/2026.

            Eran dos columnas siempre. En 375px cada celda se queda en ~150px, y
            ahi "8 a 12" (a 40px) no cabe en una linea con "semanas" al lado: el
            numero se partia en "8 a" / "12" con la unidad colgando, y los pies
            de texto se estiraban a cuatro y cinco lineas. Las cifras grandes
            piden ancho, no reticula.

            Ahora: una columna hasta `sm`, dos hasta `lg`, cuatro desde ahi. El
            filete vertical solo aparece cuando de verdad hay dos columnas que
            separar.
          */}
          <dl className="grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ figure, unit, detail }, index) => (
              <div
                key={detail}
                className={
                  /*
                    El filete separa columnas, nunca abre una fila: se quita en
                    el primer elemento de cada fila (segundo en `sm`, cuarto en
                    `lg`) para que no cuelgue un borde suelto al borde izquierdo
                    de la reticula. En una sola columna no hay filete: separa el
                    hueco vertical.
                  */
                  index === 0
                    ? "lg:pl-0"
                    : index % 2 === 1
                      ? "sm:border-l sm:border-border sm:pl-6 lg:pl-8"
                      : "lg:border-l lg:border-border lg:pl-8"
                }
              >
                <dt className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-display tabular text-foreground whitespace-nowrap">
                    {figure}
                  </span>
                  <span className="text-title text-text-secondary">{unit}</span>
                </dt>
                <dd className="mt-3 max-w-[34ch] text-caption-lg text-text-secondary lg:text-caption">
                  {detail}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
