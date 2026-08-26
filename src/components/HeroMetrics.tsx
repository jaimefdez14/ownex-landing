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
  {
    figure: "5",
    unit: "%",
    detail: "Del capital captado, cobrado solo al cerrar la ronda.",
  },
  {
    figure: "0",
    unit: "€",
    detail: "Para evaluar el encaje de tu marca con nosotros.",
  },
];

export function HeroMetrics() {
  return (
    <section aria-label="Ownex en cuatro cifras" className="spotlight bg-background theme-dark">
      <div className="shell py-12 md:py-16">
        <Reveal>
          <dl className="grid grid-cols-2 gap-y-8 lg:grid-cols-4">
            {metrics.map(({ figure, unit, detail }, index) => (
              <div
                key={detail}
                className={
                  /*
                    El filete separa columnas, nunca abre una fila: se quita en
                    el primer elemento de cada fila (par en movil, cuarto en
                    escritorio) para que no cuelgue un borde suelto al borde
                    izquierdo de la reticula.
                  */
                  index % 2 === 0
                    ? "px-0 lg:border-l lg:border-border lg:px-8 lg:first:border-l-0 lg:first:pl-0"
                    : "border-l border-border px-6 lg:px-8 lg:first:border-l-0"
                }
              >
                <dt className="flex items-baseline gap-2">
                  <span className="text-display tabular text-foreground">{figure}</span>
                  <span className="text-title text-text-secondary">{unit}</span>
                </dt>
                <dd className="mt-3 max-w-[30ch] text-caption-lg text-text-secondary lg:text-caption">
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
