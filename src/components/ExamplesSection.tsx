import {
  ArrowRight,
  BedDouble,
  CreditCard,
  Dumbbell,
  Shirt,
  Ticket,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { ButtonLink } from "./ui/Button";
import { track } from "../lib/analytics";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * Casos de uso por sector.
 *
 * REHECHO EL 30/10/2026, A PETICION DE JAIME: de pestañas a tarjetas, y de
 * eslogan a ficha.
 *
 * Eran cuatro fichas seleccionables con el caso completo al lado y un bloque
 * "Quien cualifica". Jaime pidio solo tarjetas descriptivas y mas sectores. La
 * primera version de tarjetas llevaba un titular de eslogan por sector ("Tu
 * publico ya hace cola") y un parrafo: no le convencio. Las emisiones ahora son
 * de mas tamaño (rondas de varios millones, operadores con varios locales o
 * sedes), y el tono de eslogan no es el de quien levanta ese capital.
 *
 * Cada tarjeta es una ficha con tres datos, en el mismo orden y con las mismas
 * etiquetas: que tipo de operador es, que financia la ronda y que recibe la
 * comunidad. Asi el visitante compara sectores sin leer seis parrafos distintos,
 * y el texto habla de lo que se financia (aperturas, recintos, producto), no de
 * emociones.
 *
 * SEIS SECTORES (hoteles y restauracion van separados; "Clubes y competicion"
 * se quito a peticion de Jaime, y los centros de padel van en fitness). Fuera "Alimentacion y bebidas" (es consumo generico, no un
 * sector con activo propio que financiar) y "Belleza", que ya cabe en wellness.
 * Fintech de consumo va la ultima porque es actividad regulada y su encaje se
 * mira caso a caso; la tarjeta lo dice.
 */

type Sector = {
  id: string;
  icon: LucideIcon;
  industry: string;
  profile: string;
  funds: string;
  community: string;
  note?: string;
};

/* Identificador e icono: no son copy. El `id` va en la clave de la tarjeta. */
const SECTORS: { id: string; icon: LucideIcon }[] = [
  { id: "wellness", icon: Dumbbell },
  { id: "restauracion", icon: UtensilsCrossed },
  { id: "hoteles", icon: BedDouble },
  { id: "moda", icon: Shirt },
  { id: "entretenimiento", icon: Ticket },
  { id: "fintech", icon: CreditCard },
];

type SectorCopy = Omit<Sector, "id" | "icon">;

const sectorsCopy: Localized<SectorCopy[]> = {
  es: [
    {
      industry: "Fitness, wellness y centros deportivos",
      profile: "Cadenas de gimnasios, boxes, estudios, centros de pádel o pickleball y espacios de bienestar o estética con socios recurrentes.",
      funds: "Nuevos centros, instalaciones, equipamiento y ampliación de servicios.",
      community: "Participación en los resultados, condiciones preferentes y voz en los nuevos servicios.",
    },
    {
      industry: "Restauración y franquicias",
      profile: "Grupos y cadenas franquiciadas con varios locales y clientes que repiten.",
      funds: "Nuevas aperturas, reformas y compra de locales.",
      community: "Participación en el negocio y experiencias exclusivas en los locales.",
    },
    {
      industry: "Hoteles",
      profile: "Cadenas y operadores hoteleros con huéspedes que repiten.",
      funds: "Nuevas aperturas, reformas y compra de inmuebles.",
      community: "Participación en el negocio y condiciones preferentes en las estancias.",
    },
    {
      industry: "Moda y retail de marca",
      profile: "Marcas con identidad propia y comunidad activa en canal directo.",
      funds: "Inventario, nuevas colecciones, tiendas propias y expansión internacional.",
      community: "Participación en el negocio, acceso anticipado a colecciones y voz en decisiones de producto.",
    },
    {
      industry: "Entretenimiento y eventos",
      profile: "Salas, festivales, productoras y estudios con una audiencia fiel.",
      funds: "Producciones, nuevos recintos y desarrollo de contenido.",
      community: "Entradas anticipadas, contenido exclusivo y participación en lo que genere el proyecto.",
    },
    {
      industry: "Fintech de consumo",
      profile: "Apps de pagos, ahorro o neobancos con usuarios activos cada semana.",
      funds: "Producto, crecimiento de usuarios y expansión a nuevos mercados.",
      community: "Participación en la compañía y relación directa con quien ya la usa.",
      note: "Actividad regulada. El encaje se estudia caso a caso.",
    },
  ],
  en: [
    {
      industry: "Fitness, wellness and sports centres",
      profile: "Gym chains, boxes, studios, padel or pickleball centres and wellness or aesthetics spaces with recurring members.",
      funds: "New centres, facilities, equipment and wider services.",
      community: "A share in results, preferential terms and a voice in new services.",
    },
    {
      industry: "Restaurants and franchises",
      profile: "Groups and franchised chains with several venues and customers who come back.",
      funds: "New openings, refurbishments and property purchases.",
      community: "A stake in the business and exclusive experiences at the venues.",
    },
    {
      industry: "Hotels",
      profile: "Hotel chains and operators with guests who come back.",
      funds: "New openings, refurbishments and property purchases.",
      community: "A stake in the business and preferential terms on stays.",
    },
    {
      industry: "Fashion and branded retail",
      profile: "Brands with their own identity and an active direct-to-consumer community.",
      funds: "Inventory, new collections, own stores and international expansion.",
      community: "A stake in the business, early access to collections and a voice in product decisions.",
    },
    {
      industry: "Entertainment and events",
      profile: "Venues, festivals, production companies and studios with a loyal audience.",
      funds: "Productions, new venues and content development.",
      community: "Early tickets, exclusive content and a share in what the project earns.",
    },
    {
      industry: "Consumer fintech",
      profile: "Payments, savings or neobank apps with users active every week.",
      funds: "Product, user growth and expansion into new markets.",
      community: "A stake in the company and a direct relationship with the people who already use it.",
      note: "Regulated activity. Fit is assessed case by case.",
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "En la práctica",
    titleA: "Misma infraestructura,",
    titleB: "una solución adaptada a cada sector.",
    lede: "Para operadores con comunidad propia y un plan de crecimiento que requiere capital relevante.",
    profile: "Perfil",
    funds: "La ronda financia",
    community: "La comunidad recibe",
    more: "¿Tu sector no aparece? Ownex no depende del sector, depende de la relación con tus clientes.",
    cta: "Hablar de mi caso",
  },
  en: {
    eyebrow: "In practice",
    titleA: "Same infrastructure,",
    titleB: "a solution adapted to each sector.",
    lede: "For operators with their own community and a growth plan that calls for significant capital.",
    profile: "Profile",
    funds: "The round funds",
    community: "The community receives",
    more: "Is your sector not listed? Ownex does not depend on the sector, it depends on your relationship with your customers.",
    cta: "Talk about my case",
  },
};

export function ExamplesSection() {
  const t = useCopy(COPY);
  const copy = useCopy(sectorsCopy);
  const sectors: Sector[] = SECTORS.map((sector, index) => ({ ...sector, ...copy[index] }));

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

        <Reveal>
          <ul className="stagger-children grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sectors.map((sector) => {
              const Icon = sector.icon;
              const rows = [
                { label: t.profile, text: sector.profile },
                { label: t.funds, text: sector.funds },
                { label: t.community, text: sector.community },
              ];
              return (
                <li key={sector.id} className="glass-card flex flex-col p-5 sm:p-6">
                  <h3 className="mb-5 flex items-center gap-3 text-title leading-tight text-foreground">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-on-accent-soft">
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    {sector.industry}
                  </h3>

                  <dl className="divide-y divide-border border-t border-border">
                    {rows.map(({ label, text }) => (
                      <div key={label} className="py-3">
                        <dt className="label-caps mb-1">{label}</dt>
                        <dd className="text-caption-lg leading-snug text-text-secondary md:text-body">{text}</dd>
                      </div>
                    ))}
                  </dl>

                  {sector.note && (
                    <p className="mt-auto border-t border-border pt-3 text-caption text-text-tertiary">
                      {sector.note}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        {/*
          CTA de seccion - 26/08/2026. La pagina tiene pocas llamadas a la accion y
          entre la tesis y el pie hay unas diez pantallas de scroll. Aqui el
          visitante acaba de ver su sector: si en ese momento hay que seguir
          bajando para actuar, se pierde.
        */}
        <Reveal
          delay={100}
          className="mx-auto mt-8 flex max-w-[800px] flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between"
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
