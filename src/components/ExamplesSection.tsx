import { useRef, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  Dumbbell,
  Shirt,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { cn } from "../lib/cn";
import { track } from "../lib/analytics";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * Casos de uso por sector.
 *
 * REHECHO EL 26/08/2026, A PETICION DE JAIME.
 *
 * Antes eran tres tarjetas fijas, una al lado de otra: moda, hosteleria y
 * gimnasios. El problema no era como se veian, era a quien dejaban fuera. Un
 * fundador de cosmetica o de bebidas leia "tres sectores" y concluia, con toda
 * la razon, que esto no iba con el. Y ampliar la fila no valia: seis tarjetas
 * en paralelo no caben, y en movil son seis pantallas de scroll para llegar al
 * caso que te interesa.
 *
 * Asi que la seccion pasa a fichas seleccionables: la lista de sectores a un
 * lado y el caso completo al otro, uno cada vez. Caben cuatro casos en el
 * espacio en el que antes cabian tres, cada visitante va directo al suyo, y el
 * ultimo ("Y muchos mas") existe para que nadie se descarte: dice explicitamente
 * que la logica no depende del sector.
 *
 * DOS DECISIONES QUE NO SON DE ESTILO:
 *
 * 1. Los cuatro paneles estan SIEMPRE en el DOM. No se monta y desmonta el
 *    seleccionado. Es el mismo criterio que el acordeon de preguntas
 *    (`ui/Accordion.tsx`): el texto de los cuatro sectores es contenido
 *    indexable y tiene que estar en el HTML prerenderizado, no aparecer solo
 *    despues de un clic. Y sin JavaScript las fichas no pulsan, asi que los
 *    cuatro casos se sirven apilados y legibles; el plegado vive en CSS bajo
 *    `html.js` (ver `.swap-panel` en `index.css`).
 *
 * 2. Los paneles se apilan en la MISMA celda de una retícula, no se ocultan con
 *    `display: none`. Asi el contenedor mide siempre lo que el panel mas alto y
 *    cambiar de sector no mueve nada de lo que hay debajo. La alternativa era
 *    fijar un alto minimo en pixeles, que se rompe en cuanto alguien alarga un
 *    parrafo.
 *
 * Sobre el movimiento al cambiar de ficha: el panel entrante desliza 8px, y solo
 * eso. La opacidad NO se transiciona. Es la regla que dejo escrita el fallo de
 * las tarjetas de "Que es Ownex" (ver bloque 10 de `index.css`): una animacion
 * puede apartar algo de su sitio, nunca puede ser la responsable de traerlo a
 * el. Si la transicion se congelara, el panel sigue siendo legible, solo que
 * 8px mas abajo.
 */

type Sector = {
  id: string;
  icon: LucideIcon;
  industry: string;
  title: string;
  scenario: string;
  benefits: string[];
};

/* Identificador e icono: no son copy. El `id` va en el `id` del panel y en el evento. */
const SECTORS: { id: string; icon: LucideIcon }[] = [
  { id: "moda", icon: Shirt },
  { id: "restauracion", icon: UtensilsCrossed },
  { id: "wellness", icon: Dumbbell },
  { id: "otros", icon: CircleCheck },
];

type SectorCopy = Omit<Sector, "id" | "icon">;

const sectorsCopy: Localized<SectorCopy[]> = {
  es: [
  {
    industry: "Moda y streetwear",
    title: "Tus clientes llevan tu marca. Que también la posean.",
    scenario:
      "Una marca de moda con comunidad leal abre una ronda para sus mejores clientes. Los inversores acceden a drops exclusivos, votan en decisiones de diseño y participan en la revalorización del negocio.",
    benefits: [
      "Acceso a colecciones antes que nadie",
      "Voto en decisiones de producto",
      "Participación en la revalorización de la marca",
    ],
  },
  {
    industry: "Restauración y hostelería",
    title: "Tus habituales financian tu expansión.",
    scenario:
      "Un grupo de restauración permite a sus clientes más fieles invertir en la apertura de nuevas localizaciones. El resultado: inversores que traen reservas, no solo likes.",
    benefits: [
      "Capital para nuevas ubicaciones sin depender solo de bancos",
      "Inversores que refieren porque les va algo en el crecimiento",
      "Acceso a experiencias exclusivas en local",
    ],
  },
  {
    industry: "Gimnasios y centros wellness",
    title: "Tu comunidad entrena contigo. Y crece contigo.",
    scenario:
      "Una cadena de gimnasios, un box o un centro de yoga ofrece a sus socios la posibilidad de invertir en él. Participan en las decisiones sobre nuevos servicios, acceden a condiciones preferentes y participan en los resultados del negocio.",
    benefits: [
      "Retención por propiedad, no por descuento",
      "Co-diseño de nuevos servicios con quienes los usan",
      "Si el centro crece, el socio que ha invertido se beneficia",
    ],
  },
  {
    industry: "Y muchos más",
    title: "¿Tu sector no está en la lista? La lógica es la misma.",
    scenario:
      "Ownex no depende del sector, depende de la relación. Si tienes una base de clientes que vuelve, que te recomienda y que se identifica con lo que haces, esa base puede financiarte. La estructura es la misma para retail, ocio, hoteles, educación o servicios por suscripción.",
    benefits: [
      "Sirve a cualquier marca con clientes recurrentes",
      "La estructura legal no cambia de un sector a otro",
      "En una llamada te decimos si tu caso encaja",
    ],
  },
  ],
  en: [
    {
      industry: "Fashion and streetwear",
      title: "Your customers wear your brand. Let them own it too.",
      scenario:
        "A fashion brand with a loyal community opens a round to its best customers. Investors get access to exclusive drops, vote on design decisions and share in the rise in value of the business.",
      benefits: [
        "Access to collections before anyone else",
        "A vote on product decisions",
        "A share in the brand's rise in value",
      ],
    },
    {
      industry: "Restaurants and hospitality",
      title: "Your regulars fund your expansion.",
      scenario:
        "A restaurant group lets its most loyal customers invest in opening new locations. The result: investors who bring bookings, not just likes.",
      benefits: [
        "Capital for new locations without depending on banks alone",
        "Investors who refer because they have a stake in the growth",
        "Access to exclusive experiences in the venue",
      ],
    },
    {
      industry: "Gyms and wellness centres",
      title: "Your community trains with you. And grows with you.",
      scenario:
        "A gym chain, a box or a yoga studio offers its members the chance to invest in it. They take part in decisions on new services, get preferential terms and share in the results of the business.",
      benefits: [
        "Retention through ownership, not through discounts",
        "New services co-designed with the people who use them",
        "If the centre grows, the member who has invested benefits",
      ],
    },
    {
      industry: "And many more",
      title: "Your sector isn't on the list? The logic is the same.",
      scenario:
        "Ownex doesn't depend on the sector, it depends on the relationship. If you have a customer base that comes back, that recommends you and that identifies with what you do, that base can fund you. The structure is the same for retail, leisure, hotels, education or subscription services.",
      benefits: [
        "Works for any brand with recurring customers",
        "The legal structure doesn't change from one sector to another",
        "On a call we'll tell you whether your case fits",
      ],
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "En la práctica",
    titleA: "Misma infraestructura,",
    titleB: "una solución adaptada a cada sector.",
    lede: "Si tus clientes ya son leales, dales un motivo financiero para quedarse.",
    tablist: "Sectores",
    qualifyEyebrow: "Quién cualifica",
    qualifyTitle: "¿Es el sistema Ownex para mi marca?",
    qualifyBody: "Tienes una marca de consumo con clientes que vuelven y planeas levantar capital o expandir.",
    qualifyNote: "Diseñado para marcas con comunidades amplias y bases de clientes fieles y recurrentes.",
    cta: "Ver si mi marca encaja",
    requirements: [
      "Marca de consumo con ingresos recurrentes",
      "Operador que planea nuevas ubicaciones o líneas de producto",
      "Fundador que quiere capital de su comunidad, no solo de VCs",
      "Cualquier sector con clientes que vuelven: no hay lista cerrada",
    ],
  },
  en: {
    eyebrow: "In practice",
    titleA: "Same infrastructure,",
    titleB: "a solution adapted to each sector.",
    lede: "If your customers are already loyal, give them a financial reason to stay.",
    tablist: "Sectors",
    qualifyEyebrow: "Who qualifies",
    qualifyTitle: "Is the Ownex system right for my brand?",
    qualifyBody: "You have a consumer brand with customers who come back, and you plan to raise capital or expand.",
    qualifyNote: "Designed for brands with large communities and loyal, recurring customer bases.",
    cta: "See if my brand fits",
    requirements: [
      "Consumer brand with recurring revenue",
      "Operator planning new locations or product lines",
      "Founder who wants capital from their community, not only from VCs",
      "Any sector with customers who come back: there is no closed list",
    ],
  },
};

export function ExamplesSection() {
  const t = useCopy(COPY);
  const copy = useCopy(sectorsCopy);
  const sectors: Sector[] = SECTORS.map((sector, index) => ({ ...sector, ...copy[index] }));
  const requirements = t.requirements;

  const [activeId, setActiveId] = useState(SECTORS[0].id);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (sector: Sector) => {
    setActiveId(sector.id);
    /* El `id` y no el rotulo: el rotulo cambia con el idioma y el embudo no debe. */
    track("sector_select", { sector: sector.id });
  };

  /*
    Navegacion por teclado del patron de pestañas (APG). Acepta los dos ejes a
    proposito y no solo el vertical: la lista es una columna desde `lg` pero por
    debajo son pastillas que fluyen en horizontal, asi que la flecha que espera
    quien mira la pantalla depende del ancho. Home y End saltan a los extremos.

    El foco se mueve con `tabIndex` rotatorio (solo la ficha activa es
    tabulable), que es lo que evita que un `tablist` de cuatro elementos obligue a
    dar cuatro tabuladores para cruzarlo.
  */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const current = sectors.findIndex((s) => s.id === activeId);
    let next = current;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (current + 1) % sectors.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (current - 1 + sectors.length) % sectors.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sectors.length - 1;
    else return;

    event.preventDefault();
    select(sectors[next]);
    tabsRef.current[next]?.focus();
  };

  return (
    <section
      id="examples"
      aria-labelledby="examples-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mx-auto mb-8 max-w-[800px] sm:mb-14 sm:text-center">
          <Reveal as="p" className="rule-grow label-caps mb-4 rule-grow-center-sm sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <h2
            id="examples-title"
            className="display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            {/* El espacio separa las dos lineas en el texto plano; ver HeroSection. */}
            <Reveal as="span" delay={80} className="text-rise sm:block">
              {t.titleA}
            </Reveal>{" "}
            <Reveal as="span" delay={170} className="text-rise text-text-tertiary sm:block">
              {t.titleB}
            </Reveal>
          </h2>
          <Reveal as="p" delay={240} className="text-body text-text-secondary sm:text-body-lg">
            {t.lede}
          </Reveal>
        </div>

        <Reveal className="grid gap-4 lg:grid-cols-[minmax(0,270px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div
            role="tablist"
            aria-label={t.tablist}
            /*
              TIRA HORIZONTAL EN TELEFONO, COLUMNA DESDE `lg` - 29/08/2026.

              Historial: primero eran pastillas `flex-wrap` (siete renglones de
              anchos distintos, borde derecho dentado); luego una lista de ancho
              completo, también en móvil (siete filas de 48px = ~470px de puro
              selector antes de ver un solo caso, en una sección que ya es la más
              alta de la página). Jaime: "más selectores, no una sola columna".

              Ahora en teléfono es una tira que se desliza en horizontal: las
              pastillas en una fila, cada una al ancho de su texto, con
              scroll-snap y la última recortada por un degradado en el borde para
              que se vea que hay más. Ocupa una fila, no siete. Desde `lg` vuelve
              la columna de ancho completo pegada al panel, que ahí sí cabe.

              LOS SIETE SON CUATRO DESDE EL 31/08/2026. Jaime retiró "Bebidas y
              alimentación", "Belleza y cuidado personal" y "Clubes y entidades
              deportivas": quedan moda, restauración, wellness y el caso abierto.
              Los números de siete que siguen escritos ahí arriba son del
              historial, no del estado actual, y se dejan porque explican por qué
              esta tira es una tira. En cuatro pastillas ya no hace falta el
              deslizamiento en la mayoría de teléfonos -- caben --, pero el
              degradado y el scroll-snap no estorban cuando sobra sitio, y el día
              que se añada un sector vuelve a hacer falta sin tocar nada.

              Sin `aria-orientation`: el eje es horizontal en móvil y vertical en
              `lg`, y el manejador de teclado (`onKeyDown`) acepta los dos a
              propósito. La tira bleedea a los bordes de la pantalla (`-mx-5 px-5`)
              y recupera el margen desde `lg`.
            */
            onKeyDown={onKeyDown}
            className="-mx-5 flex gap-2 overflow-x-auto scroll-px-5 px-5 pb-1 snap-x [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 lg:[mask-image:none] [&::-webkit-scrollbar]:hidden"
          >
            {sectors.map((sector, index) => {
              const active = sector.id === activeId;
              const Icon = sector.icon;
              return (
                <button
                  key={sector.id}
                  ref={(node) => {
                    tabsRef.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`sector-${sector.id}-tab`}
                  aria-selected={active}
                  aria-controls={`sector-${sector.id}-panel`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => select(sector)}
                  className={cn(
                    "flex min-h-touch shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-full px-4 text-caption transition-colors lg:w-full lg:shrink lg:gap-3 lg:rounded-lg lg:px-4 lg:py-3",
                    active
                      ? "bg-accent-soft font-medium text-on-accent-soft"
                      : "border border-border bg-card-hover text-text-secondary hover:border-emerald-400/25 hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden="true" size={16} className="shrink-0" />
                  <span>{sector.industry}</span>
                </button>
              );
            })}
          </div>

          <div className="swap-stack">
            {sectors.map((sector) => {
              return (
              <div
                key={sector.id}
                role="tabpanel"
                id={`sector-${sector.id}-panel`}
                aria-labelledby={`sector-${sector.id}-tab`}
                data-active={sector.id === activeId ? "true" : "false"}
                className="swap-panel glass-card overflow-hidden"
              >
                {/*
                  AQUI HUBO UN HUECO DE IMAGEN, Y SE RETIRA ENTERO - 31/08/2026.

                  Era una columna de 300px a la derecha con la foto del sector a
                  sangre y, mientras no hubiera foto, un motivo de marca (mint con
                  rejilla de puntos y el icono del sector). Jaime quito primero las
                  fotos ("las anadire cuando las tenga") y despues el hueco: "sin
                  placeholders tampoco".

                  Tiene sentido: un marcador de posicion en una pagina publica no es
                  neutro. Ocupaba un tercio del ancho del panel para no decir nada, y
                  cuatro paneles con el mismo mint y un icono distinto se leen como
                  una plantilla sin terminar, que es peor que no tener imagen.

                  El texto pasa a ocupar el panel entero. Se van con el hueco:
                  `sectorPhotos` (el `import.meta.glob` de la carpeta), `photoFor`,
                  el campo `image` del tipo `Sector` con el `alt` y el punto focal de
                  cada uno, y las reglas `.sector-art` de `index.css`.

                  PARA VOLVER: `git show a0c12c6^ -- src/components/ExamplesSection.tsx
                  src/index.css` tiene la version con foto y motivo, y el commit
                  anterior a ese, las tres imagenes. No se conserva nada a medias a
                  proposito: codigo que no pinta nada envejece mal y el historial lo
                  guarda mejor.
                */}
                <div className="p-5 sm:p-6 md:p-8">
                    <h3 className="mb-3 text-title leading-tight text-foreground sm:mb-4 md:text-headline">
                      {sector.title}
                    </h3>

                    <p className="mb-4 max-w-reading text-body text-text-secondary sm:mb-6 md:text-body-lg">
                      {sector.scenario}
                    </p>

                    <ul className="space-y-[10px] border-t border-border pt-4 sm:space-y-3 sm:pt-5">
                      {sector.benefits.map((benefit) => (
                        <li
                          key={benefit}
                          className="flex items-start gap-3 text-caption-lg leading-relaxed text-text-secondary md:text-body"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-emerald-400"
                          />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                </div>
              </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal id="qualify" delay={100} className="glass-card mt-8 p-5 sm:mt-10 sm:p-6 md:mt-16 md:p-12">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div>
              <p className="label-caps mb-4">{t.qualifyEyebrow}</p>
              <h3 className="mb-4 text-headline leading-tight text-foreground">
                {t.qualifyTitle}
              </h3>
              <p className="text-body text-text-secondary">{t.qualifyBody}</p>
            </div>

            <ul className="stagger-children grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:pt-2">
              {requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <CircleCheck aria-hidden="true" size={16} className="mt-1 shrink-0 text-accent-ink" />
                  <span className="text-body leading-snug text-foreground">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>

          {/*
            CTA de seccion - 26/08/2026. La pagina solo tenia tres llamadas a la
            accion (hero, tesis y formulario final), y entre la tesis y el pie
            hay unas diez pantallas de scroll. Este es el punto de mayor
            intencion de toda la pagina: alguien que acaba de leer el caso de su
            propio sector y de comprobar en la lista de al lado que cualifica. Si
            en ese momento hay que seguir bajando para actuar, se pierde.
          */}
          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-measure text-caption text-text-tertiary">{t.qualifyNote}</p>
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "qualify", label: "Ver si encajo" })}
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
