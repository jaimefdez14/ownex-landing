import { useRef, useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  Dumbbell,
  Shirt,
  Sparkles,
  Trophy,
  UtensilsCrossed,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { cn } from "../lib/cn";
import { track } from "../lib/analytics";

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
 * lado y el caso completo al otro, uno cada vez. Caben siete casos en el
 * espacio en el que antes cabian tres, cada visitante va directo al suyo, y el
 * ultimo ("Y muchos mas") existe para que nadie se descarte: dice explicitamente
 * que la logica no depende del sector.
 *
 * DOS DECISIONES QUE NO SON DE ESTILO:
 *
 * 1. Los siete paneles estan SIEMPRE en el DOM. No se monta y desmonta el
 *    seleccionado. Es el mismo criterio que el acordeon de preguntas
 *    (`ui/Accordion.tsx`): el texto de los siete sectores es contenido
 *    indexable y tiene que estar en el HTML prerenderizado, no aparecer solo
 *    despues de un clic. Y sin JavaScript las fichas no pulsan, asi que los
 *    siete casos se sirven apilados y legibles; el plegado vive en CSS bajo
 *    `html.js` (ver `.sector-panel` en `index.css`).
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

const sectors: Sector[] = [
  {
    id: "moda",
    icon: Shirt,
    industry: "Moda y streetwear",
    title: "Tus clientes llevan tu marca. Que también la posean.",
    scenario:
      "Una marca de moda con comunidad leal abre una ronda para sus mejores clientes. Los accionistas acceden a drops exclusivos, votan en decisiones de diseño y participan en la revalorización del negocio.",
    benefits: [
      "Acceso a colecciones antes que nadie",
      "Voto en decisiones de producto",
      "Participación en la revalorización de la marca",
    ],
  },
  {
    id: "restauracion",
    icon: UtensilsCrossed,
    industry: "Restauración y hostelería",
    title: "Tus habituales financian tu expansión.",
    scenario:
      "Un grupo de restauración permite a sus clientes más fieles invertir en la apertura de nuevas localizaciones. El resultado: accionistas que traen reservas, no solo likes.",
    benefits: [
      "Capital para nuevas ubicaciones sin depender solo de bancos",
      "Accionistas que refieren porque participan en la revalorización",
      "Acceso a experiencias exclusivas en local",
    ],
  },
  {
    id: "wellness",
    icon: Dumbbell,
    industry: "Gimnasios y centros wellness",
    title: "Tu comunidad entrena contigo. Y crece contigo.",
    scenario:
      "Una cadena de gimnasios, un box o un centro de yoga ofrece a sus socios la posibilidad de ser accionistas. Participan en las decisiones sobre nuevos servicios, acceden a condiciones preferentes y participan en los resultados del negocio.",
    benefits: [
      "Retención por propiedad, no por descuento",
      "Co-diseño de nuevos servicios con quienes los usan",
      "Si el centro crece, el socio accionista se beneficia",
    ],
  },
  {
    id: "bebidas",
    icon: Wine,
    industry: "Bebidas y alimentación",
    title: "Quien ya te compra cada mes puede financiar tu próxima planta.",
    scenario:
      "Un vermut, una cerveza artesana o un café de especialidad abre su capital a los clientes que ya repiten. El capital financia producción, distribución o una nueva línea, y los accionistas se convierten en el canal de venta más barato que tienes.",
    benefits: [
      "Capital para producción sin ceder el control a un fondo",
      "Ediciones y lotes reservados para accionistas",
      "Prescriptores con un motivo económico para recomendarte",
    ],
  },
  {
    id: "belleza",
    icon: Sparkles,
    industry: "Belleza y cuidado personal",
    title: "Tu clientela repite cada mes. Dale algo más que una tarjeta de puntos.",
    scenario:
      "Una marca de cosmética, una cadena de barberías o una clínica estética convierte su base recurrente en accionistas. La relación deja de medirse en visitas y pasa a medirse en propiedad.",
    benefits: [
      "Un vínculo que no se rompe con la oferta del competidor",
      "Acceso anticipado a lanzamientos y tratamientos",
      "Participación en la revalorización del negocio",
    ],
  },
  {
    id: "clubes",
    icon: Trophy,
    industry: "Clubes y entidades deportivas",
    title: "Tus socios ya se sienten dueños. Que lo sean de verdad.",
    scenario:
      "Un club deportivo o una entidad con masa social abre una emisión a sus socios. La pertenencia que ya existe pasa a tener forma jurídica, con un registro digital de participaciones y derechos económicos reales.",
    benefits: [
      "Capital de la propia masa social, sin deuda bancaria",
      "Voto en las decisiones que el club someta a junta",
      "Pertenencia con respaldo legal, no solo con carné",
    ],
  },
  {
    id: "otros",
    icon: CircleCheck,
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
];

const requirements = [
  "Marca de consumo con ingresos recurrentes",
  "Operador que planea nuevas ubicaciones o líneas de producto",
  "Fundador que quiere capital de su comunidad, no solo de VCs",
  "Cualquier sector con clientes que vuelven: no hay lista cerrada",
];

export function ExamplesSection() {
  const [activeId, setActiveId] = useState(sectors[0].id);
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (sector: Sector) => {
    setActiveId(sector.id);
    track("sector_select", { sector: sector.industry });
  };

  /*
    Navegacion por teclado del patron de pestañas (APG). Acepta los dos ejes a
    proposito y no solo el vertical: la lista es una columna desde `lg` pero por
    debajo son pastillas que fluyen en horizontal, asi que la flecha que espera
    quien mira la pantalla depende del ancho. Home y End saltan a los extremos.

    El foco se mueve con `tabIndex` rotatorio (solo la ficha activa es
    tabulable), que es lo que evita que un `tablist` de siete elementos obligue a
    dar siete tabuladores para cruzarlo.
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
        <div className="mx-auto mb-14 max-w-[800px] text-center">
          <Reveal as="p" className="rule-grow rule-grow-center label-caps mb-5">
            En la práctica
          </Reveal>
          <h2
            id="examples-title"
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            <Reveal as="span" delay={80} className="block text-rise">
              Elige tu sector.
            </Reveal>
            <Reveal as="span" delay={170} className="block text-rise text-text-tertiary">
              La lógica no cambia.
            </Reveal>
          </h2>
          <Reveal as="p" delay={240} className="text-body-lg text-text-secondary">
            Si tus clientes ya son leales, dales un motivo financiero para quedarse.
          </Reveal>
        </div>

        <Reveal className="grid gap-4 lg:grid-cols-[minmax(0,270px)_minmax(0,1fr)] lg:items-start lg:gap-8">
          <div
            role="tablist"
            aria-label="Sectores"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap"
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
                    "flex min-h-touch items-center gap-3 rounded-full px-4 py-2 text-left text-caption transition-colors lg:w-full lg:rounded-lg lg:px-4 lg:py-3",
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

          <div className="sector-stack">
            {sectors.map((sector) => (
              <div
                key={sector.id}
                role="tabpanel"
                id={`sector-${sector.id}-panel`}
                aria-labelledby={`sector-${sector.id}-tab`}
                data-active={sector.id === activeId ? "true" : "false"}
                className="sector-panel glass-card p-6 md:p-8"
              >
                <h3 className="mb-4 text-title leading-tight text-foreground md:text-headline">
                  {sector.title}
                </h3>

                <p className="mb-6 max-w-reading text-body text-text-secondary md:text-body-lg">
                  {sector.scenario}
                </p>

                <ul className="space-y-3 border-t border-border pt-5">
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
            ))}
          </div>
        </Reveal>

        <Reveal id="qualify" delay={100} className="glass-card mt-10 p-6 md:mt-16 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div>
              <p className="label-caps mb-4">Quién cualifica</p>
              <h3 className="mb-4 text-headline leading-tight text-foreground">
                ¿Es el sistema Ownex para mi marca?
              </h3>
              <p className="text-body text-text-secondary">
                Tienes una marca de consumo con clientes que vuelven y planeas levantar capital o
                expandir.
              </p>
            </div>

            <ul className="stagger-children grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:pt-2">
              {requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <CircleCheck aria-hidden="true" size={16} className="mt-1 shrink-0 text-emerald-400" />
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
            <p className="max-w-measure text-caption text-text-tertiary">
              Diseñado para marcas con comunidades amplias y bases de clientes fieles y recurrentes.
            </p>
            <ButtonLink
              href="#contact"
              className="shrink-0"
              onClick={() => track("cta_click", { location: "qualify", label: "Ver si encajo" })}
            >
              Ver si mi marca encaja
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
