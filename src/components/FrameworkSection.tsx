import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { BrandPanelMockup, OwnerHubMockup, WorkspaceMockup } from "./ProductMockups";
import { BrandPanelGlyph, OwnerHubGlyph, StructuringGlyph } from "./PhaseGlyphs";
import { cn } from "../lib/cn";
import { useTablistKeys } from "../lib/useTablistKeys";
import { track } from "../lib/analytics";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * "Cómo funciona". Tres superficies del producto, ordenadas por QUÉ ES cada
 * una (no por audiencia ni por fase): un dashboard de control que operan Ownex
 * y las entidades reguladas, un panel de inversores que opera el emisor, y un
 * portal bajo la marca del emisor que opera el inversor. Ninguna tiene orden
 * temporal respecto a las otras dos, así que no van numeradas.
 *
 * Los nombres los fijó Jaime el 27/08/2026 tras varias pasadas.
 *
 * EL REGISTRO YA NO ES UNIFORME - 30/08/2026. Hasta esta fecha la sección era
 * la única del sitio que no tuteaba, y estaba anotado aquí como elección
 * deliberada frente al tuteo que manda `brand/BRAND.md` §3.1 para el resto de
 * la landing. La pasada de copy de Jaime del 30/08 mete tuteo en tres sitios
 * -- la entradilla ("el portal bajo tu marca al que acceden tus clientes"), el
 * titular de la primera superficie ("el estado de tu ronda") y la descripción
 * de la tercera ("Bajo tu propia marca") -- mientras el resto sigue impersonal.
 *
 * Queda MIXTO a propósito de nadie: es consecuencia de editar frase a frase, no
 * una decisión tomada. Las dos salidas son coherentes (volver al impersonal, o
 * pasar la sección entera a tuteo como el resto del sitio); lo que no lo es, es
 * dejarlo a medias. Pendiente de que Jaime elija.
 *
 * HISTORIAL DE MAQUETA (cuatro versiones en 24 horas, 27→28/08/2026):
 *
 *   escenario anclado    tres fases en un carril horizontal ligado al scroll.
 *                        1861px de scroll vertical convertido en movimiento
 *                        horizontal, 2,76 pantallas en escritorio y sin
 *                        movimiento reducido. Se retiró por coste.
 *   pestañas             interactivo, pero enseñaba UNA pantalla de tres:
 *                        esconder dos tercios del producto detrás de un clic
 *                        que la mayoría no da era el defecto de raíz.
 *   tres capturas ancladas   cada una en su propio `sticky`. Se solapaban
 *                        14px entre sí (alturas distintas, filas sin hueco) y
 *                        costaban 2599px por los `min-h` que pedía el pegado.
 *   una tarjeta + escaparate anclado   arregló que el titular dijera "una
 *                        plataforma" y la maqueta "tres productos", pero
 *                        Jaime lo vio "poco inmersivo": cambiaba con el
 *                        scroll, no con una decisión.
 *
 * ESTA VERSIÓN: RIEL DE ICONOS, 28/08/2026. Elegida por Jaime entre cuatro
 * alternativas (autoplay con barra de progreso, pestañas con indicador
 * deslizante, este riel, y un stack de tarjetas superpuestas), presentadas
 * como mockups de texto antes de construir nada.
 *
 * Es la primera que resuelve las dos cosas a la vez SIN ligarse al scroll:
 * solo una pieza a la vista (nada que esconder: lo que se ve es lo que hay) y
 * el cambio lo decide un CLIC, no la posición de la ventana. El riel son tres
 * iconos sin texto: el nombre y la descripción viven ya en el panel activo,
 * repetirlos en el riel sería la misma duplicación que se corrigió al
 * fusionar pestañas y panel el 27/08.
 *
 * `role="tablist"` / `role="tabpanel"` (patrón WAI-ARIA APG), con
 * `useTablistKeys`: el mismo hook que gobierna ya las fichas de sector de
 * "En la práctica", para no mantener la navegación por teclado dos veces.
 *
 * LOS TRES PANELES ESTÁN SIEMPRE MONTADOS, incluidos sus mockups (mismo
 * criterio que ya usan las fichas de sector): comparten una única celda de
 * retícula (`.showcase-stack`, en `index.css`) y el que no está activo se
 * oculta con `visibility` + opacidad + una escala mínima, nunca con
 * `display: none`. La razón no es solo de transición: es de RED DE
 * SEGURIDAD: si se montara y desmontara el mockup en cada clic, el que sale
 * desaparecería de golpe (sin animación posible desde `display: none`)
 * mientras su texto todavía se está desvaneciendo, y el gesto se vería roto
 * a la mitad. Con los tres siempre presentes, la transición es SOLO opacidad
 * y transformación: nunca la responsable de que algo aparezca o desaparezca
 * de la nada.
 */
/*
  PASADA DE PRECISION REGULATORIA - 01/09/2026. Cuatro frases de esta seccion
  decian cosas que el modelo canonico del proceso (`src/lib/process.ts` de la
  plataforma, verificado contra el BOE) no sostiene:

   - "qué ha inscrito el ERIR" en una emision en captacion. Los valores se
     constituyen con la PRIMERA INSCRIPCION (art. 10 Ley 6/2023), que ocurre en
     el cierre, no durante la ventana. Ahora la frase describe el orden real:
     acuerdo certificado, documento elevado, oferta validada, registro abierto.
   - "El ERIR inscribe cada participación" sin decir cuando. Se acota al cierre.
   - "La responsabilidad regulatoria recae en las entidades autorizadas". Falso
     y caro: el emisor responde del contenido de la informacion y de la emision;
     la entidad autorizada VALIDA la informacion al inversor y supervisa la
     comercializacion (art. 36.1 Ley 6/2023) y el ERIR responde del registro
     (art. 8.4). Lo que si es cierto -- y sigue siendo el argumento -- es que
     cada obligacion tiene detras una entidad autorizada.
   - "voto en las decisiones que le afectan". El accionista vota en la JUNTA del
     SPV (cuentas, dividendos, acuerdos), no en las decisiones de producto de la
     marca; lo que si hay sobre producto son consultas a la comunidad, que es lo
     que enseña el mockup del portal y no se vende como voto.

  Ademas, "fecha de entrada" salio de la lista de segmentaciones: la Comunidad
  segmenta hoy por tier y por actividad; la fecha es una columna y un campo de
  exportacion, no un filtro.
*/
/*
  La parte que no es copy: el identificador (va en el `id` del panel y en el evento de
  analitica, asi que NO cambia con el idioma o el embudo contaria cada acceso dos
  veces), el glifo del riel y el mockup.
*/
/*
  NUEVO ORDEN Y SCROLL FIJO - 14/11/2026 (revision de la landing aprobada por Jaime).

  Esta seccion es el PRODUCTO. El servicio, fase a fase, vive en `SolutionSection`
  ("Que es Ownex"). Durante unas horas las dos estuvieron fundidas aqui y Jaime lo
  deshizo: la pagina se quedaba sin decir que es Ownex.

  El orden de las superficies se invierte. Antes abria el expediente legal, que es la
  pantalla menos atractiva de las tres. Ahora abre el portal del inversor, que es lo
  que ve la comunidad del emisor, y el expediente cierra.

  En escritorio ya no hay pestanas. Los tres textos van uno debajo de otro y la
  pantalla del producto se queda fija a la derecha y cambia segun el texto que cruza
  el centro de la ventana. Con pestanas se veia una pantalla de tres. En telefono
  siguen las pestanas, ahora rotuladas, porque tres pantallas apiladas eran 1.500px.
*/
const SURFACES = [
  { id: "accionistas", glyph: OwnerHubGlyph, mockup: OwnerHubMockup },
  { id: "marca", glyph: BrandPanelGlyph, mockup: BrandPanelMockup },
  { id: "estructura", glyph: StructuringGlyph, mockup: WorkspaceMockup },
];

type SurfaceCopy = {
  name: string;
  short: string;
  operatorShort: string;
  headline: string;
  desc: string;
  details: string[];
};

const surfacesCopy: Localized<SurfaceCopy[]> = {
  es: [
    {
      name: "Portal del inversor",
      short: "Portal",
      operatorShort: "Para tus inversores",
      headline: "Un portal con tu marca para cada inversor.",
      desc: "Aquí se suscribe durante la captación. Después, cada inversor consulta su posición, activa beneficios y, si es accionista, vota en la junta.",
      details: [
        "Suscripción con verificación de identidad, firma y pago en el mismo recorrido",
        "Posición y nivel actualizados en todo momento",
        "Beneficios que se activan desde el móvil",
      ],
    },
    {
      name: "Panel de inversores",
      short: "Inversores",
      operatorShort: "Para tu equipo",
      headline: "Tu base de inversores, operable desde un único lugar.",
      desc: "Quién ha invertido, cuánto y en qué nivel, junto al motor con el que se lanzan beneficios y comunicaciones.",
      details: [
        "Registro de inversores al día, sin hojas de cálculo paralelas",
        "Segmentación por nivel y por actividad",
        "Beneficios y comunicaciones dirigidos a un segmento concreto",
      ],
    },
    {
      name: "Dashboard de control de emisión",
      short: "Emisión",
      operatorShort: "Para ti y para Ownex",
      headline: "El estado de tu emisión, documento a documento.",
      desc: "El expediente completo, con el estado de cada documento y la entidad que responde de él.",
      details: [
        "La entidad autorizada valida la información al inversor antes de abrir",
        "La ERIR inscribe a cada titular y expide los certificados de legitimación",
        "Cada obligación regulatoria queda asignada a una entidad autorizada",
      ],
    },
  ],
  en: [
    {
      name: "Investor portal",
      short: "Portal",
      operatorShort: "For your investors",
      headline: "A portal under your brand for every investor.",
      desc: "This is where people subscribe while the offering is open. Afterwards, each investor checks their position, activates benefits and, if they are a shareholder, votes at the general meeting.",
      details: [
        "Subscription with identity verification, signature and payment in one flow",
        "Position and tier updated at all times",
        "Benefits activated from a phone",
      ],
    },
    {
      name: "Investor panel",
      short: "Investors",
      operatorShort: "For your team",
      headline: "Your investor base, managed from a single place.",
      desc: "Who has invested, how much and in which tier, alongside the engine that launches benefits and communications.",
      details: [
        "Investor register up to date, with no spreadsheets running alongside",
        "Segmentation by tier and by activity",
        "Benefits and communications aimed at a specific segment",
      ],
    },
    {
      name: "Issuance control dashboard",
      short: "Issuance",
      operatorShort: "For you and for Ownex",
      headline: "Where your issuance stands, document by document.",
      desc: "The complete file, with the status of every document and the entity responsible for it.",
      details: [
        "The authorised investment firm validates the investor information before the offering opens",
        "The registry entity records each holder and issues the legitimation certificates",
        "Every regulatory obligation is assigned to an authorised entity",
      ],
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "Cómo funciona",
    titleA: "Una única plataforma",
    titleB: "para la gestión completa de la emisión y sus inversores.",
    body: "El portal con tu marca al que entran tus inversores, el panel con el que tu equipo gestiona la relación y el expediente desde el que se sigue la emisión.",
    tablist: "Pantallas de la plataforma",
    cta: "Solicitar una demo",
  },
  en: {
    eyebrow: "How it works",
    titleA: "A single platform",
    titleB: "for managing the whole issuance and its investors.",
    body: "The portal under your brand that your investors log in to, the panel your team uses to manage the relationship and the file from which the issuance is tracked.",
    tablist: "Platform screens",
    cta: "Request a demo",
  },
};

const DESKTOP = "(min-width: 1024px)";

export function FrameworkSection() {
  const t = useCopy(COPY);
  const copy = useCopy(surfacesCopy);
  const surfaces = SURFACES.map((surface, index) => ({ ...surface, ...copy[index] }));
  const [active, setActive] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    track("surface_select", { surface: SURFACES[index].id });
  };

  const { register, onKeyDown } = useTablistKeys(surfaces.length, active, select);

  /*
    En escritorio manda el scroll: el texto que cruza la franja central de la ventana
    es el activo. Sin `IntersectionObserver` no pasa nada malo, se queda la primera
    pantalla. No hay bucle ni escucha de scroll, el observador solo avisa al cruzar.
  */
  useEffect(() => {
    const media = window.matchMedia(DESKTOP);
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!desktop || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = panels.current.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActive(index);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    panels.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [desktop]);

  return (
    <section
      id="framework"
      aria-labelledby="framework-title"
      className="section-padding spotlight bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="mb-6 max-w-[800px] sm:mb-10 lg:mb-4">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="framework-title"
            delay={60}
            className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[56px]"
          >
            {t.titleA}{" "}
            <span className="text-text-tertiary">{t.titleB}</span>
          </Reveal>
          <Reveal as="p" delay={160} className="max-w-reading text-body text-text-secondary sm:text-body-lg">
            {t.body}
          </Reveal>
        </div>

        <Reveal className="surfaces lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <div className="glass-card overflow-hidden lg:contents">
            <div
              role="tablist"
              aria-label={t.tablist}
              onKeyDown={onKeyDown}
              className="grid grid-cols-3 gap-2 border-b border-border p-3 lg:hidden"
            >
              {surfaces.map((surface, index) => {
                const on = index === active;
                const Glyph = surface.glyph;
                return (
                  <button
                    key={surface.id}
                    ref={register(index)}
                    type="button"
                    role="tab"
                    id={`superficie-${surface.id}-tab`}
                    aria-selected={on}
                    aria-controls={`superficie-${surface.id}-panel`}
                    aria-label={surface.name}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(index)}
                    className={cn(
                      "flex min-h-touch flex-col items-center justify-center gap-1 rounded-md px-1 py-2 transition-colors duration-200",
                      on
                        ? "bg-accent-soft text-on-accent-soft"
                        : "text-text-tertiary hover:bg-card-hover hover:text-foreground",
                    )}
                  >
                    <Glyph size={18} className="shrink-0" />
                    <span aria-hidden="true" className="text-caption font-medium leading-none">
                      {surface.short}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="surface-list p-5 sm:p-6 lg:p-0">
              {surfaces.map((surface, index) => {
                const on = index === active;
                const Mockup = surface.mockup;
                const Glyph = surface.glyph;
                return (
                  <div
                    key={surface.id}
                    ref={(node) => {
                      panels.current[index] = node;
                    }}
                    role={desktop ? "group" : "tabpanel"}
                    id={`superficie-${surface.id}-panel`}
                    aria-labelledby={desktop ? `superficie-${surface.id}-title` : `superficie-${surface.id}-tab`}
                    data-active={on ? "true" : "false"}
                    className="surface-panel"
                  >
                    <p className="mb-3 flex items-center gap-2 text-caption font-medium text-accent-ink">
                      <Glyph size={16} className="hidden shrink-0 lg:block" />
                      {surface.operatorShort}
                    </p>
                    <h3
                      id={`superficie-${surface.id}-title`}
                      className="mb-5 text-[22px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-headline lg:mb-4"
                    >
                      {surface.headline}
                    </h3>
                    <div className="mb-5 min-w-0 lg:hidden">
                      <Mockup />
                    </div>
                    <p className="mb-4 max-w-reading text-body text-text-secondary">{surface.desc}</p>
                    <ul className="space-y-2 border-t border-border pt-4">
                      {surface.details.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-caption-lg leading-relaxed text-text-secondary"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* La pantalla fija de escritorio. Decorativa: cada maqueta va en un marco `aria-hidden`. */}
          <div className="hidden lg:block">
            <div className="showcase-stack sticky top-[calc(50vh-230px)] py-6">
              {surfaces.map((surface, index) => {
                const Mockup = surface.mockup;
                return (
                  <div
                    key={surface.id}
                    data-active={index === active ? "true" : "false"}
                    className="showcase-panel self-center"
                  >
                    <Mockup />
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-6 flex justify-start border-t border-border pt-6 lg:mt-10">
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "framework", label: "Solicitar una demo" })}
            >
              {t.cta}
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
