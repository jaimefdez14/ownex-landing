import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { BrandPanelMockup, OwnerHubMockup, WorkspaceMockup } from "./ProductMockups";
import { BrandPanelGlyph, OwnerHubGlyph, StructuringGlyph } from "./PhaseGlyphs";
import { cn } from "../lib/cn";
import { useTablistKeys } from "../lib/useTablistKeys";
import { track } from "../lib/analytics";

/**
 * "Cómo funciona". Tres superficies del producto, ordenadas por QUÉ ES cada
 * una (no por audiencia ni por fase): un dashboard de control que operan Ownex
 * y las entidades reguladas, un panel de inversores que opera el emisor, y un
 * portal en marca blanca que opera el inversor. Ninguna tiene orden temporal
 * respecto a las otras dos, así que no van numeradas.
 *
 * Los nombres y el registro los fijó Jaime el 27/08/2026 tras varias pasadas.
 * El registro es impersonal ("sin licencia propia que montar", no "no
 * necesitas licencia"): `brand/BRAND.md` §3.1 manda tuteo en el resto de la
 * landing, y esta sección no tutea a propósito: es la única del sitio que no
 * lo hace, y queda anotado aquí para que se sepa que es una elección y no un
 * despiste.
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
const surfaces = [
  {
    id: "estructura",
    glyph: StructuringGlyph,
    mockup: WorkspaceMockup,
    name: "Dashboard de control de emisión",
    /*
      Rotulo corto del riel, solo para telefono y tablet (ver el riel abajo). No
      es un nombre alternativo de la pieza: es la palabra que la distingue de las
      otras dos en 111px de ancho.
    */
    short: "Emisión",
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
    short: "Inversores",
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
    short: "Accionistas",
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
    if (index === active) return;
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
        <div className="mb-6 max-w-[800px] sm:mb-10 md:mb-14">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            Cómo funciona
          </Reveal>
          <Reveal
            as="h2"
            id="framework-title"
            delay={60}
            className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[56px]"
          >
            Una única plataforma{" "}
            <span className="text-text-tertiary">
              para la gestión completa de la emisión y accionistas.
            </span>
          </Reveal>
          <Reveal as="p" delay={220} className="max-w-reading text-body text-text-secondary sm:text-body-lg">
            El dashboard desde el que se controla la emisión, el panel de gestión de inversores
            y el portal en marca blanca donde suscriben los clientes. Los tres vienen montados y
            coordinados entre sí.
          </Reveal>
        </div>

        <Reveal className="glass-card overflow-hidden lg:flex">
          {/*
            EL RIEL. Fila horizontal por debajo de `lg`, columna vertical desde
            ahí: los tres iconos no cambian de significado con el ancho, así que
            no hace falta declarar `aria-orientation` (mismo motivo que llevó a
            quitarlo de "En la práctica" el 27/08): `useTablistKeys` acepta los
            dos ejes de flecha en cualquier caso.

            El activo lleva el acento sólido; los otros dos, un fondo neutro.
            Nunca por color solo: el activo es además el único con
            `aria-selected="true"`, que es lo que anuncia un lector de pantalla,
            y el único con área de 44px que de verdad hace algo al enfocarlo
            (los otros llevan `tabIndex={-1}`, fuera del recorrido de tabulador).
          */}
          {/*
            EL RIEL LLEVA ROTULO POR DEBAJO DE `lg` - 29/08/2026.

            Eran tres iconos pelados en todos los anchos, y en telefono eso no
            funcionaba: nada decia que hubiera tres piezas ni cual era cada una.
            Dos iconos grises al lado de uno verde se leen como decoracion, no
            como un control, y el `aria-label` que si estaba puesto solo lo
            aprovecha quien navega con lector de pantalla.

            En escritorio el argumento original SI se sostiene y por eso ahi no
            cambia nada: el riel esta pegado al panel, en la misma fila, asi que
            el nombre completo de la pieza se lee a diez centimetros del icono y
            repetirlo seria la duplicacion que se corrigio el 27/08. En movil el
            panel cae DEBAJO, fuera de la vista, y esa relacion se pierde.

            El rotulo es `short` y no `name`: las tres celdas se reparten 335px,
            o sea 111px cada una, y "Dashboard de control de emisión" no entra
            en eso ni a 11px. `aria-label` sigue llevando el nombre largo, que es
            el que de verdad describe la pieza.
          */}
          <div
            role="tablist"
            aria-label="Accesos a la plataforma"
            onKeyDown={onKeyDown}
            className="grid shrink-0 grid-cols-3 gap-2 border-b border-border p-3 lg:flex lg:flex-col lg:justify-center lg:gap-3 lg:border-b-0 lg:border-r lg:p-5"
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
                  /*
                    ICONO ENCIMA DEL ROTULO, no al lado. Los tres se reparten
                    335px menos rellenos, o sea unos 98px de celda, y en una fila
                    el icono se come 26 de esos: quedaban 56px de texto y
                    "Inversores" (62px a 13px) salia cortado con puntos
                    suspensivos. Apilados, el rotulo dispone de la celda entera y
                    ninguno de los tres se trunca. Desde `lg` vuelve a ser un
                    icono suelto en columna vertical y esto no aplica.
                  */
                  className={cn(
                    "flex min-h-touch flex-col items-center justify-center gap-1 rounded-md px-1 py-2 transition-colors duration-200 lg:h-11 lg:w-11 lg:shrink-0 lg:flex-row lg:px-0 lg:py-0",
                    on
                      ? "bg-accent-soft text-on-accent-soft"
                      : "text-text-tertiary hover:bg-card-hover hover:text-foreground",
                  )}
                >
                  <Glyph size={18} className="shrink-0" />
                  {/*
                    `aria-hidden` porque el boton ya tiene `aria-label` con el
                    nombre largo: sin esto, un lector de pantalla anunciaria el
                    rotulo corto ademas del largo.
                  */}
                  <span
                    aria-hidden="true"
                    className="text-caption font-medium leading-none lg:hidden"
                  >
                    {surface.short}
                  </span>
                </button>
              );
            })}
          </div>

          {/*
            `.showcase-stack` apila los tres paneles en la misma celda de
            retícula (ver `index.css`): el contenedor mide siempre lo que el
            panel MÁS ALTO de los tres, así que cambiar de pieza no mueve ni un
            píxel del resto de la sección hacia arriba o abajo.
          */}
          <div className="showcase-stack flex-1 p-5 sm:p-6 md:p-8 lg:p-10">
            {surfaces.map((surface, index) => {
              const on = index === active;
              const Mockup = surface.mockup;
              return (
                <div
                  key={surface.id}
                  role="tabpanel"
                  id={`superficie-${surface.id}-panel`}
                  aria-labelledby={`superficie-${surface.id}-tab`}
                  data-active={on ? "true" : "false"}
                  className="showcase-panel grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:gap-x-12"
                >
                  <div>
                    <p className="mb-3 text-caption font-medium text-accent-ink">
                      {surface.operatorShort}
                    </p>
                    {/*
                      24px en telefono y no los 28 de `text-headline`: el titular
                      de la seccion, tres dedos mas arriba, ya va a 32px, y a 28
                      este competia con el en vez de depender de el. Desde `sm`
                      vuelve a 28 y desde `lg` a 40, donde el h2 es mucho mayor y
                      la distancia se recupera sola.
                    */}
                    <h3 className="mb-3 text-[24px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-headline lg:text-display">
                      {surface.headline}
                    </h3>
                    <p className="mb-4 max-w-reading text-body text-text-secondary sm:mb-6 lg:text-body-lg">
                      {surface.desc}
                    </p>
                    <ul className="space-y-2 border-t border-border pt-4 sm:space-y-3 sm:pt-5">
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

                  <div className="min-w-0">
                    <Mockup />
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={100}>
          {/*
            SALIDA DE SECCION - 27/08/2026. Antes esto se acababa y caias en la
            calculadora. Es el punto de mayor intencion de la pagina despues del
            hero: alguien que acaba de mirar el producto por dentro, pantalla a
            pantalla. Si en ese momento no hay una accion, se pierde.

            El enlace no repite el CTA generico de la pagina: pide ver ESTO, que
            es lo que la persona acaba de estar mirando.
          */}
          {/*
            SE FUE LA LINEA "Las tres pantallas son del producto real, con datos
            de ejemplo." - 29/08/2026, a peticion de Jaime. Decir en voz alta que
            algo es "real" invita justo a la duda contraria; y "con datos de
            ejemplo" es una salvedad que resta. La maqueta se defiende sola.

            EL ROTULO DEL BOTON, 29/08/2026: era "Ver el producto por dentro" y
            apunta a `#contact` (un formulario, no una pantalla): promesa rota.
            "Pedir una demo" dice lo que hace el boton sin prometer nada que no
            haya detras.
          */}
          <div className="mt-6 flex justify-start border-t border-border pt-6">
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "framework", label: "Pedir una demo" })}
            >
              Pedir una demo
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
