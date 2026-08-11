import { useRef } from "react";
import { Cpu, LayoutDashboard, Scale, Zap } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { CapTableDiagram } from "./CapTableDiagram";
import { ActivationMockup, BrandPanelMockup, OwnerHubMockup } from "./ProductMockups";
import { useScrollStage } from "../lib/useScrollStage";

const steps = [
  {
    number: "01",
    icon: Scale,
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
    icon: Cpu,
    title: "Hub del Propietario",
    desc: "Un panel en marca blanca integrado en tu web. Tus accionistas ven su posición, reciben actualizaciones, activan beneficios y votan. Todo bajo tu marca, no la nuestra.",
    details: [
      "Sabes quién invirtió, cuánto, y en qué estado está cada accionista",
      "Tus accionistas ven su posición y el progreso de la marca en un solo lugar",
      "El KYC/AML se resuelve dentro del flujo, sin fricciones externas",
      "Segmentas y lanzas campañas dirigidas a tu base de accionistas",
    ],
  },
  {
    number: "03",
    icon: Zap,
    title: "Motor de activación",
    desc: "La propiedad no es pasiva. Los accionistas compran más, refieren más y permanecen más porque tienen piel financiera en el juego. Te damos las herramientas para activar ese comportamiento.",
    details: [
      "Tus clientes se quedan porque son dueños, no porque les des descuentos",
      "Los accionistas refieren porque el crecimiento de la marca les beneficia",
      "Si la marca crece, el accionista gana. Los intereses están alineados",
      "Levantas capital y construyes lealtad con la misma operación",
      "Tus accionistas ya conocen el producto: aportan demanda además de capital y reducen tu coste de adquisición, no solo mejoran la retención",
    ],
  },
  {
    number: "04",
    icon: LayoutDashboard,
    title: "Panel de la Marca",
    desc: "El sistema de gestión de tu base de accionistas: libro de accionistas actualizado, segmentación por tramos, motor de beneficios y comunicación nativa. Sabes en todo momento quién ha invertido, cuánto, y cómo se comporta como cliente.",
    details: [
      "Ves en un único lugar quién ha invertido, cuánto, en qué tramo está y si su KYC está verificado",
      "Segmentas tu base por tramo, actividad o fecha de entrada, sin hojas de cálculo aparte",
      "Lanzas beneficios y comunicaciones dirigidas a un segmento sin salir del panel",
      "El libro de accionistas queda siempre actualizado, sin que nadie tenga que mantenerlo a mano",
    ],
  },
];

/**
 * "Cómo funciona" es la única sección de la página que se ancla en pantalla: en
 * escritorio ancho, con JavaScript y sin movimiento reducido, las cuatro fases
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
      className="border-t border-border bg-background"
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
              Cuatro fases.
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
            {steps.map(({ number, icon: Icon, title, desc, details }, index) => (
              <Reveal
                as="li"
                key={number}
                delay={index * 100}
                className="framework-panel border-t border-border py-16"
              >
                <div className="framework-panel-inner lg:grid lg:grid-cols-[3fr_2fr] lg:items-center lg:gap-12">
                  <div>
                    <div className="mb-4 flex items-center gap-4 lg:mb-8">
                      <span className="text-headline tabular text-gradient-emerald">{number}</span>
                      <div className="h-px flex-1 bg-border" />
                      <span className="icon-badge flex h-12 w-12 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
                        <Icon aria-hidden="true" size={20} className="text-emerald-400" />
                      </span>
                    </div>

                    <h3 className="mb-3 text-headline leading-tight text-foreground lg:mb-4 lg:text-display">{title}</h3>
                    <p className="mb-4 text-body text-text-secondary lg:mb-8 lg:text-body-lg">{desc}</p>

                    <ul className="stagger-children space-y-2 lg:space-y-4">
                      {details.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-body leading-[1.4] text-text-secondary lg:leading-[1.55]">
                          <span aria-hidden="true" className="mt-[10px] h-[6px] w-[6px] shrink-0 rounded-full bg-emerald-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/*
                    Una ilustración por fase: el diagrama del cap table en la
                    estructuración, y los tres mockups de producto (portados de la
                    v1) en las fases que describen, cada uno donde su rótulo de
                    navegador coincide con el título de la fase. En la columna
                    derecha solo a partir de lg; por debajo se apilan bajo el texto,
                    como antes.
                  */}
                  <div className="defer-paint">
                    {number === "01" ? <CapTableDiagram /> : null}
                    {number === "02" ? <OwnerHubMockup /> : null}
                    {number === "03" ? <ActivationMockup /> : null}
                    {number === "04" ? <BrandPanelMockup /> : null}
                    {/*
                      Las cuatro ilustraciones llevan cifras concretas (412 accionistas,
                      62 %, 86 del tramo 3, 247 accionistas en el libro de la marca). Se
                      dice que son de ejemplo para que nadie las lea como resultados de
                      un cliente real.
                    */}
                    <p className="mt-2 text-micro text-text-tertiary lg:mt-3">
                      Representación del producto con datos de ejemplo.
                    </p>
                  </div>
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
