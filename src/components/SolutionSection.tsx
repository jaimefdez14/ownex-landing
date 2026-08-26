import { Building2, Send, Users } from "lucide-react";
import { Reveal } from "./ui/Reveal";

const blocks = [
  {
    icon: Building2,
    title: "Estructuración",
    desc: "Montamos la estructura legal y financiera para que tu cap table se mantenga limpio y tu próxima ronda no se complique.",
  },
  {
    icon: Send,
    title: "Emisión",
    desc: "Ejecutamos la ronda dirigida a tu comunidad, con KYC/AML integrado y sin que necesites licencia propia.",
  },
  {
    icon: Users,
    title: "Activación",
    desc: "Tus accionistas gestionan su posición, reciben actualizaciones y activan beneficios desde un hub integrado en tu web.",
  },
];

export function SolutionSection() {
  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-14 max-w-[800px]">
          <Reveal as="p" className="label-caps mb-5">
            Qué es Ownex
          </Reveal>
          <Reveal
            as="h2"
            id="solution-title"
            delay={60}
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            Todo lo que necesitas para que tus clientes inviertan en tu marca.
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Plataforma B2B end to end para la co-propiedad: estructuración legal, emisión de acciones
            fraccionadas y gestión continua de accionistas. Tú te centras en la marca. Nosotros nos
            encargamos del resto.
          </Reveal>
        </div>

        <ul className="grid gap-3 md:grid-cols-3">
          {blocks.map(({ icon: Icon, title, desc }, index) => (
            <Reveal as="li" key={title} delay={index * 100} className="glass-card glass-card-hover p-5 md:p-8">
              {/*
                En movil el icono va EN LINEA con el titulo; desde `md` vuelve a
                ir encima. Apilados, icono y titulo se comian unos 50px por
                tarjeta en relleno y hueco vertical sin decir nada mas: son tres
                tarjetas, y en una pantalla de movil eso es media pantalla de
                scroll regalada. En la columna estrecha de `md` no cabe la
                pareja en una linea, asi que ahi se apila como siempre.
              */}
              <div className="mb-3 flex items-center gap-3 md:mb-6 md:block">
                <span className="icon-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10 md:mb-6">
                  <Icon aria-hidden="true" size={18} className="text-emerald-400" />
                </span>
                <h3 className="text-title leading-tight text-foreground md:mb-3">{title}</h3>
              </div>
              <p className="text-body text-text-secondary">{desc}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
