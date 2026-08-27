import { Fragment, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
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

/*
 * REVISION COMERCIAL DEL 27/08/2026, Y CORRECCION DEL EJE EL MISMO DIA.
 *
 * PRIMERO se hizo comercial: la audiencia paso a ser la etiqueta principal de
 * cada ficha, cada panel abrio con el resultado en vez de con la descripcion, y
 * la seccion gano una salida.
 *
 * Y DESPUES Jaime tumbo el eje, con razon: "al final la parte de nosotros y los
 * reguladores tambien lo ve mi cliente". Es cierto. La marca ve el expediente de
 * su propia emision; lo que no hace es trabajarlo. Ordenar las tres piezas por
 * QUIEN LAS VE era, sencillamente, falso, y el titular anterior lo decia en voz
 * alta: "cada uno ve solo el suyo".
 *
 * El eje correcto es QUE ES cada pieza. La audiencia no desaparece, baja a la
 * linea de descripcion y cambia de verbo: no dice quien la VE, dice quien la
 * OPERA. Esa distincion es justo la que faltaba.
 *
 *   Emision y cumplimiento    lo operamos nosotros y las entidades reguladas
 *   Panel de inversores       acceso del emisor
 *   Portal del accionista     acceso de los inversores
 *
 * LOS NOMBRES Y EL REGISTRO, fijados por Jaime el 27/08/2026 despues de cuatro
 * pasadas. Los nombres los dio el; el criterio que faltaba era suyo tambien: el
 * wording tiene que ser de PRODUCTO (lo que la cosa es, no etapas ni verbos), y el
 * lenguaje de la seccion sonaba "demasiado tuteo" para lo que vende.
 *
 *   Dashboard de control de emision   Acceso: Ownex y emisor
 *   Panel de inversores               Acceso: emisor
 *   Portal del accionista             Acceso: inversores
 *
 * Los descartes anteriores, por si vuelven a tentar: "La estructura legal" (una
 * abstraccion, no una pieza), "Emision y cumplimiento" y "Gestion de accionistas"
 * (una etapa y dos actividades), "El expediente de la emision" y "Panel de
 * accionistas" (objetos, si, pero nombres de artefacto y no de modulo de producto).
 *
 * NOTA DE REDACCION: Jaime escribio "Dashboard de control emision". Le falta la
 * preposicion, asi que va "de control DE emision". Si la intencion era otra
 * (partirlo en "Dashboard de control" mas "Emision"), se cambia.
 *
 * EL REGISTRO, y aqui hay una tension con la marca que conviene tener presente.
 * `brand/BRAND.md` §3.1 manda tuteo en toda la landing y prohibe mezclar registros
 * en bloques contiguos. Esta seccion ya no tutea. No se resuelve pasando a tercera
 * persona (eso si romperia la regla y sonaria a folleto de banco), sino con
 * CONSTRUCCIONES IMPERSONALES: "sin licencia propia ni infraestructura que montar"
 * en vez de "no necesitas licencia, ni montar nada"; "donde se suscribe" en vez de
 * "donde suscriben tus clientes". No hay "tu" ni hay "usted": no hay sujeto.
 *
 * Las etiquetas de acceso si son metadato puro ("Acceso: emisor"), y eso no compite
 * con ningun registro porque no es prosa.
 *
 * El coste esta en que se pierde calidez justo donde antes habia una frase que
 * funcionaba ("Ninguna la montas tu"). Es la eleccion de Jaime y esta anotada aqui
 * para que se sepa que fue una eleccion.
 *
 * SE RETIRO EL ESCENARIO ANCLADO. La version anterior convertia 1861px de scroll
 * vertical en movimiento horizontal y costaba 3,95 pantallas en movil, el 20 %
 * del scroll de toda la pagina. Tres fases numeradas piden un carril que las
 * recorra; tres piezas simultaneas piden que elijas cual mirar.
 */
const surfaces = [
  {
    id: "estructura",
    glyph: StructuringGlyph,
    mockup: WorkspaceMockup,
    name: "Dashboard de control de emisión",
    operatorShort: "Acceso: Ownex y emisor",
    operator: "Acceso: Ownex y las entidades reguladas lo operan; el emisor consulta y aprueba.",
    headline: "Sin licencia propia ni infraestructura que montar.",
    desc: "El expediente completo de la emisión, con el estado de cada documento y la entidad responsable: qué ha validado la ESI, qué ha elevado la notaría y qué ha inscrito el ERIR.",
    details: [
      "La ESI autorizada valida la información al inversor antes de abrir la captación",
      "El ERIR inscribe cada participación y emite los certificados de legitimación",
      "La responsabilidad regulatoria recae en las entidades autorizadas",
    ],
  },
  {
    id: "marca",
    glyph: BrandPanelGlyph,
    mockup: BrandPanelMockup,
    name: "Panel de inversores",
    operatorShort: "Acceso: emisor",
    operator: "Acceso: el equipo del emisor, con permisos por rol.",
    headline: "La base de inversores, operable desde un único lugar.",
    desc: "Quién ha invertido, cuánto y en qué tramo, junto al motor con el que se lanzan beneficios y comunicaciones. El libro de accionistas se mantiene actualizado sin intervención manual.",
    details: [
      "Libro de accionistas al día, sin hojas de cálculo paralelas",
      "Segmentación por tramo, actividad o fecha de entrada",
      "Beneficios y comunicaciones dirigidos a un segmento concreto",
    ],
  },
  {
    id: "accionistas",
    glyph: OwnerHubGlyph,
    mockup: OwnerHubMockup,
    name: "Portal del accionista",
    operatorShort: "Acceso: inversores",
    operator: "Acceso: los inversores de la emisión, en el dominio del emisor.",
    headline: "Suscripción y seguimiento sin salir del dominio de la marca.",
    desc: "En marca blanca. Es donde se suscribe durante la captación y donde después el accionista consulta su posición, activa beneficios y vota. Ownex no aparece.",
    details: [
      "Suscripción con KYC integrado, sin abandonar el dominio del emisor",
      "Posición y tramo actualizados en todo momento",
      "Activación de beneficios y voto en las decisiones que le afectan",
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
              Cada uno con su alcance.
            </Reveal>
          </h2>
          <Reveal as="p" delay={220} className="max-w-reading text-body-lg text-text-secondary">
            El dashboard desde el que se controla la emisión, el panel de gestión de inversores
            y el portal en marca blanca donde suscriben los clientes. Los tres vienen montados y
            coordinados entre sí.
          </Reveal>
        </div>

        <Reveal>
          {/*
            El mapa de accesos hace de selector Y de diagrama a la vez, y esa es la
            razon de que las flechas esten ahi: son tres superficies conectadas, no
            tres opciones sueltas de un menu. La flecha gira con el eje (abajo en
            movil, a la derecha desde `lg`).

            El orden es de dentro hacia fuera: lo que operamos nosotros, lo que
            opera el emisor, lo que usan los inversores. No es un orden temporal,
            es la distancia a la marca.
          */}
          <p className="mb-3 text-caption text-text-tertiary">
            Selecciona un acceso para ver su pantalla.
          </p>

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
                    {/*
                      QUE ES en grande, QUIEN LA OPERA debajo. El nombre viejo de la
                      superficie ("Hub del Propietario") no aparece en ningun sitio:
                      es como se llama por dentro y no significa nada para quien
                      acaba de llegar.

                      La segunda linea dice "opera" y no "ve", y esa palabra es todo
                      el arreglo: la marca VE el expediente de su emision, lo que no
                      hace es trabajarlo.
                    */}
                    <span className="min-w-0">
                      <span className="block truncate text-caption font-medium">{surface.name}</span>
                      <span className="block truncate text-micro opacity-70">{surface.operatorShort}</span>
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
                  {/*
                    `h-full` no es decorativo. Los tres paneles comparten celda de
                    retícula, asi que todos miden lo que el mas alto: el de la
                    estructura mide 422px por su cuenta y la pila mide 574, o sea
                    152px de tarjeta vacia justo debajo de su contenido. Y es el
                    panel que sale por defecto, el primero que ve todo el mundo.

                    Con la retícula interior a alto completo, `items-center` reparte
                    ese sobrante arriba y abajo: deja de leerse como una tarjeta
                    cortada y pasa a leerse como aire. El sobrante no desaparece
                    (eso solo se arregla igualando los mockups), pero deja de
                    parecer un fallo.
                  */}
                  <div className="grid h-full gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-12">
                    <div>
                      <p className="label-caps mb-4">{surface.name}</p>
                      <h3 className="mb-3 text-headline leading-tight text-foreground lg:text-display">
                        {surface.headline}
                      </h3>
                      {/*
                        Quien la opera va aqui, en texto corriente, y no en el
                        rotulo de arriba: son frases de hasta 72 caracteres y el
                        rotulo va en versales con 0,18em de espaciado, donde una
                        frase larga se vuelve ilegible.
                      */}
                      <p className="mb-4 text-caption text-text-tertiary">{surface.operator}</p>
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

          {/*
            SALIDA DE SECCION - 27/08/2026. Antes esto se acababa y caias en la
            calculadora. Es el punto de mayor intencion de la pagina despues del
            hero: alguien que acaba de mirar el producto por dentro, pantalla a
            pantalla. Si en ese momento no hay una accion, se pierde.

            El enlace no repite el CTA generico de la pagina: pide ver ESTO, que
            es lo que la persona acaba de estar mirando.
          */}
          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-caption text-text-tertiary">
              Las tres pantallas son del producto real, con datos de ejemplo.
            </p>
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "framework", label: "Ver el producto por dentro" })}
            >
              Ver el producto por dentro
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
