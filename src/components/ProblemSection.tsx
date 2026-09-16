import { Reveal } from "./ui/Reveal";
import { useCopy } from "../i18n/locale";

/*
  LOS PUNTOS VAN EMPAREJADOS, y en ingles tambien: cada linea de "Hoy" tiene su
  contraria en la misma posicion de "Con Ownex". Es lo unico que sostiene la
  comparacion cuando las dos columnas se apilan en telefono (ver el comentario de la
  maqueta, mas abajo), asi que el orden no se toca al traducir.
*/
const COPY = {
  es: {
    eyebrow: "El desajuste",
    titleA: "Tus clientes crean valor.",
    titleB: "Pero nunca lo capturan.",
    p1: "Compran tus productos. Te recomiendan a sus amigos. Defienden tu marca en redes. Te hacen crecer. Y cuando levantas capital, quedan completamente fuera.",
    p2: "Mientras tanto, tus procesos de financiación son complejos y te hacen perder control.",
    close: "¿Y si tus mejores clientes también pudieran ser tus accionistas?",
    todayLabel: "Hoy",
    ownexLabel: "Con Ownex",
    today: [
      "Tus clientes impulsan tu crecimiento sin poder ser parte de él",
      "Tus rondas de financiación son complejas y diluyen tu control",
      "Te cuesta retener clientes en un mercado cada vez más competitivo",
      "Gastas demasiado en marketing para mantener el crecimiento de tu marca",
    ],
    withOwnex: [
      "Tus clientes se convierten en accionistas y son parte del crecimiento",
      "El capital viene de tu comunidad, con cap table limpio y control preservado",
      "Clientes fidelizados y que prefieren tu marca frente a competidores",
      "Comunidad con sentimiento de pertenencia que hace crecer tu marca contigo",
    ],
  },
  en: {
    eyebrow: "The mismatch",
    titleA: "Your customers create value.",
    titleB: "But they never capture it.",
    p1: "They buy your products. They recommend you to their friends. They defend your brand on social media. They make you grow. And when you raise capital, they are left out entirely.",
    p2: "Meanwhile, your funding processes are complex and cost you control.",
    close: "What if your best customers could also be your shareholders?",
    todayLabel: "Today",
    ownexLabel: "With Ownex",
    today: [
      "Your customers drive your growth with no way to share in it",
      "Your funding rounds are complex and dilute your control",
      "Retaining customers is harder in an ever more competitive market",
      "You spend too much on marketing to keep your brand growing",
    ],
    withOwnex: [
      "Your customers become shareholders and share in the growth",
      "Capital comes from your community, with a clean cap table and control preserved",
      "Loyal customers who choose your brand over the competition",
      "A community with a sense of belonging that grows your brand with you",
    ],
  },
};

export function ProblemSection() {
  const t = useCopy(COPY);
  const { today, withOwnex } = t;

  return (
    <section
      id="problem"
      aria-labelledby="problem-title"
      className="section-padding spotlight bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-6">
              {t.eyebrow}
            </Reveal>

            <Reveal as="h2" id="problem-title" delay={60} className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-[52px] lg:text-[56px]">
              {t.titleA}{" "}
              <span className="text-text-tertiary">{t.titleB}</span>
            </Reveal>

            <Reveal as="p" delay={120} className="mb-4 text-body text-text-secondary sm:mb-5">
              {t.p1}
            </Reveal>

            <Reveal as="p" delay={180} className="mb-4 text-body text-text-secondary sm:mb-5">
              {t.p2}
            </Reveal>

            <Reveal as="p" delay={300} className="text-[24px] font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-headline md:text-[30px]">
              {t.close}
            </Reveal>
          </div>

          {/*
            Comparacion enfrentada con el chip "vs" en el eje.
            
            REVISADO EL 19-ago-2026. Hasta ahora las dos columnas iban una al
            lado de otra TAMBIEN en movil, con el argumento de que eran "listas
            cortas". No lo son: son frases de ocho a doce palabras, y a 375px
            cada columna se queda en unos 140px, asi que cada punto se rompia en
            cuatro o cinco lineas de dos palabras. La comparacion que se queria
            preservar era justo lo que dejaba de leerse.

            En movil se apilan a ancho completo y el eje del "vs" gira con
            ellas: la barra separadora pasa de vertical a horizontal. La
            comparacion no vive en que las dos columnas esten pegadas, vive en
            las dos cabeceras ("Hoy" en gris, "Con Ownex" en esmeralda) y en
            que los puntos van emparejados en el mismo orden, y las dos cosas
            sobreviven al apilado. El texto sube ademas a `text-body`, que es la
            medida de lectura del resto de la pagina.
          */}
          <Reveal delay={100} className="relative grid grid-cols-1 gap-3 lg:sticky lg:top-24 lg:grid-cols-2">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center lg:inset-x-auto lg:inset-y-0 lg:left-1/2 lg:top-auto lg:-translate-x-1/2 lg:translate-y-0 lg:flex-col"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent lg:h-auto lg:w-px lg:bg-gradient-to-b" />
              <div className="mx-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background lg:mx-0 lg:my-2">
                <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-text-tertiary">vs</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent lg:h-auto lg:w-px lg:bg-gradient-to-b" />
            </div>

            <div className="glass-card space-y-3 p-5 sm:space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2 w-2 rounded-full bg-text-tertiary" />
                <p className="text-micro uppercase text-text-tertiary">{t.todayLabel}</p>
              </div>
              <ul className="stagger-children space-y-3 sm:space-y-4">
                {today.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg
                      aria-hidden="true"
                      className="mt-1 h-3 w-3 shrink-0 text-text-tertiary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                    <p className="text-body leading-[1.5] text-text-secondary lg:text-caption">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* La columna de Ownex se enmarca en un borde degradado esmeralda. */}
            <div className="relative rounded-lg bg-gradient-to-br from-emerald-400/40 via-emerald-400/10 to-emerald-400/30 p-px">
              <div className="h-full space-y-3 rounded-lg bg-card p-5 sm:space-y-4">
                <div className="flex items-center gap-2 border-b border-emerald-400/20 pb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <p className="text-micro uppercase text-accent-ink">{t.ownexLabel}</p>
                </div>
                <ul className="stagger-children space-y-3 sm:space-y-4">
                  {withOwnex.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg
                        aria-hidden="true"
                        className="mt-1 h-3 w-3 shrink-0 text-accent-ink"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-body font-normal leading-[1.5] text-foreground lg:text-caption">{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
