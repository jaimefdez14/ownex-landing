import { Reveal } from "./ui/Reveal";

const today = [
  "Tus clientes impulsan tu crecimiento sin poder ser parte de él",
  "Tus rondas de financiación son complejas y diluyen tu control",
  "Te cuesta retener clientes en un mercado cada vez más competitivo",
  "Gastas demasiado en marketing para mantener el crecimiento de tu marca",
];

const withOwnex = [
  "Tus clientes se convierten en accionistas y son parte del crecimiento",
  "El capital viene de tu comunidad, con cap table limpio y control preservado",
  "Clientes fidelizados y que prefieren tu marca frente a competidores",
  "Comunidad con sentimiento de pertenencia que hace crecer tu marca contigo",
];

export function ProblemSection() {
  return (
    <section
      id="problem"
      aria-labelledby="problem-title"
      className="section-padding border-t border-border bg-background"
    >
      <div className="shell">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal as="p" className="label-caps mb-6">
              El desajuste
            </Reveal>

            <Reveal as="h2" id="problem-title" delay={60} className="display-section mb-8 text-display text-foreground md:text-[52px] lg:text-[56px]">
              Tus clientes crean valor.{" "}
              <span className="text-text-tertiary">Pero nunca lo capturan.</span>
            </Reveal>

            <Reveal as="p" delay={120} className="mb-5 text-body text-text-secondary">
              Compran tus productos. Te recomiendan a sus amigos. Defienden tu marca en redes. Te hacen
              crecer. Y cuando levantas capital, quedan completamente fuera.
            </Reveal>

            <Reveal as="p" delay={180} className="mb-5 text-body text-text-secondary">
              Mientras tanto, inversores que jamás usaron tu producto ocupan tu cap table.
            </Reveal>

            <Reveal as="p" delay={300} className="text-headline text-foreground md:text-[30px]">
              ¿Y si tus mejores clientes también pudieran ser tus accionistas?
            </Reveal>
          </div>

          {/*
            Comparacion enfrentada con el chip "vs" en el eje. En movil las dos
            columnas siguen una al lado de otra, como en el original: son listas
            cortas y la comparacion se pierde si se apilan.
          */}
          <Reveal delay={100} className="relative grid grid-cols-2 gap-3 lg:sticky lg:top-24">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center"
            >
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="my-2 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-text-tertiary">vs</span>
              </div>
              <div className="w-px flex-1 bg-gradient-to-b from-transparent via-border to-transparent" />
            </div>

            <div className="glass-card space-y-4 p-4 md:p-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2 w-2 rounded-full bg-text-tertiary" />
                <p className="text-micro uppercase text-text-tertiary">Hoy</p>
              </div>
              <ul className="stagger-children space-y-4">
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
                    <p className="text-caption-lg leading-[1.5] text-text-secondary md:text-caption">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* La columna de Ownex se enmarca en un borde degradado esmeralda. */}
            <div className="relative rounded-lg bg-gradient-to-br from-emerald-400/40 via-emerald-400/10 to-emerald-400/30 p-px">
              <div className="h-full space-y-4 rounded-lg bg-card p-4 md:p-5">
                <div className="flex items-center gap-2 border-b border-emerald-400/20 pb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <p className="text-micro uppercase text-emerald-400">Con Ownex</p>
                </div>
                <ul className="stagger-children space-y-4">
                  {withOwnex.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg
                        aria-hidden="true"
                        className="mt-1 h-3 w-3 shrink-0 text-emerald-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-caption-lg font-normal leading-[1.5] text-foreground md:text-caption">{item}</p>
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
