import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { BrandPanelMockup, OwnerHubMockup, WorkspaceMockup } from "./ProductMockups";
import { BrandPanelGlyph, OwnerHubGlyph, StructuringGlyph } from "./PhaseGlyphs";
import { cn } from "../lib/cn";
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
  const bloques = useRef<Array<HTMLDivElement | null>>([]);

  /*
    Gana el bloque que cruza el CENTRO de la pantalla. La franja de deteccion se
    reduce a la decima parte central (`-45%` por arriba y por abajo), asi que en todo momento
    hay como mucho un candidato y el cambio no parpadea entre dos vecinos.

    Si el navegador no trae `IntersectionObserver`, no se observa nada: la seccion
    se queda con la primera captura y los tres bloques de texto se leen igual.
  */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = bloques.current.indexOf(entry.target as HTMLDivElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    bloques.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  /*
    Pulsar un punto marca el acceso Y lleva al bloque, en ese orden.

    El `setActive` de aqui NO sobra, aunque el observador vaya a marcar lo mismo en
    cuanto el bloque cruce el centro. Sin el, el punto depende de que el observador
    exista y funcione, y si no lo hace queda un control que se pulsa y no pasa
    nada: un boton muerto, que es justo lo que la pagina evita en el menu movil
    con `js-only`. Con el, el estado cambia siempre y el observador solo confirma.

    `scrollIntoView` va SIN `behavior`, a proposito: asi hereda el
    `scroll-behavior` del CSS, que es `smooth` y pasa a `auto` bajo
    `prefers-reduced-motion` (ver `index.css`). Escribir "smooth" aqui se saltaria
    esa preferencia.
  */
  const irA = (index: number) => {
    setActive(index);
    bloques.current[index]?.scrollIntoView({ block: "center" });
    track("surface_select", { surface: surfaces[index].name });
  };

  const ActiveGlyph = surfaces[active].glyph;

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
          {/*
            TITULAR NUEVO - 28/08/2026, redaccion de Jaime. Decia "Una plataforma,
            tres accesos. / Cada uno con su alcance.", que subrayaba la SEPARACION;
            ahora subraya lo contrario, que es una sola herramienta y cubre el
            ciclo entero. Las tres piezas de debajo no cambian: siguen siendo la
            prueba de esa frase en vez de ser el argumento.

            Y cambia la forma del bicolor: de dos `block` (salto forzado) a dos
            tramos EN LINEA, que es la otra variante que ya usa la pagina ("El
            desajuste" y el cierre). Con dos bloques, la segunda mitad (53
            caracteres frente a 20) se quedaba colgando en su propio parrafo; en
            linea el texto fluye y rompe donde le toca. El corte de color sigue
            cayendo donde esta el giro de sentido: que es, y para que sirve.
          */}
          <Reveal
            as="h2"
            id="framework-title"
            delay={60}
            className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[56px]"
          >
            Una única plataforma{" "}
            <span className="text-text-tertiary">
              para la gestión completa de la emisión y accionistas.
            </span>
          </Reveal>
          <Reveal as="p" delay={220} className="max-w-reading text-body-lg text-text-secondary">
            El dashboard desde el que se controla la emisión, el panel de gestión de inversores
            y el portal en marca blanca donde suscriben los clientes. Los tres vienen montados y
            coordinados entre sí.
          </Reveal>
        </div>

        {/*
          ESCAPARATE ANCLADO - 28/08/2026, CUARTA VERSION DE ESTA SECCION.

          Historial corto, porque explica por que esta version es esta y no otra:

            pestañas          interactiva, pero enseñaba UNA pantalla de tres. Dos
                              tercios del producto detras de un clic que la mayoria
                              no da.
            tres anclados     cada captura con su `sticky`. Se solapaban 14px (tres
                              capturas de alturas distintas en filas pegadas) y
                              costaba 2599px por los `min-h` que necesitaba.
            tres filas        sin solape y sin coste, pero sin nada que tocar.
            una tarjeta       resolvia que el titular dice "una plataforma" y la
                              maqueta decia "tres productos". Seguia sin ser
                              interactiva.

          Lo que Jaime pide ahora es que sea moderna e interactiva. El unico patron
          que da las dos cosas SIN esconder nada es el escaparate anclado: una sola
          captura fija en pantalla que CAMBIA sola segun vas leyendo. No hay nada
          que pulsar para ver el resto, porque el resto llega solo; y a la vez se
          puede pulsar, porque los tres puntos de la cabecera saltan a cada bloque.

          POR QUE ESTE `sticky` SI Y EL ANTERIOR NO. Aquel eran TRES elementos
          anclados, uno por fila, y por eso podian pisarse entre ellos. Este es UNO
          SOLO, con las tres capturas apiladas dentro por `.swap-stack`. Un unico
          elemento anclado no puede solaparse con nadie: no hay con quien.

          QUIEN MANDA EL CAMBIO. Un `IntersectionObserver` con la franja de deteccion
          reducida al centro de la pantalla (`-45%` arriba y abajo): gana el bloque
          que cruza el centro, que es el que la persona esta leyendo. Sin
          observador, se queda en el primero y la seccion sigue leyendose entera:
          los tres bloques de texto estan siempre en el DOM y no dependen de nada.

          SIN JAVASCRIPT las tres capturas se sirven apiladas (regla
          `html:not(.js) .swap-panel` de `index.css`), asi que tampoco ahi se
          esconde nada.

          EN MOVIL funciona igual, con una diferencia: la captura anclada se limita
          a 36vh y se desvanece por abajo. Sin ese tope, la mas alta de las tres
          (508px) se comeria dos tercios de la pantalla y no quedaria sitio para
          leer el texto que la explica. Con el, el panel ocupa el 47 por ciento de
          la pantalla y el texto se queda con el resto, que es el reparto que hace
          que se pueda leer y mirar a la vez.
        */}
        <Reveal className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start lg:gap-x-14">
          {/*
            EL PANEL VA PRIMERO EN EL DOM. En movil eso lo deja arriba, que es donde
            tiene que anclarse; en escritorio la retícula lo manda a la segunda
            columna con `lg:col-start-2 lg:row-start-1`, asi que el orden visual es
            el de siempre (texto a la izquierda) sin duplicar una sola etiqueta.
          */}
          <div className="sticky top-[76px] z-10 mb-8 lg:top-24 lg:col-start-2 lg:row-start-1 lg:mb-0">
            <div className="glass-card overflow-hidden p-4 lg:p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-soft">
                    <ActiveGlyph size={14} className="text-on-accent-soft" />
                  </span>
                  <span className="truncate text-caption font-medium text-foreground">
                    {surfaces[active].name}
                  </span>
                </span>

                {/*
                  Los tres puntos. No son `role="tab"`: una barra de pestañas
                  promete que el contenido cambia cuando TU pulsas, y aqui cambia
                  tambien al desplazarte, que es lo normal en este patron. Son
                  botones con `aria-current`, que es lo que de verdad describe
                  "este es el que estas viendo".

                  El area pulsable es de 44px de alto aunque el punto mida 6: el
                  punto es la señal, no el objetivo.
                */}
                <div className="flex shrink-0 items-center">
                  {surfaces.map((surface, index) => (
                    <button
                      key={surface.id}
                      type="button"
                      onClick={() => irA(index)}
                      aria-current={index === active ? "true" : undefined}
                      aria-label={`Ver ${surface.name}`}
                      className="flex h-11 w-6 items-center justify-center"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "block h-[6px] rounded-full transition-all duration-300 motion-reduce:transition-none",
                          /*
                            `bg-text-tertiary` y no `bg-outline`: ese segundo no
                            existe como color en `tailwind.config.js`, asi que
                            Tailwind no generaba nada y los puntos inactivos salian
                            TRANSPARENTES. Se veia uno de tres.

                            Y el activo no se distingue solo por el color: mide
                            tres veces mas de ancho. Nada por color solo.
                          */
                          index === active ? "w-5 bg-emerald-400" : "w-[6px] bg-text-tertiary",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/*
                El tope de alto y el desvanecido solo existen en movil
                (`lg:max-h-none`, y la mascara se apaga con `lg:[mask-image:none]`).
              */}
              <div className="swap-stack max-h-[36vh] overflow-hidden [mask-image:linear-gradient(to_bottom,black_78%,transparent)] lg:max-h-none lg:[mask-image:none]">
                {surfaces.map((surface, index) => {
                  const Mockup = surface.mockup;
                  return (
                    <div
                      key={surface.id}
                      className="swap-panel"
                      data-active={index === active ? "true" : "false"}
                    >
                      <Mockup />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LOS TRES BLOQUES DE TEXTO. Siempre visibles, siempre en el DOM. */}
          <div className="lg:col-start-1 lg:row-start-1">
            {surfaces.map((surface, index) => {
              const Glyph = surface.glyph;
              const on = index === active;
              return (
                <div
                  key={surface.id}
                  id={`superficie-${surface.id}`}
                  ref={(node) => {
                    bloques.current[index] = node;
                  }}
                  className={cn(
                    "scroll-mt-32 border-t border-border py-8 first:border-t-0 first:pt-0 lg:flex lg:min-h-[420px] lg:flex-col lg:justify-center lg:py-12",
                  )}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors duration-300 motion-reduce:transition-none",
                        on ? "bg-accent-soft" : "bg-card-hover",
                      )}
                    >
                      <Glyph size={18} className={on ? "text-on-accent-soft" : "text-text-tertiary"} />
                    </span>
                    <span className="text-caption font-medium text-foreground">{surface.name}</span>
                  </div>

                  <h3 className="mb-3 text-headline leading-tight text-foreground lg:text-display">
                    {surface.headline}
                  </h3>
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
