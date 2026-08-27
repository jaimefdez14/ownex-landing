import { Fragment, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { BrandPanelMockup, OwnerHubMockup, WorkspaceMockup } from "./ProductMockups";
import { BrandPanelGlyph, OwnerHubGlyph, StructuringGlyph } from "./PhaseGlyphs";
import { cn } from "../lib/cn";
import { useTablistKeys } from "../lib/useTablistKeys";
import { track } from "../lib/analytics";

/**
 * REHECHA EL 27/08/2026. DE LINEA DE TIEMPO A ARQUITECTURA.
 *
 * Jaime dijo que la seccion no le convencia y que se le mezclaban "producto con
 * fases con caracteristicas". Tenia razon, y el problema era de contenido, no de
 * maqueta. La version anterior presentaba tres cosas numeradas 01/02/03, como si
 * fueran pasos de una secuencia, pero eran de tres clases distintas:
 *
 *   01 Estructuracion      un SERVICIO: pasa una vez, antes de que exista nadie
 *   02 Panel de la Marca   un OBJETO: una pantalla permanente del equipo
 *   03 Hub del Propietario un OBJETO: una pantalla permanente del accionista
 *
 * Numerarlas afirmaba una secuencia temporal que solo valia para la primera. Y
 * dentro de cada una, las cuatro vinetas eran CARACTERISTICAS. Servicio, producto
 * y caracteristicas en una sola lista, sin un criterio que las ordenara.
 *
 * Encima se duplicaba con la seccion anterior. "Que es Ownex" tenia una tarjeta
 * "Estructuracion" con la misma promesa y las mismas dos pruebas (cap table
 * limpio, proxima ronda no se complica), y otra "Activacion" que describia
 * literalmente el Hub del Propietario. Dos secciones contando lo mismo a dos
 * niveles de detalle, y la navegacion con dos entradas ("Solucion" y "Como
 * funciona") para el mismo contenido.
 *
 * EL CRITERIO NUEVO, decidido con Jaime: las dos secciones se separan por EJE.
 *
 *   Seccion anterior ("Que es Ownex")  el SERVICIO, ordenado en el tiempo:
 *                                      Estructuracion, Emision, Activacion.
 *                                      Ahi numerar si es legitimo: hay secuencia.
 *   Esta seccion ("Como funciona")     el PRODUCTO, ordenado por AUDIENCIA.
 *                                      Sin numeros: no hay primero ni despues.
 *
 * Y las superficies no me las he inventado: son las tres que define
 * `docs/CLAUDE.md` para la plataforma, una por audiencia.
 *
 *   B  Operations Workspace  Ownex, abogado, EAF/ESI, ERIR   ->  "La estructura"
 *   A  Emisor Dashboard      el equipo de la marca           ->  "Panel de la Marca"
 *   C  Owner Portal          el inversor                     ->  "Hub del Propietario"
 *
 * La superficie B no se ensenaba, y era la que sostiene el argumento regulatorio
 * entero. Jaime decidio ensenarla, asi que ahora son tres accesos y no dos
 * paneles, y el titular cambia con ellos.
 *
 * Nota sobre el Owner Portal: incluye el onboarding de suscripcion DURANTE la
 * captacion (`/portal/:brandSlug/onboarding`), asi que la pantalla publica donde
 * los clientes invierten y el hub donde viven despues son la misma superficie en
 * dos momentos. Por eso aqui son tres y no cuatro.
 *
 * SE RETIRA EL ESCENARIO ANCLADO. La version anterior convertia 1861px de scroll
 * vertical en movimiento horizontal, costaba 2,76 pantallas en escritorio y 3,95
 * en movil (el 20 % del scroll de toda la pagina) y necesitaba 157 lineas de
 * `useScrollStage` mas unas 200 de CSS para un efecto que solo existia desde
 * 1024px y sin movimiento reducido. Nada de eso sobrevive: tres superficies que
 * no tienen orden temporal no necesitan un carril que las recorra, necesitan que
 * elijas cual mirar.
 */

const surfaces = [
  {
    id: "estructura",
    glyph: StructuringGlyph,
    mockup: WorkspaceMockup,
    audience: "Ownex y entidades reguladas",
    name: "La estructura",
    desc: "Donde tu abogado, la ESI y el ERIR trabajan tu emisión: documentación, validaciones e inscripción en el registro. Es el trabajo que hace que la emisión sea legal, y no lo haces tú.",
    details: [
      "Una ESI autorizada valida la información al inversor antes de que se abra la captación",
      "El ERIR inscribe cada participación en el registro digital y emite los certificados",
      "No necesitas licencia propia: la responsabilidad regulatoria es de las entidades autorizadas",
    ],
  },
  {
    id: "marca",
    glyph: BrandPanelGlyph,
    mockup: BrandPanelMockup,
    audience: "Tu equipo",
    name: "Panel de la Marca",
    desc: "El centro de mando de tu equipo: quién ha invertido, cuánto y en qué tramo, y el motor con el que lanzas beneficios y comunicaciones a un segmento concreto.",
    details: [
      "El libro de accionistas siempre al día, nunca en una hoja de cálculo aparte",
      "Segmentas tu base por tramo, actividad o fecha de entrada",
      "Lanzas beneficios y comunicados dirigidos solo a ese segmento",
    ],
  },
  {
    id: "accionistas",
    glyph: OwnerHubGlyph,
    mockup: OwnerHubMockup,
    audience: "Tus accionistas",
    name: "Hub del Propietario",
    desc: "En tu web y con tu marca. Es donde suscriben durante la captación y donde viven después: su posición, sus beneficios, sus votaciones. Ownex no aparece por ningún lado.",
    details: [
      "Suscriben con KYC integrado, sin salir de tu dominio",
      "Ven su posición y su tramo actualizados en todo momento",
      "Activan beneficios y votan en las decisiones que les afectan",
    ],
  },
];

export function FrameworkSection() {
  const [active, setActive] = useState(0);

  const select = (index: number) => {
    setActive(index);
    track("surface_select", { surface: surfaces[index].name });
  };

  const { register, onKeyDown } = useTablistKeys(surfaces.length, active, select);

  return (
    <section
      id="framework"
      aria-labelledby="framework-title"
      className="section-padding bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px] md:mb-14">
          <Reveal as="p" className="rule-grow label-caps mb-5">
            Cómo funciona
          </Reveal>
          <h2
            id="framework-title"
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            <Reveal as="span" delay={60} className="block text-rise">
              Una plataforma, tres accesos.
            </Reveal>
            <Reveal as="span" delay={150} className="block text-rise text-text-tertiary">
              Cada uno ve solo el suyo.
            </Reveal>
          </h2>
          <Reveal as="p" delay={220} className="max-w-reading text-body-lg text-text-secondary">
            Nosotros y las entidades reguladas operamos la estructura. Tu equipo opera su panel y
            tus accionistas el suyo. Nadie ve el de otro.
          </Reveal>
        </div>

        <Reveal>
          {/*
            El mapa de accesos hace de selector Y de diagrama a la vez, y esa es la
            razon de que las flechas esten ahi: son tres superficies conectadas, no
            tres opciones sueltas de un menu. La flecha gira con el eje (abajo en
            movil, a la derecha desde `lg`), igual que en `CapTableDiagram`.

            El orden es de dentro hacia fuera: lo que operamos nosotros, lo que
            opera tu equipo, lo que ven tus clientes. No es un orden temporal, es
            la distancia a la marca.
          */}
          <div
            role="tablist"
            aria-label="Accesos a la plataforma"
            onKeyDown={onKeyDown}
            className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0"
          >
            {surfaces.map((surface, index) => {
              const on = index === active;
              const Glyph = surface.glyph;
              return (
                <Fragment key={surface.id}>
                  {index > 0 ? (
                    <span
                      aria-hidden="true"
                      className="flex shrink-0 items-center justify-center py-1 lg:px-3 lg:py-0"
                    >
                      <ArrowRight
                        size={15}
                        className="rotate-90 text-text-tertiary lg:rotate-0"
                      />
                    </span>
                  ) : null}

                  <button
                    ref={register(index)}
                    type="button"
                    role="tab"
                    id={`surface-${surface.id}-tab`}
                    aria-selected={on}
                    aria-controls={`surface-${surface.id}-panel`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(index)}
                    className={cn(
                      "flex min-h-touch flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                      on
                        ? "bg-accent-soft text-on-accent-soft"
                        : "border border-border bg-card-hover text-text-secondary hover:border-emerald-400/25 hover:text-foreground",
                    )}
                  >
                    {/*
                      Activo: la insignia se vuelve BLANCA sobre el mint de la
                      ficha. Con `bg-accent-soft` en los dos estados, la insignia
                      del activo desapareceria dentro de su propia ficha, que es
                      del mismo color.
                    */}
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                        on ? "bg-card" : "bg-accent-soft",
                      )}
                    >
                      <Glyph size={18} className={on ? "text-on-accent-soft" : "text-emerald-400"} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-micro uppercase opacity-70">
                        {surface.audience}
                      </span>
                      <span className="block truncate text-caption font-medium">{surface.name}</span>
                    </span>
                  </button>
                </Fragment>
              );
            })}
          </div>

          <div className="swap-stack mt-3 lg:mt-4">
            {surfaces.map((surface, index) => {
              const Mockup = surface.mockup;
              return (
                <div
                  key={surface.id}
                  role="tabpanel"
                  id={`surface-${surface.id}-panel`}
                  aria-labelledby={`surface-${surface.id}-tab`}
                  data-active={index === active ? "true" : "false"}
                  className="swap-panel glass-card p-6 md:p-8"
                >
                  <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-12">
                    <div>
                      <h3 className="mb-3 text-headline leading-tight text-foreground lg:text-display">
                        {surface.name}
                      </h3>
                      <p className="mb-6 max-w-reading text-body text-text-secondary lg:text-body-lg">
                        {surface.desc}
                      </p>
                      <ul className="space-y-3 border-t border-border pt-5">
                        {surface.details.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 text-caption-lg leading-relaxed text-text-secondary md:text-body"
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

                    <div className="defer-paint">
                      <Mockup />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
