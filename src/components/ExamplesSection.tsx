import { CircleCheck, Dumbbell, Shirt, UtensilsCrossed } from "lucide-react";
import { Reveal } from "./ui/Reveal";

const examples = [
  {
    icon: Shirt,
    industry: "Moda y streetwear",
    title: "Tus clientes llevan tu marca. Que también la posean.",
    scenario:
      "Una marca de moda con comunidad leal abre una ronda de equity para sus mejores clientes. Los accionistas acceden a drops exclusivos, votan en decisiones de diseño, y participan en la revalorización del negocio.",
    benefits: [
      "Acceso a colecciones antes que nadie",
      "Voto en decisiones de producto",
      "Participación en la revalorización de la marca",
    ],
  },
  {
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
    icon: Dumbbell,
    industry: "Gimnasios y deporte",
    title: "Tu comunidad entrena contigo. Y crece contigo.",
    scenario:
      "Una cadena de gimnasios ofrece a sus miembros la posibilidad de ser accionistas. Participan en decisiones sobre nuevos servicios, acceden a condiciones preferenciales, y participan en los resultados del negocio.",
    benefits: [
      "Retención por propiedad, no por descuento",
      "Co-diseño de nuevos servicios con quienes los usan",
      "Si el gimnasio crece, el miembro accionista se beneficia",
    ],
  },
];

const requirements = [
  "Marca de consumo con ingresos recurrentes",
  "Operador que planea nuevas ubicaciones o líneas de producto",
  "Fundador que quiere capital de su comunidad, no solo de VCs",
  "Sectores: moda, hostelería, deporte, fitness, lifestyle o retail",
];

export function ExamplesSection() {
  return (
    <section
      id="examples"
      aria-labelledby="examples-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mx-auto mb-14 max-w-[800px] text-center">
          <Reveal as="p" className="label-caps mb-5">
            En la práctica
          </Reveal>
          <h2
            id="examples-title"
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            <Reveal as="span" delay={80} className="block">
              Tres sectores.
            </Reveal>
            <Reveal as="span" delay={170} className="block text-text-tertiary">
              La misma lógica.
            </Reveal>
          </h2>
          <Reveal as="p" delay={240} className="text-body-lg text-text-secondary">
            Si tus clientes ya son leales, dales un motivo financiero para quedarse.
          </Reveal>
        </div>

        {/*
          Las tres tarjetas comparten alto por fila gracias al grid exterior, pero
          eso no alineaba la linea del `border-t` entre `scenario` y la lista de
          beneficios: cada texto tiene su propia longitud, asi que el numero de
          lineas que ocupan el titulo y el parrafo variaba de tarjeta a tarjeta, y
          la linea aparecia a alturas distintas aunque las tres tarjetas midieran
          lo mismo por fuera.

          En vez de adivinar una altura minima fija en pixeles (fragil: cualquier
          cambio de copy la rompe otra vez), cada `<li>` pasa a ser un
          `grid-template-rows: subgrid` desde `md`, con `row-span-5` sobre las
          cinco filas que define el `<ul>` (icono, sector, titulo, parrafo,
          beneficios). Con subgrid cada fila comparte pista con la misma fila de
          las otras dos tarjetas, y esa pista se ajusta siempre a la mas alta de
          las tres: el titulo mas corto o el parrafo mas breve quedan con mas
          aire, pero la linea que separa el parrafo de los beneficios cae exacto a
          la misma altura en las tres, sea cual sea el largo real del texto.
        */}
        <ul className="mb-10 grid gap-3 md:grid-cols-3 md:grid-rows-[auto_auto_auto_1fr_auto] md:gap-y-0">
          {examples.map(({ icon: Icon, industry, title, scenario, benefits }, index) => (
            <Reveal
              as="li"
              key={industry}
              delay={index * 100}
              className="glass-card glass-card-hover flex flex-col p-5 md:grid md:row-span-5 md:p-7 md:[grid-template-rows:subgrid]"
            >
              {/*
                El margen bajo el icono baja de 24 a 12px en movil. Aqui no se
                puede meter el icono en la misma linea que el chip de sector
                (como sí se hace en `SolutionSection`): desde `md` estas tres
                tarjetas se alinean entre sí con `subgrid` sobre cinco filas, y
                fusionar dos de ellas descuadraria las tres.
              */}
              <span className="icon-badge mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent-soft md:mb-6">
                <Icon aria-hidden="true" size={18} className="text-emerald-400" />
              </span>

              <span className="mb-4 inline-block self-start rounded-full bg-accent-soft px-3 py-1 text-micro font-medium uppercase text-on-accent-soft">
                {industry}
              </span>

              <h3 className="mb-3 text-title leading-tight text-foreground">{title}</h3>

              <p className="mb-5 flex-1 text-body text-text-secondary md:mb-6">{scenario}</p>

              <ul className="stagger-children space-y-3 border-t border-border pt-4 md:pt-5">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-caption-lg leading-relaxed text-text-secondary md:text-caption">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </ul>

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

          <p className="mt-10 max-w-measure border-t border-border pt-6 text-caption text-text-tertiary">
            Diseñado para marcas con comunidades amplias y bases de clientes fieles y recurrentes.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
