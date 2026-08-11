import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Send, TrendingUp } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { CoverageBar } from "./CoverageBar";
import { COST_UNCERTAINTY, estimateCapital } from "../lib/capitalEstimate";
import { formatEuros, formatInt, formatPercentDecimal } from "../lib/formatNumber";
import { env } from "../lib/env";
import { track, sourceProperties } from "../lib/analytics";

/**
 * Calculadora de capital potencial (lead magnet, §2.4).
 *
 * Segundo punto de conversión del sitio, con mucha menos fricción que
 * LeadForm: nadie tiene que agendar nada para ver una primera cifra. Solo al
 * pedir el desglose por correo entra en juego un envío real, y ese envío
 * reutiliza el mismo endpoint que LeadForm (`api/lead.ts`), marcado con
 * `origen: "calculadora"` para poder distinguirlo en el registro de leads.
 *
 * La lógica de negocio vive aparte, en `lib/capitalEstimate.ts`: aquí solo
 * hay estado de formulario y presentación.
 *
 * QUÉ RESPONDE (revisión del 11-ago-2026)
 *
 * Antes respondía solo "cuánto neto me llevo", y esa pregunta lleva derecha a
 * una comparación de comisiones que Ownex pierde: el propio modelo de costes
 * sitúa la operación all-in por encima de las plataformas de crowdfunding con
 * las que compite. Ahora responde a las DOS preguntas con las que un fundador
 * decide de verdad: cuánto recibe y qué porcentaje de su empresa entrega a
 * cambio. La segunda no estaba por ningún lado.
 *
 * El coste va agregado en una sola cifra, sin desglosar por partida (decisión
 * de Jaime): el visitante ve lo que le cuesta la operación entera, no el
 * reparto interno entre terceros y Ownex.
 */

const DEFAULTS = { minInvestors: 50, maxInvestors: 150, avgTicket: 1500, preMoney: 2000000 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const NB = " ";

/** "±20 %" sin escribir el número a mano, para que siga al modelo si cambia. */
const UNCERTAINTY_LABEL = `±${Math.round(COST_UNCERTAINTY * 100)}${NB}%`;

/**
 * Una fila de la lista de ratios. El término y su aclaración van juntos en el
 * `<dt>`: "coste por euro neto" no se entiende solo, y una nota al pie común para
 * los tres obligaría a ir y volver tres veces.
 *
 * La aclaración va en `text-caption` y no en `text-micro`, que sería el tamaño
 * lógico por jerarquía: `micro` lleva 0,18em de interletraje porque está hecho
 * para rótulos de dos palabras en versales, y aplicado a una frase entera la
 * estira hasta que deja de leerse de un vistazo.
 */
function Metric({ term, hint, value }: { term: string; hint: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt>
        <span className="block text-caption font-medium text-foreground">{term}</span>
        <span className="block text-caption leading-snug text-text-tertiary">{hint}</span>
      </dt>
      <dd className="shrink-0 text-label tabular text-foreground">{value}</dd>
    </div>
  );
}

export function CalculatorSection() {
  const [minInvestors, setMinInvestors] = useState(DEFAULTS.minInvestors);
  const [maxInvestors, setMaxInvestors] = useState(DEFAULTS.maxInvestors);
  const [avgTicket, setAvgTicket] = useState(DEFAULTS.avgTicket);
  const [preMoney, setPreMoney] = useState(DEFAULTS.preMoney);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const interacted = useRef(false);
  const renderedAt = useRef(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const safeMax = Math.max(minInvestors, maxInvestors);
  const rangeInverted = maxInvestors < minInvestors;

  const result = useMemo(
    () =>
      estimateCapital({
        minInvestors: Math.max(1, minInvestors),
        maxInvestors: Math.max(1, safeMax),
        avgTicket: Math.max(1, avgTicket),
        preMoney: Math.max(0, preMoney),
      }),
    [minInvestors, safeMax, avgTicket, preMoney],
  );

  const onInteract = () => {
    if (interacted.current) return;
    interacted.current = true;
    track("calculator_interaction");
  };

  /*
    Los dos atajos del estado insuficiente. No se limitan a decir cuánto falta:
    lo aplican. Un formulario que te dice "no llegas" y te deja ahí es un callejón
    sin salida; uno que te enseña las dos palancas que tienes (más gente o más
    ticket) y te deja probarlas de un toque enseña cómo funciona la economía de
    una emisión, que es justo lo que esta sección quiere explicar.
  */
  const applyInvestors = (value: number) => {
    onInteract();
    setMinInvestors(value);
    if (maxInvestors < value) setMaxInvestors(value);
    track("calculator_shortcut", { lever: "investors", value });
  };

  const applyTicket = (value: number) => {
    onInteract();
    setAvgTicket(value);
    track("calculator_shortcut", { lever: "ticket", value });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";
    if (honeypot.trim().length > 0) return;
    if (Date.now() - renderedAt.current < 2000) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError("La dirección de correo no parece válida.");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch(env.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email: trimmed,
          origen: "calculadora",
          mensaje:
            `Cálculo desde la calculadora de capital potencial: ` +
            `${formatInt(minInvestors)} a ${formatInt(safeMax)} inversores, ` +
            `ticket medio ${formatEuros(avgTicket)}, ` +
            `valoración pre-money ${formatEuros(preMoney)}. ` +
            `Capital neto estimado entre ${formatEuros(result.netMin)} y ${formatEuros(result.netMax)}, ` +
            `dilución entre ${formatPercentDecimal(result.dilutionMin)} y ${formatPercentDecimal(result.dilutionMax)}, ` +
            `coste de intermediación entre ${formatPercentDecimal(result.intermediation.best)} y ${formatPercentDecimal(result.intermediation.worst)} del bruto. ` +
            `Cobertura de costes en el escenario conservador: ${result.status}.`,
          ...sourceProperties(),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      track("calculator_lead_submit");
    } catch (error) {
      setStatus("idle");
      setSubmitError("No se ha podido enviar. Puedes reintentarlo en unos minutos.");
      track("form_submit_error", {
        reason: error instanceof Error ? error.message : "desconocido",
        origen: "calculadora",
      });
    }
  };

  const insufficient = result.status === "insuficiente";

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-title"
      className="section-padding border-t border-border bg-background"
    >
      <div className="shell">
        <div className="mb-14 max-w-[800px]">
          <Reveal as="p" className="label-caps mb-5">
            Calcula tu capital potencial
          </Reveal>
          <Reveal
            as="h2"
            id="calculator-title"
            delay={60}
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            ¿Cuánto podría movilizar tu comunidad?
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Introduce tus propios supuestos de inversores, ticket medio y valoración: el cálculo
            aplica el mismo modelo de costes que usamos en una emisión real, y te devuelve las dos
            cifras con las que se decide una ronda, lo que recibes y lo que cedes.
          </Reveal>
        </div>

        <Reveal delay={160} className="grid gap-3 lg:grid-cols-2">
          <div className="glass-card space-y-5 p-8 md:p-10">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="min-investors"
                label="Inversores (escenario conservador)"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000000}
                value={minInvestors}
                onChange={(event) => {
                  onInteract();
                  setMinInvestors(Number(event.target.value) || 0);
                }}
              />
              <Field
                id="max-investors"
                label="Inversores (escenario optimista)"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000000}
                value={maxInvestors}
                onChange={(event) => {
                  onInteract();
                  setMaxInvestors(Number(event.target.value) || 0);
                }}
              />
            </div>

            {/*
              Antes, poner el escenario optimista por debajo del conservador se
              corregía en silencio (`safeMax`). Corregir sin decirlo es peor que
              no corregir: el resultado deja de corresponderse con lo que la
              persona ve escrito en sus propios campos.
            */}
            {rangeInverted ? (
              <p role="status" className="text-caption text-warning">
                El escenario optimista es menor que el conservador, así que el cálculo usa{" "}
                {formatInt(minInvestors)} inversores en los dos.
              </p>
            ) : null}

            <p className="text-caption text-text-tertiary">
              Cuántos miembros de tu comunidad crees, de forma realista, que invertirían en tu
              marca. Te pedimos un rango porque es tu estimación, no la nuestra.
            </p>

            <Field
              id="avg-ticket"
              label="Ticket medio estimado por inversor (€)"
              type="number"
              inputMode="numeric"
              min={1}
              max={90000}
              value={avgTicket}
              onChange={(event) => {
                onInteract();
                setAvgTicket(Number(event.target.value) || 0);
              }}
            />

            <Field
              id="pre-money"
              label="Valoración pre-money acordada (€)"
              type="number"
              inputMode="numeric"
              min={0}
              max={1000000000}
              value={preMoney}
              onChange={(event) => {
                onInteract();
                setPreMoney(Number(event.target.value) || 0);
              }}
            />
            <p className="text-caption text-text-tertiary">
              Es lo que determina cuánto de tu empresa entregas por ese capital. Si todavía no la
              tienes cerrada, pon la que estés manejando.
            </p>
          </div>

          <div className="glass-card flex flex-col justify-between p-8 md:p-10">
            <div>
              <span
                className={
                  insufficient
                    ? "icon-badge mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-danger/25 bg-danger/10"
                    : "icon-badge mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10"
                }
              >
                {insufficient ? (
                  <TrendingUp aria-hidden="true" size={18} className="text-danger" />
                ) : (
                  <Calculator aria-hidden="true" size={18} className="text-emerald-400" />
                )}
              </span>

              {/*
                `role="status"` para que el resultado no cambie en silencio: la
                cifra se recalcula al teclear, y sin esto quien navega con lector
                de pantalla teclea a ciegas y no se entera de que hay respuesta.
              */}
              <div role="status">
                {insufficient ? (
                  <div>
                    <p className="mb-4 text-micro uppercase text-danger">
                      No llegas al punto de equilibrio
                    </p>
                    <h3 className="mb-4 text-headline leading-tight text-foreground">
                      Con {formatInt(minInvestors)} inversores a {formatEuros(avgTicket)} te faltan{" "}
                      <span className="tabular text-danger">{formatEuros(result.shortfall)}</span> de
                      capital bruto.
                    </h3>
                    <p className="text-body text-text-secondary">
                      Estructurar una emisión cuesta prácticamente lo mismo sea grande o pequeña:
                      abogados, sociedad vehículo, validación regulatoria y registro digital no
                      bajan porque la ronda sea menor. Por eso hay un suelo, y está entre{" "}
                      {formatEuros(result.breakEvenLow)} y {formatEuros(result.breakEvenHigh)} de
                      capital bruto.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 text-label uppercase tracking-wide text-text-secondary">
                      Capital neto estimado en tu cuenta
                    </p>
                    <p className="mb-4 text-display text-foreground md:text-display-lg">
                      {result.netMin > 0 ? (
                        <>
                          <AnimatedNumber value={result.netMin} format={formatEuros} /> a{" "}
                          <AnimatedNumber value={result.netMax} format={formatEuros} />
                        </>
                      ) : (
                        <>
                          hasta <AnimatedNumber value={result.netMax} format={formatEuros} />
                        </>
                      )}
                    </p>

                    {preMoney > 0 ? (
                      <div className="mb-4 border-t border-border pt-4">
                        <p className="mb-2 text-label uppercase tracking-wide text-text-secondary">
                          A cambio de
                        </p>
                        <p className="text-headline text-foreground">
                          <span className="tabular">
                            {formatPercentDecimal(result.dilutionMin)} a{" "}
                            {formatPercentDecimal(result.dilutionMax)}
                          </span>{" "}
                          de tu empresa
                        </p>
                        <p className="mt-1 text-caption text-text-tertiary">
                          Dilución de los socios actuales sobre una valoración pre-money de{" "}
                          {formatEuros(preMoney)}.
                        </p>
                      </div>
                    ) : null}

                    <p className="text-body text-text-secondary">
                      Sobre un capital bruto de {formatEuros(result.grossMin)} a{" "}
                      {formatEuros(result.grossMax)}. El coste all-in de la operación
                      (estructuración legal, validación regulatoria y fees de Ownex) va de{" "}
                      {formatEuros(result.costMin)} a {formatEuros(result.costMax)}.
                    </p>

                    {/*
                      Los tres ratios de la operación. Los importes de arriba dicen
                      cuánto, y estos dicen a qué precio, que es lo que permite
                      comparar dos rondas de tamaño distinto: al crecer la ronda, las
                      partidas fijas se reparten entre más capital y los tres bajan.
                      Esa relación es la lección de la sección, y sin ratios no se veía.

                      Solo salen cuando el escenario conservador deja neto. Si no, los
                      denominadores se van a cero o a números absurdos (un coste del
                      294 % del bruto en una ronda que no cubre costes es aritmética
                      correcta y información inútil), y ahí la pantalla ya está
                      contando otra cosa.
                    */}
                    {result.perNet ? (
                      <dl className="mt-6 space-y-4 rounded-md border border-border bg-card-hover/40 p-5">
                        <Metric
                          term="Coste de intermediación total"
                          hint="Todo lo que no llega a tu cuenta, sobre el capital bruto"
                          value={`${formatPercentDecimal(result.intermediation.best)} a ${formatPercentDecimal(result.intermediation.worst)}`}
                        />
                        <Metric
                          term="Coste por euro neto"
                          hint="El mismo coste, medido sobre lo que sí llega a tu cuenta"
                          value={`${formatPercentDecimal(result.perNet.best)} a ${formatPercentDecimal(result.perNet.worst)}`}
                        />
                        {result.capitalCost ? (
                          <Metric
                            term="Coste del capital"
                            hint={`De tu empresa, por cada ${formatEuros(100000)} netos`}
                            value={`${formatPercentDecimal(result.capitalCost.best)} a ${formatPercentDecimal(result.capitalCost.worst)}`}
                          />
                        ) : null}
                      </dl>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <CoverageBar
                  grossMin={result.grossMin}
                  grossMax={result.grossMax}
                  breakEvenLow={result.breakEvenLow}
                  breakEvenHigh={result.breakEvenHigh}
                  status={result.status}
                />
              </div>

              {/*
                Los dos atajos. En rojo son la salida del callejón; en ámbar,
                el empujón para salir de la zona dudosa. En verde no aparecen:
                no hay nada que arreglar.
              */}
              {result.status !== "holgado" ? (
                <div className="mt-6 rounded-md border border-border bg-card-hover/50 p-5">
                  <p className="mb-4 text-caption text-text-secondary">
                    {insufficient
                      ? "Dos formas de llegar, con lo que ya has puesto:"
                      : `Tu escenario conservador cae dentro de la zona: si los costes salen por la parte alta de la horquilla, no queda nada para la marca. Dos formas de salir de ahí:`}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => applyInvestors(result.investorsNeeded)}
                    >
                      Subir a {formatInt(result.investorsNeeded)} inversores
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => applyTicket(result.ticketNeeded)}
                    >
                      Subir el ticket a {formatEuros(result.ticketNeeded)}
                    </Button>
                  </div>
                </div>
              ) : null}

              <p className="mt-6 text-caption text-text-tertiary">
                Estimación orientativa a partir de tus propios supuestos, con un margen de{" "}
                {UNCERTAINTY_LABEL} sobre los costes estimados. No es una previsión de resultado, un
                presupuesto cerrado ni un compromiso de captación.
              </p>
            </div>

            {status === "sent" ? (
              <div role="status" className="mt-8 border-t border-border pt-6">
                <p className="text-body text-foreground">
                  Cálculo enviado. Revisa tu correo en unos minutos.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="mt-8 border-t border-border pt-6">
                <p className="mb-4 text-label uppercase tracking-wide text-text-secondary">
                  Te enviamos este cálculo con el desglose completo
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <label htmlFor="calc-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="calc-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="tu@empresa.com"
                      maxLength={255}
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        if (emailError) setEmailError(undefined);
                      }}
                      aria-invalid={emailError ? true : undefined}
                      aria-describedby={emailError ? "calc-email-error" : undefined}
                      className="min-h-touch w-full rounded-md border border-border bg-background/50 px-4 py-3 text-[16px] text-foreground placeholder:text-text-tertiary transition-all focus:border-emerald-400 focus:outline-none focus:ring-[3px] focus:ring-emerald-400/20"
                    />
                    {emailError ? (
                      <p id="calc-email-error" role="alert" className="mt-2 text-caption text-danger">
                        {emailError}
                      </p>
                    ) : null}
                  </div>
                  <Button type="submit" loading={status === "sending"} className="sm:w-auto">
                    Enviar cálculo
                    <Send aria-hidden="true" size={16} />
                  </Button>
                </div>

                <input
                  type="text"
                  name="_gotcha"
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                  className="absolute -left-[9999px]"
                />

                {submitError ? (
                  <p role="alert" className="mt-3 text-caption text-danger">
                    {submitError}
                  </p>
                ) : null}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
