import { useState } from "react";
import { ArrowRight, BedDouble, Dumbbell, Shirt, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { cn } from "../lib/cn";
import { useTablistKeys } from "../lib/useTablistKeys";
import { track } from "../lib/analytics";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * "En la practica": cuatro sectores con selector.
 *
 * REVISION DEL 14/11/2026 (aprobada por Jaime). Eran seis fichas de tres parrafos a
 * la vez, la seccion mas alta de la pagina (1.943px en escritorio). Ahora se ve un
 * sector cada vez, con su ficha y una ronda de ejemplo al lado.
 *
 * Salen dos sectores. "Fintech de consumo" queda fuera del cliente objetivo, y la
 * propia ficha avisaba de que es actividad regulada. "Entretenimiento y eventos" no
 * tiene ingresos recurrentes, que es lo que decide el tamano de una emision.
 *
 * Las rondas de ejemplo son ilustrativas y lo dicen. Sus importes caen dentro de la
 * emision tipica que se comunica (2,5 a 7,5 M EUR).
 *
 * Sigue sin fotos ni huecos de foto: Jaime las retiro el 31/08/2026 ("sin
 * placeholders tampoco"). Ver `src/assets/sectores/README.md` para volver.
 *
 * El intercambio de paneles reutiliza `.swap-stack` / `.swap-panel` de `index.css`,
 * que nacieron para esta misma seccion.
 */

const SECTORS: { id: string; icon: LucideIcon }[] = [
  { id: "wellness", icon: Dumbbell },
  { id: "restauracion", icon: UtensilsCrossed },
  { id: "hoteles", icon: BedDouble },
  { id: "moda", icon: Shirt },
];

type SectorCopy = {
  short: string;
  industry: string;
  profile: string;
  funds: string;
  community: string;
  example: { who: string; amount: string; investors: string; use: string };
};

const sectorsCopy: Localized<SectorCopy[]> = {
  es: [
    {
      short: "Deporte y bienestar",
      industry: "Fitness, wellness y centros deportivos",
      profile: "Cadenas de gimnasios, estudios y centros de pádel o pickleball con socios recurrentes.",
      funds: "Nuevos centros, instalaciones y equipamiento.",
      community: "Participación en los resultados y condiciones preferentes.",
      example: { who: "Cadena de 8 centros", amount: "4 M€", investors: "1.300 socios", use: "3 centros nuevos" },
    },
    {
      short: "Restauración y franquicias",
      industry: "Restauración y franquicias",
      profile: "Grupos de restauración y enseñas de franquicia con clientes que repiten.",
      funds: "Locales propios, reformas y nuevas aperturas.",
      community: "Participación en el negocio y experiencias en los locales.",
      example: { who: "Enseña con 25 locales", amount: "3 M€", investors: "1.000 clientes", use: "2 locales propios" },
    },
    {
      short: "Hoteles",
      industry: "Hoteles",
      profile: "Cadenas y operadores hoteleros con huéspedes que repiten.",
      funds: "Nuevas aperturas, reformas y compra de inmuebles.",
      community: "Participación en el negocio y condiciones preferentes en las estancias.",
      example: { who: "Grupo de 5 hoteles", amount: "6 M€", investors: "1.500 huéspedes", use: "Una apertura y una reforma" },
    },
    {
      short: "Moda y retail",
      industry: "Moda y retail de marca",
      profile: "Marcas con identidad propia y comunidad activa en canal directo.",
      funds: "Tiendas propias, inventario y expansión internacional.",
      community: "Participación en el negocio y acceso anticipado a colecciones.",
      example: { who: "Marca con 60.000 clientes activos", amount: "2,5 M€", investors: "1.000 clientes", use: "Tiendas propias" },
    },
  ],
  en: [
    {
      short: "Sport and wellness",
      industry: "Fitness, wellness and sports centres",
      profile: "Gym chains, studios and padel or pickleball centres with recurring members.",
      funds: "New centres, facilities and equipment.",
      community: "A share in results and preferential terms.",
      example: { who: "Chain of 8 centres", amount: "€4M", investors: "1,300 members", use: "3 new centres" },
    },
    {
      short: "Restaurants and franchises",
      industry: "Restaurants and franchises",
      profile: "Restaurant groups and franchise brands with customers who come back.",
      funds: "Company-owned venues, refurbishments and new openings.",
      community: "A stake in the business and experiences at the venues.",
      example: { who: "Brand with 25 venues", amount: "€3M", investors: "1,000 customers", use: "2 company-owned venues" },
    },
    {
      short: "Hotels",
      industry: "Hotels",
      profile: "Hotel chains and operators with guests who come back.",
      funds: "New openings, refurbishments and property purchases.",
      community: "A stake in the business and preferential terms on stays.",
      example: { who: "Group of 5 hotels", amount: "€6M", investors: "1,500 guests", use: "One opening and one refurbishment" },
    },
    {
      short: "Fashion and retail",
      industry: "Fashion and branded retail",
      profile: "Brands with their own identity and an active direct-to-consumer community.",
      funds: "Own stores, inventory and international expansion.",
      community: "A stake in the business and early access to collections.",
      example: { who: "Brand with 60,000 active customers", amount: "€2.5M", investors: "1,000 customers", use: "Own stores" },
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "En la práctica",
    titleA: "Misma infraestructura,",
    titleB: "una solución adaptada a cada sector.",
    profile: "Perfil",
    funds: "La ronda financia",
    community: "La comunidad recibe",
    exampleLabel: "Ronda de ejemplo",
    exampleNote: "Ejemplo ilustrativo",
    investors: "Inversores",
    use: "Destino",
    more: "¿Tu sector no aparece? Lo que cuenta es la relación con tus clientes.",
    cta: "Hablar de mi caso",
    listLabel: "Sectores",
  },
  en: {
    eyebrow: "In practice",
    titleA: "Same infrastructure,",
    titleB: "a solution adapted to each sector.",
    profile: "Profile",
    funds: "The round funds",
    community: "The community receives",
    exampleLabel: "Example round",
    exampleNote: "Illustrative example",
    investors: "Investors",
    use: "Use of funds",
    more: "Is your sector not listed? What counts is your relationship with your customers.",
    cta: "Talk about my case",
    listLabel: "Sectors",
  },
};

export function ExamplesSection() {
  const t = useCopy(COPY);
  const copy = useCopy(sectorsCopy);
  const sectors = SECTORS.map((sector, index) => ({ ...sector, ...copy[index] }));
  const [active, setActive] = useState(0);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    track("sector_select", { sector: SECTORS[index].id });
  };

  const { register, onKeyDown } = useTablistKeys(sectors.length, active, select);

  return (
    <section
      id="examples"
      aria-labelledby="examples-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-8 max-w-[800px] sm:mb-12">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="examples-title"
            delay={60}
            className="text-rise display-section text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[56px]"
          >
            {t.titleA}{" "}
            <span className="text-text-tertiary">{t.titleB}</span>
          </Reveal>
        </div>

        <Reveal>
          <div
            role="tablist"
            aria-label={t.listLabel}
            onKeyDown={onKeyDown}
            className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
          >
            {sectors.map((sector, index) => {
              const on = index === active;
              const Icon = sector.icon;
              return (
                <button
                  key={sector.id}
                  ref={register(index)}
                  type="button"
                  role="tab"
                  id={`sector-${sector.id}-tab`}
                  aria-selected={on}
                  aria-controls={`sector-${sector.id}-panel`}
                  tabIndex={on ? 0 : -1}
                  onClick={(event) => {
                    select(index);
                    /* En telefono la fila se desliza: la pestana elegida se queda a la vista. */
                    event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
                  }}
                  className={cn(
                    "inline-flex min-h-touch shrink-0 items-center gap-2 rounded-md px-4 text-label transition-colors duration-200",
                    on
                      ? "bg-accent-soft text-on-accent-soft"
                      : "bg-card-hover text-text-secondary hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden="true" size={16} />
                  {sector.short}
                </button>
              );
            })}
          </div>

          <div className="swap-stack">
            {sectors.map((sector, index) => {
              const rows = [
                { label: t.profile, text: sector.profile },
                { label: t.funds, text: sector.funds },
                { label: t.community, text: sector.community },
              ];
              return (
                <div
                  key={sector.id}
                  role="tabpanel"
                  id={`sector-${sector.id}-panel`}
                  aria-labelledby={`sector-${sector.id}-tab`}
                  data-active={index === active ? "true" : "false"}
                  className="swap-panel glass-card grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12"
                >
                  <div>
                    <h3 className="mb-4 text-title leading-tight text-foreground sm:text-headline">
                      {sector.industry}
                    </h3>
                    <dl className="divide-y divide-border border-t border-border">
                      {rows.map(({ label, text }) => (
                        <div key={label} className="grid gap-1 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
                          <dt className="label-caps pt-[3px]">{label}</dt>
                          <dd className="text-body text-text-secondary">{text}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="flex flex-col rounded-md bg-accent-soft p-5 text-on-accent-soft sm:p-6">
                    <p className="text-micro uppercase">{t.exampleLabel}</p>
                    <p className="mt-1 text-caption-lg">{sector.example.who}</p>
                    <p className="mt-4 text-[44px] font-medium leading-none tracking-[-0.03em] tabular sm:text-[56px]">
                      {sector.example.amount}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-current/20 pt-4">
                      <div>
                        <dt className="text-micro uppercase">{t.investors}</dt>
                        <dd className="mt-1 text-body font-medium">{sector.example.investors}</dd>
                      </div>
                      <div>
                        <dt className="text-micro uppercase">{t.use}</dt>
                        <dd className="mt-1 text-body font-medium">{sector.example.use}</dd>
                      </div>
                    </dl>
                    <p className="mt-auto pt-4 text-caption opacity-80">{t.exampleNote}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <Reveal
          delay={100}
          className="mt-8 flex flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-body text-text-secondary">{t.more}</p>
          <ButtonLink
            href="#contact"
            className="shrink-0"
            onClick={() => track("cta_click", { location: "examples", label: "Hablar de mi caso" })}
          >
            {t.cta}
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
