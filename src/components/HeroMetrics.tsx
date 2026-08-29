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
 * primer elemento de cada fila, así que funcionan igual en las cuatro columnas
 * de escritorio que en las dos de móvil.
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
      <div className="shell py-9 sm:py-12 md:py-16">
        <Reveal>
          {/*
            TERCERA MAQUETA EN DOS DIAS, Y ESTA VEZ CON LA MEDIDA DELANTE
            (29/08/2026). Conviene dejar las tres escritas, porque la buena solo
            se entiende contra las otras dos:

              2 columnas, cifra a 40px   la original. A 375px cada celda cae a
                                         ~150px y "8 a 12" no cabe: el numero se
                                         partia en "8 a" / "12" con la unidad
                                         colgando al lado.
              1 columna,  cifra a 40px   arreglo del 28/08. Se leia bien, pero
                                         costaba 563px (0,69 de pantalla) para
                                         cuatro datos: cuatro cifras enormes, una
                                         debajo de otra, con el pie a dos lineas.
                                         Jaime: "son demasiado grandes, ocupan
                                         mucho".
              2 columnas, cifra a 28px   esta. El error de la primera no era la
                                         reticula, era el TAMANO: 40px es una
                                         medida de escritorio metida en un
                                         telefono. A 28px la cifra vuelve a caber
                                         de sobra en media columna y la banda baja
                                         a ~300px.

            La cifra sigue siendo lo primero que se ve (28px contra 13 del pie:
            mas del doble), que es lo unico que esta banda tiene que conseguir. Lo
            que se pierde no es jerarquia, es escala bruta.

            `flex-wrap` en el `dt` se queda como red: si algun dia una cifra crece
            ("10 a 14"), la unidad baja a su propia linea en vez de desbordar.
            Desde `sm` no hace falta, pero tampoco estorba.
          */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-7 sm:gap-y-8 lg:grid-cols-4">
            {metrics.map(({ figure, unit, detail }, index) => (
              <div
                key={detail}
                className={
                  /*
                    El filete separa columnas, nunca abre una fila: se quita en
                    el primer elemento de cada fila (par en movil y en `sm`,
                    cuarto en `lg`) para que no cuelgue un borde suelto al borde
                    izquierdo de la reticula.
                  */
                  index % 2 === 0
                    ? "lg:border-l lg:border-border lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
                    : "border-l border-border pl-4 sm:pl-6 lg:pl-8 lg:first:border-l-0"
                }
              >
                {/*
                  El hueco va en pixeles (`gap-x-[6px]`) y no en la escala de
                  Tailwind (`gap-x-1.5`), que seria lo natural: el `check:copy`
                  del §4.1 marca los decimales con punto y su extractor no
                  distingue un `1.5` de una clase de uno de copy.
                */}
                <dt className="flex flex-wrap items-baseline gap-x-[6px] sm:gap-x-2">
                  <span className="whitespace-nowrap text-[28px] font-medium leading-[32px] tracking-[-0.03em] tabular text-foreground sm:text-display">
                    {figure}
                  </span>
                  <span className="text-label text-text-secondary sm:text-title">{unit}</span>
                </dt>
                <dd className="mt-2 max-w-[34ch] text-caption text-text-secondary sm:mt-3 sm:text-caption-lg lg:text-caption">
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
