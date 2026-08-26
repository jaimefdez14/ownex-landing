import { useRef } from "react";
import { Reveal } from "./ui/Reveal";
import { CapTableDiagram } from "./CapTableDiagram";
import { BrandPanelMockup, OwnerHubMockup } from "./ProductMockups";
import { BrandPanelGlyph, OwnerHubGlyph, StructuringGlyph } from "./PhaseGlyphs";
import { useScrollStage } from "../lib/useScrollStage";

/**
 * REVISIÓN DEL 11-ago-2026: de cuatro fases a tres.
 *
 * La fase 02 (Hub del Propietario) tenía dos viñetas escritas desde el punto de
 * vista equivocado ("Sabes quién invirtió, cuánto..." y "Segmentas y lanzas
 * campañas...", ambas en segunda persona dirigidas a LA MARCA) dentro de una fase
 * que el propio título y el resto de sus viñetas describen como lo que ve EL
 * ACCIONISTA. Y esas dos viñetas no eran una errata aislada: eran una copia casi
 * literal de dos viñetas de la fase 04 (Panel de la Marca). Las fases 03 (Motor de
 * activación) y 04 también se pisaban entre sí: la 03 hablaba de segmentar y
 * lanzar una acción dirigida a un tramo, y la 04 volvía a hablar de segmentar y de
 * lanzar beneficios y comunicaciones dirigidas a un segmento. Dos fases distintas
 * describiendo la misma herramienta.
 *
 * La causa era de audiencia, no de redacción: 03 y 04 son las dos caras del mismo
 * panel (el que usa el EQUIPO DE LA MARCA), así que cualquier intento de separarlas
 * en dos fases iba a acabar repitiendo el mismo contenido con otras palabras. Se
 * fusionan en una sola fase, "Panel de la Marca", y de paso el criterio de las tres
 * fases queda más limpio y más fácil de defender: cada una es una audiencia
 * distinta y un momento distinto.
 *
 * ORDEN REVISADO EL 11-ago-2026: Jaime intercambia el orden de las dos últimas
 * fases. Antes iba primero el Hub del Propietario y después el Panel de la Marca;
 * ahora va al revés, porque es el orden operativo real: el equipo de la marca
 * prepara su panel (registro, segmentación, beneficios) y ES ESE TRABAJO el que
 * llena el hub del accionista de contenido (beneficios activos, novedades,
 * votaciones). Contar primero la causa y después el efecto se lee mejor que al
 * revés.
 *
 *   01 Estructuración      → antes de que exista ningún accionista (legal/Ownex)
 *   02 Panel de la Marca   → lo que usa el equipo de la marca, y solo eso
 *   03 Hub del Propietario → lo que ve el accionista, y solo eso
 *
 * Los números de fase ("01"/"02"/"03") identifican la POSICIÓN en el recorrido, no
 * el contenido: por eso cada paso lleva ya su propia ilustración (`illustration`)
 * en vez de que el JSX decida cuál pintar mirando el número, que es justo el tipo
 * de acoplamiento que se rompe al reordenar. `BrandPanelMockup` (en
 * `ProductMockups.tsx`) se rehizo para representar las dos mitades fusionadas: el
 * registro (quién ha invertido, cuánto, KYC) y la activación (un beneficio
 * dirigido a un segmento). `ActivationMockup` y su glifo quedan retirados: nada
 * más los usaba.
 */
const steps = [
  {
    number: "01",
    icon: StructuringGlyph,
    illustration: CapTableDiagram,
    title: "Estructuración de la emisión",
    desc: "Estructuramos la ronda de equity a través de un SPV: una sola línea limpia en tu cap table. Coordinado con entidades de inversión reguladas (ESI/ERIR), cumpliendo con la normativa española de valores desde el primer día.",
    details: [
      "Tu cap table se mantiene limpio: un SPV agrega a todos los accionistas en una sola línea",
      "No necesitas licencia financiera: nos coordinamos con entidades reguladas (ESI/ERIR)",
      "Documentación legal lista desde el día uno: folleto o exención, pacto de socios",
      "Tu próxima ronda de VC o proceso de exit no se complica",
    ],
  },
  {
    number: "02",
    icon: BrandPanelGlyph,
    illustration: BrandPanelMockup,
    title: "Panel de la Marca",
    desc: "El centro de mando de tu equipo: libro de accionistas, segmentación por tramos, y el motor de beneficios y comunicación con el que activas a tu comunidad. Todo en el mismo panel, nunca en una hoja de cálculo aparte.",
    details: [
      "Ves en un único lugar quién ha invertido, cuánto, en qué tramo está y si su KYC está verificado",
      "Segmentas tu base por tramo, actividad o fecha de entrada",
      "Lanzas beneficios, comunicaciones y enlaces de referido dirigidos a un segmento",
      "El libro de accionistas queda siempre actualizado, sin que nadie tenga que mantenerlo a mano",
    ],
  },
  {
    number: "03",
    icon: OwnerHubGlyph,
    illustration: OwnerHubMockup,
    title: "Hub del Propietario",
    desc: "Un panel en marca blanca integrado en tu web. Es lo único que ve tu comunidad de accionistas: su posición, sus beneficios, sus votaciones. Todo bajo tu marca, no la nuestra.",
    details: [
      "Ve su posición, su tramo y sus participaciones actualizadas en todo momento",
      "Recibe las novedades y comunicados de la marca sin salir del hub",
      "Activa los beneficios exclusivos de su tramo con un clic",
      "Vota en las decisiones que le afectan como accionista",
    ],
  },
];

/**
 * "Cómo funciona" es la única sección de la página que se ancla en pantalla: en
 * escritorio ancho, con JavaScript y sin movimiento reducido, las tres fases
 * ocupan la pantalla entera una detrás de otra y el scroll vertical las recorre en
 * horizontal (ver `useScrollStage` e `index.css`, bloque "Escenario de scroll
 * horizontal"). En cualquier otra condición es la cuadrícula de siempre, de arriba
 * a abajo: el anclado es un realce, nunca la única forma de leer la sección.
 */
export function FrameworkSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const phaseLabelRef = useRef<HTMLSpanElement>(null);

  useScrollStage(
    stageRef,
    trackRef,
    dotsRef,
    phaseLabelRef,
    steps.map((step) => step.number),
  );

  return (
    <section
      id="framework"
      aria-labelledby="framework-title"
      className="bg-background theme-light-alt"
    >
      {/*
        Sin padding-bottom (a diferencia del `section-padding` normal, que trae
        py-24/md:py-32 completo): con el `border-top` del primer panel ya
        quitado en modo anclado (ver `.js-stage-active .framework-panel` en
        index.css), cuanto menos hueco quede entre el párrafo y el escenario
        anclado, más se lee como una sola sección continua en vez de dos.
      */}
      <div className="shell pt-16 md:pt-24 lg:pt-32">
        <div className="mb-3 max-w-[800px]">
          <Reveal as="p" className="label-caps mb-5">
            Cómo funciona
          </Reveal>
          <h2
            id="framework-title"
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            <Reveal as="span" delay={60} className="block">
              Tres fases.
            </Reveal>
            <Reveal as="span" delay={150} className="block text-text-tertiary">
              Un sistema integrado.
            </Reveal>
          </h2>
          <Reveal as="p" delay={220} className="max-w-reading text-body-lg text-text-secondary">
            Desde la estructuración hasta la gestión continua de tu comunidad como accionistas.
            Nosotros gestionamos todo para que tú te centres en la marca.
          </Reveal>
        </div>
      </div>

      <div ref={stageRef} className="framework-stage pb-24 md:pb-32">
        <div className="framework-sticky">
          {/*
            Recordatorio de en qué fase se está, visible solo mientras el anclado
            está activo. Ya no repite "Cómo funciona": ese rótulo vive arriba, en
            el titular de la sección, y repetirlo aquí leía como una segunda
            sección en vez de una continuación de la misma.
          */}
          <div aria-hidden="true" className="framework-context shell">
            <p className="text-micro tabular text-text-tertiary">
              Fase <span ref={phaseLabelRef}>{steps[0].number}</span> de{" "}
              {String(steps.length).padStart(2, "0")}
            </p>
          </div>

          <ol ref={trackRef} className="framework-track shell">
            {steps.map(({ number, icon: Icon, illustration: Illustration, title, desc, details }, index) => (
              <Reveal
                as="li"
                key={number}
                delay={index * 100}
                className="framework-panel border-t border-border py-16"
              >
                {/*
                  Tres bloques, no dos, y en este orden: cabecera, ILUSTRACION,
                  vinetas. En movil se leen tal cual, asi que el mockup del
                  producto aparece justo despues de la frase que lo presenta y
                  antes de la lista de detalle: se ve la pantalla y luego se
                  leen sus porques, que es el orden en el que alguien mira una
                  landing en el movil. Desde `lg` la retícula devuelve cabecera
                  y vinetas a la columna izquierda (filas 1 y 2) y manda la
                  ilustracion a la derecha ocupando las dos filas, que es el
                  reparto de siempre en escritorio.
                */}
                <div className="framework-panel-inner lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12">
                  <div className="lg:col-start-1 lg:row-start-1">
                    <div className="mb-4 flex items-center gap-4 lg:mb-8">
                      <span className="text-headline tabular text-gradient-emerald">{number}</span>
                      <div className="h-px flex-1 bg-border" />
                      <span className="icon-badge flex h-12 w-12 items-center justify-center rounded-md bg-accent-soft">
                        {/*
                          22 y no los 20 de antes: los glifos propios tienen menos
                          tinta por dentro que los de `lucide-react` a los que
                          sustituyen (una forma exterior y dos o tres detalles, no
                          un dibujo lleno), y a 20 se quedaban flotando dentro de
                          la insignia de 48. El `aria-hidden` lo pone el propio
                          glifo (ver PhaseGlyphs.tsx).
                        */}
                        <Icon size={22} className="text-emerald-400" />
                      </span>
                    </div>

                    <h3 className="mb-3 text-headline leading-tight text-foreground lg:mb-4 lg:text-display">{title}</h3>
                    {/*
                      Sin `mb` propio: la separacion con lo que venga debajo la
                      pone el margen superior del bloque siguiente (la
                      ilustracion en movil, la lista de vinetas en escritorio).
                      Con las dos, en la retícula de `lg` los margenes no
                      colapsan entre celdas y sumaban 64px de hueco.
                    */}
                    <p className="text-body text-text-secondary lg:text-body-lg">{desc}</p>
                  </div>

                  {/*
                    Una ilustración por fase, la que trae cada paso en `steps`: el
                    diagrama del cap table en la estructuración, y los mockups de
                    producto en las fases que describen, cada uno donde su rótulo de
                    navegador coincide con el título de la fase. En la columna
                    derecha solo a partir de lg; por debajo se apilan bajo el texto,
                    como antes.
                  */}
                  <div className="defer-paint lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
                    <Illustration />
                    {/*
                      Las tres ilustraciones llevan cifras concretas (412
                      accionistas, 185.250 euros, 86 del tramo 3). Se dice que son
                      de ejemplo para que nadie las lea como resultados de un
                      cliente real.
                    */}
                    <p className="mt-2 text-micro text-text-tertiary lg:mt-3">
                      Representación del producto con datos de ejemplo.
                    </p>
                  </div>

                  <ul className="stagger-children mt-6 space-y-2 lg:col-start-1 lg:row-start-2 lg:mt-8 lg:space-y-4">
                    {details.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-body leading-[1.4] text-text-secondary lg:leading-[1.55]">
                        <span aria-hidden="true" className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-emerald-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>

          <div ref={dotsRef} aria-hidden="true" className="framework-dots">
            {steps.map((step, index) => (
              <span key={step.number} data-active={index === 0 ? "true" : "false"} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
