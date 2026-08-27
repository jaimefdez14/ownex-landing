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
 * REVISION COMERCIAL DEL 27/08/2026.
 *
 * Jaime pidio que la seccion fuera "mucho mas comercial, intuitiva, profesional,
 * clara". Tres cambios de fondo, todos sobre el contenido:
 *
 * 1. LA AUDIENCIA PASA A SER LA ETIQUETA PRINCIPAL. Antes la ficha decia
 *    "Hub del Propietario" en grande y "Tus accionistas" en pequeno arriba. Pero
 *    "Hub del Propietario" es el nombre INTERNO de una superficie del producto
 *    (`docs/CLAUDE.md`, superficie C): no significa nada para quien entra por
 *    primera vez. Ahora manda "Tus accionistas", que se entiende sin explicacion,
 *    y el nombre del producto baja a segunda linea. Las tres son posesivos
 *    paralelos, asi que la lista se lee de un vistazo.
 *
 * 2. CADA PANEL ABRE CON EL RESULTADO, NO CON LA DESCRIPCION. Antes empezaban
 *    por donde vive la cosa ("Donde tu abogado, la ESI y el ERIR trabajan tu
 *    emision"). Ahora abren por lo que el cliente se lleva ("No necesitas
 *    licencia. Ni montar nada"), y la descripcion viene despues. Es la diferencia
 *    entre un catalogo y un argumento de venta.
 *
 * 3. LA SECCION TIENE SALIDA. Antes se acababa y caias en la calculadora. Este
 *    es el punto de mayor intencion de la pagina despues del hero: alguien que
 *    acaba de mirar el producto por dentro. Si ahi no hay una accion, se pierde.
 */
const surfaces = [
  {
    id: "estructura",
    glyph: StructuringGlyph,
    mockup: WorkspaceMockup,
    audience: "Nosotros y los reguladores",
    surface: "La estructura legal",
    headline: "No necesitas licencia. Ni montar nada.",
    desc: "Tu abogado, una ESI autorizada y el ERIR trabajan tu emisión en nuestro workspace. Tú apruebas; el trabajo regulatorio lo hacemos nosotros.",
    details: [
      "Una ESI autorizada valida la información antes de abrir la captación",
      "El ERIR inscribe cada participación y emite los certificados",
      "La responsabilidad regulatoria es de las entidades autorizadas, no tuya",
    ],
  },
  {
    id: "marca",
    glyph: BrandPanelGlyph,
    mockup: BrandPanelMockup,
    audience: "Tu equipo",
    surface: "El panel de gestión",
    headline: "Tu base de accionistas, operable.",
    desc: "Quién ha invertido, cuánto y en qué tramo, y el motor con el que les lanzas beneficios y comunicaciones. Todo en el mismo sitio.",
    details: [
      "El libro de accionistas al día, sin hojas de cálculo",
      "Segmentas por tramo, actividad o fecha de entrada",
      "Lanzas beneficios y comunicados solo a ese segmento",
    ],
  },
  {
    id: "accionistas",
    glyph: OwnerHubGlyph,
    mockup: OwnerHubMockup,
    audience: "Tus accionistas",
    surface: "El portal, en tu web",
    headline: "Tus clientes invierten sin salir de tu web.",
    desc: "Con tu marca y en tu dominio. Es donde suscriben durante la captación y donde viven después. Ownex no aparece por ningún lado.",
    details: [
      "Suscriben con KYC integrado, sin salir de tu dominio",
      "Ven su posición y su tramo actualizados en todo momento",
      "Activan beneficios y votan en lo que les afecta",
    ],
  },
];

export function FrameworkSection() {
  const [active, setActive] = useState(0);

  const select = (index: number) => {
    setActive(index);
    track("surface_select", { surface: surfaces[index].surface });
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
            movil, a la derecha desde `lg`).

            El orden es de dentro hacia fuera: lo que operamos nosotros, lo que
            opera tu equipo, lo que ven tus clientes. No es un orden temporal, es
            la distancia a la marca.
          */}
          <p className="mb-3 text-caption text-text-tertiary">
            Elige un acceso para ver su pantalla.
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
                      La AUDIENCIA en grande y el nombre del producto debajo, no al
                      reves. "Hub del Propietario" es como se llama la superficie C
                      por dentro; "Tus accionistas" es lo que entiende quien acaba
                      de llegar. El nombre no se pierde, baja de rango.
                    */}
                    <span className="min-w-0">
                      <span className="block truncate text-caption font-medium">
                        {surface.audience}
                      </span>
                      <span className="block truncate text-micro opacity-70">{surface.surface}</span>
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
                      <p className="label-caps mb-4">{surface.surface}</p>
                      <h3 className="mb-3 text-headline leading-tight text-foreground lg:text-display">
                        {surface.headline}
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
