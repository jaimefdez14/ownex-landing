import { Reveal } from "./ui/Reveal";
import { useCopy } from "../i18n/locale";

/*
  LOS PUNTOS VAN EMPAREJADOS, y en ingles tambien: cada linea de "Hoy" tiene su
  contraria en la misma posicion de "Con Ownex". Es lo unico que sostiene la
  comparacion cuando las dos columnas se apilan en telefono, asi que el orden no se
  toca al traducir.

  RECORTE DEL 14/11/2026 (revision de la landing aprobada por Jaime). Salen los dos
  parrafos de la columna izquierda y una de las cuatro parejas: decian lo mismo que
  la comparacion, y en telefono la seccion media 1.190px. Quedan el titular, la
  pregunta y tres parejas. La pareja que se va es la del gasto en marketing, que
  repetia la de retencion.
*/
const COPY = {
  es: {
    eyebrow: "El desajuste",
    titleA: "Tu comunidad crea valor.",
    titleB: "Pero nunca lo captura.",
    close: "¿Y si tus mejores clientes también pudieran ser tus inversores?",
    todayLabel: "Hoy",
    ownexLabel: "Con Ownex",
    today: [
      "Tu comunidad te hace crecer y se queda fuera de tu capital",
      "Tus rondas son complejas y diluyen tu control",
      "Retener clientes te cuesta cada vez más marketing",
    ],
    withOwnex: [
      "Tus clientes invierten y crecen contigo",
      "El capital llega de tu comunidad, con cap table limpio",
      "Un propietario repite, gasta más y te recomienda",
    ],
  },
  en: {
    eyebrow: "The mismatch",
    titleA: "Your community creates value.",
    titleB: "But it never captures any of it.",
    close: "What if your best customers could also be your investors?",
    todayLabel: "Today",
    ownexLabel: "With Ownex",
    today: [
      "Your community grows your business and stays out of your equity",
      "Your rounds are complex and dilute your control",
      "Retaining customers costs you more marketing every year",
    ],
    withOwnex: [
      "Your customers invest and grow with you",
      "Capital comes from your community, with a clean cap table",
      "An owner comes back, spends more and recommends you",
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
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-6">
              {t.eyebrow}
            </Reveal>

            <Reveal as="h2" id="problem-title" delay={60} className="text-rise display-section mb-5 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-[52px] lg:text-[56px]">
              {t.titleA}{" "}
              <span className="text-text-tertiary">{t.titleB}</span>
            </Reveal>

            <Reveal as="p" delay={160} className="max-w-[26ch] text-title font-medium leading-tight tracking-[-0.02em] text-foreground sm:text-headline">
              {t.close}
            </Reveal>
          </div>

          {/*
            La comparacion, y su movimiento (14/11/2026). Al entrar en pantalla cada
            linea de "Hoy" se tacha, una detras de otra, y su pareja de "Con Ownex"
            aparece con el mismo retraso. Es una sola pasada ligada al revelado, sin
            bucle, y con `prefers-reduced-motion` todo esta ya en su estado final.
            Las reglas viven en `index.css` (`.vs-strike`, `.vs-answer`).

            En telefono las columnas se apilan y el eje del "vs" gira con ellas
            (revisado el 19/08/2026): a 375px dos columnas dejaban cada frase en
            cuatro lineas de dos palabras.
          */}
          <Reveal delay={100} className="relative grid grid-cols-1 gap-3 lg:grid-cols-2">
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

            <div className="glass-card space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <span className="h-2 w-2 rounded-full bg-text-tertiary" />
                <p className="text-micro uppercase text-text-tertiary">{t.todayLabel}</p>
              </div>
              <ul className="space-y-4">
                {today.map((item, index) => (
                  <li
                    key={item}
                    className="vs-row flex items-start gap-2"
                    style={{ "--vs-i": index } as React.CSSProperties}
                  >
                    <svg
                      aria-hidden="true"
                      className="mt-[5px] h-3 w-3 shrink-0 text-text-tertiary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                    <p className="text-body leading-[1.5] text-text-secondary">
                      <span className="vs-strike">{item}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* La columna de Ownex se enmarca en un borde degradado esmeralda. */}
            <div className="relative rounded-lg bg-gradient-to-br from-emerald-400/40 via-emerald-400/10 to-emerald-400/30 p-px">
              <div className="h-full space-y-4 rounded-lg bg-card p-5 sm:p-6">
                <div className="flex items-center gap-2 border-b border-emerald-400/20 pb-3">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <p className="text-micro uppercase text-accent-ink">{t.ownexLabel}</p>
                </div>
                <ul className="space-y-4">
                  {withOwnex.map((item, index) => (
                    <li
                      key={item}
                      className="vs-row vs-answer flex items-start gap-2"
                      style={{ "--vs-i": index } as React.CSSProperties}
                    >
                      <svg
                        aria-hidden="true"
                        className="mt-[5px] h-3 w-3 shrink-0 text-accent-ink"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <p className="text-body font-medium leading-[1.5] text-foreground">{item}</p>
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
