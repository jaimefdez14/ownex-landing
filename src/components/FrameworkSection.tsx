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
    headline: "Seguimiento completo del estado de tu emisión.",
    desc: "El expediente completo de la emisión, con el estado de cada documento y la entidad responsable: qué ha certificado el abogado, qué ha elevado la notaría, qué ha validado la ESI y qué queda inscrito en el registro.",
    details: [
      "La ESI autorizada valida la información al inversor antes de abrir la captación",
      "El ERIR inscribe las participaciones en el cierre y emite los certificados de legitimación",
      "Cada obligación regulatoria queda asignada a una entidad autorizada",
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
    desc: "Quién ha invertido, cuánto y en qué tier, junto al motor con el que se lanzan beneficios y comunicaciones. El libro de accionistas se mantiene actualizado sin intervención manual.",
    details: [
      "Libro de accionistas al día, sin hojas de cálculo paralelas",
      "Segmentación por tier y por actividad",
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
    desc: "Bajo tu propia marca. Es la plataforma donde se suscribe durante la captación y donde después el accionista consulta su posición, activa beneficios y vota.",
    details: [
      "Suscripción con KYC integrado, sin abandonar el dominio del emisor",
      "Posición y tier actualizados en todo momento",
      "Voto en la junta de accionistas y activación de beneficios",
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
      className="section-padding spotlight bg-background theme-light-alt"
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
            y el portal bajo tu marca al que acceden tus clientes e inversores. Los tres vienen
            integrados en la misma plataforma.
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
          {/*
            EL RELLENO DEL ESCAPARATE ES ASIMETRICO DESDE `lg` - 01/09/2026. 40px a
            la izquierda, donde vive el texto y el aire es jerarquia, y 24 a la
            derecha, donde vive la pantalla y el aire solo la encoge. No se sangra
            mas alla del borde (el recurso obvio para agrandarla) porque estos
            mockups llevan datos reales en su columna derecha -- estados del
            expediente, insignias de KYC, porcentajes -- y cortarlos leeria como un
            fallo de maqueta, no como una decision.
          */}
          <div className="showcase-stack flex-1 p-5 sm:p-6 md:p-8 lg:py-10 lg:pl-10 lg:pr-6">
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
                  /*
                    LA PANTALLA PASA A SER LA COLUMNA GRANDE - 01/09/2026.

                    Era `[minmax(0,1fr)_minmax(0,420px)]`: el texto se quedaba con
                    todo lo que sobrara y la pantalla con un tope de 420px. En 1440
                    eso daba 437px de texto contra 420 de mockup, o sea que la
                    seccion que existe para ENSEÑAR el producto lo enseñaba en la
                    columna pequeña. Ahora el tope lo lleva el texto (340px, que es
                    medida de lectura de sobra para una lista de tres) y la pantalla
                    se queda con el resto: unos 525px, un 25 % mas ancha.

                    Y son TRES bloques, no dos, porque el orden en movil importa: en
                    una columna la fuente manda, asi que titular -> PANTALLA ->
                    descripcion y lista. Antes la pantalla iba detras de los cuatro
                    bloques de texto, o sea fuera de la vista en un telefono. En
                    escritorio los dos bloques de texto vuelven a la columna
                    izquierda (filas 1 y 2) y la pantalla ocupa la derecha entera.

                    `content-center` y no `items-center`: con la pantalla abarcando
                    las dos filas, centrar cada fila por separado separaria el
                    titular de su descripcion en cuanto el mockup fuera mas alto.
                    Centrando el BLOQUE de filas, los dos textos siguen juntos.
                  */
                  className="showcase-panel grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:content-center lg:gap-x-10 lg:gap-y-5"
                >
                  <div className="lg:col-start-1 lg:row-start-1">
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
                    {/*
                      SE QUEDA EN 28px DESDE `sm` - antes subia a 40 en `lg`. Dos
                      motivos, los dos de jerarquia: el h2 de la seccion mide 56 y
                      un h3 de 40 dentro de la tarjeta competia con el en vez de
                      depender de el; y a 40px este titular se comia 132px de alto,
                      mas que un tercio de la pantalla que hay al lado. Es el titulo
                      de una tarjeta, y a 28 lo parece.
                    */}
                    <h3 className="text-[24px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-headline">
                      {surface.headline}
                    </h3>
                  </div>

                  {/*
                    LA PANTALLA. Segunda en el orden del documento, que es el que
                    manda en movil; en escritorio salta a la columna derecha y
                    abarca las dos filas de texto.
                  */}
                  <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
                    <Mockup />
                  </div>

                  <div className="lg:col-start-1 lg:row-start-2">
                    {/*
                      El cuerpo se queda en `text-body` (16px) en vez de subir a
                      `body-lg` en escritorio: en una columna de 340px, 17px daban
                      una linea mas y el peso del bloque de texto es justo lo que
                      esta pasada venia a bajar.
                    */}
                    <p className="mb-4 max-w-reading text-body text-text-secondary sm:mb-5">
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
            "Solicitar una demo" dice lo que hace el boton sin prometer nada que
            no haya detras. ("Pedir" -> "Solicitar" el 31/08/2026: mismo
            significado, registro algo mas formal.)
          */}
          <div className="mt-6 flex justify-start border-t border-border pt-6">
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "framework", label: "Solicitar una demo" })}
            >
              Solicitar una demo
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
