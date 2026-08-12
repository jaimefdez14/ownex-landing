import { useEffect, useMemo, useRef, useState } from "react";
import { Send, TrendingUp } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { CapitalCostChart } from "./CapitalCostChart";
import { BREAK_EVEN, estimateCapital } from "../lib/capitalEstimate";
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
 * REVISIÓN DEL 11-ago-2026: UN SOLO ESCENARIO
 *
 * Hasta entonces se pedían dos horquillas de inversores (conservador/
 * optimista) y todo salía en rangos: capital neto entre X e Y, dilución entre
 * X e Y. Jaime pidió simplificarlo a tres datos y dos respuestas, sin rangos:
 *
 *   Pide:    número de inversores, ticket medio, valoración pre-money
 *   Devuelve: cuánto puedes levantar (capital bruto), y una estimación de
 *             lo que cuesta levantarlo
 *
 * El coste que se muestra ya lleva dentro el margen de seguridad que antes se
 * enseñaba como un "±20 %" explícito (ver `capitalEstimate.ts`): ahora es una
 * única cifra, sin aclarar que hay un margen aplicado. Es una estimación, no
 * una lección de metodología.
 *
 * La dilución se conserva como dato secundario (no pedido explícitamente en
 * esta revisión, pero la valoración sigue siendo un input y sin dilución ese
 * input no serviría para nada): sigue siendo, junto al capital, una de las dos
 * cifras con las que un fundador decide una ronda.
 *
 * Y el bloque de texto que explicaba el reparto bruto/coste (el anillo,
 * `CapitalDonut`, y antes de eso un párrafo y una tabla) se sustituye por
 * `CapitalCostChart`: una gráfica de área, eje X el capital levantado, eje Y
 * el coste de levantarlo, interactiva. `CapitalDonut` y `CoverageBar` quedan
 * retirados: la gráfica cubre lo que hacían los dos.
 */

const DEFAULTS = { investors: 100, avgTicket: 1500, preMoney: 2000000 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CalculatorSection() {
  const [investors, setInvestors] = useState(DEFAULTS.investors);
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

  const result = useMemo(
    () =>
      estimateCapital({
        investors: Math.max(1, investors),
        avgTicket: Math.max(1, avgTicket),
        preMoney: Math.max(0, preMoney),
      }),
    [investors, avgTicket, preMoney],
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
    setInvestors(value);
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
            `${formatInt(investors)} inversores, ticket medio ${formatEuros(avgTicket)}, ` +
            `valoración pre-money ${formatEuros(preMoney)}. ` +
            `Capital que puede levantar: ${formatEuros(result.gross)}. ` +
            `Coste estimado: ${formatEuros(result.cost)}. ` +
            (preMoney > 0 ? `Dilución: ${formatPercentDecimal(result.dilution)}. ` : "") +
            `Cobertura de costes: ${result.sufficient ? "suficiente" : "insuficiente"}.`,
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

  return (
    <section
      id="calculator"
      aria-labelledby="calculator-title"
      className="section-padding border-t border-border bg-background"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px]">
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
            Ajusta tus supuestos y descubre cuánto capital puedes levantar y qué te cuesta
            levantarlo.
          </Reveal>
        </div>

        <Reveal delay={160} className="grid gap-3 lg:grid-cols-2">
          <div className="glass-card space-y-4 p-6 md:p-8">
            <Field
              id="investors"
              label="Número de inversores"
              type="number"
              inputMode="numeric"
              min={1}
              max={1000000}
              value={investors}
              onChange={(event) => {
                onInteract();
                setInvestors(Number(event.target.value) || 0);
              }}
            />
            <p className="text-caption text-text-tertiary">Tu propia estimación, no la nuestra.</p>

            <Field
              id="avg-ticket"
              label="Ticket medio por inversor (€)"
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
              label="Valoración pre-money (€)"
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
              Si no la tienes cerrada, usa la que estés manejando.
            </p>
          </div>

          <div className="glass-card flex flex-col justify-between p-6 md:p-8">
            <div>
              {/*
                `role="status"` para que el resultado no cambie en silencio: la
                cifra se recalcula al teclear, y sin esto quien navega con lector
                de pantalla teclea a ciegas y no se entera de que hay respuesta.
              */}
              <div role="status">
                {result.sufficient ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-micro uppercase tracking-wide text-text-secondary">
                        Capital que puedes levantar
                      </p>
                      <p className="text-title tabular text-foreground md:text-headline">
                        <AnimatedNumber value={result.gross} format={formatEuros} />
                      </p>
                    </div>
                    <div>
                      <p className="text-micro uppercase tracking-wide text-text-secondary">
                        Coste estimado
                      </p>
                      <p className="text-title tabular text-foreground md:text-headline">
                        <AnimatedNumber value={result.cost} format={formatEuros} />
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <span className="icon-badge mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-danger/25 bg-danger/10">
                      <TrendingUp aria-hidden="true" size={18} className="text-danger" />
                    </span>
                    <p className="mb-3 text-micro uppercase text-danger">
                      No llegas al punto de equilibrio
                    </p>
                    <h3 className="mb-3 text-headline leading-tight text-foreground">
                      Te faltan{" "}
                      <span className="tabular text-danger">{formatEuros(result.shortfall)}</span> de
                      capital bruto.
                    </h3>
                    <p className="text-body text-text-secondary">
                      Los costes de estructurar una emisión apenas bajan porque la ronda sea menor,
                      así que hay un suelo: {formatEuros(BREAK_EVEN)}.
                    </p>
                  </div>
                )}
              </div>

              {preMoney > 0 && result.sufficient ? (
                <p className="mt-4 border-t border-border pt-4 text-body text-foreground">
                  A cambio de{" "}
                  <span className="tabular text-headline">{formatPercentDecimal(result.dilution)}</span>{" "}
                  de tu empresa.
                </p>
              ) : null}

              <div className="mt-6">
                <CapitalCostChart gross={result.gross} breakEven={BREAK_EVEN} />
              </div>

              {/*
                Los dos atajos. En rojo son la salida del callejón. En verde no
                aparecen: no hay nada que arreglar.
              */}
              {!result.sufficient ? (
                <div className="mt-6 rounded-md border border-border bg-card-hover/50 p-4">
                  <p className="mb-3 text-caption text-text-secondary">Dos formas de llegar:</p>
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

              <p className="mt-5 text-caption text-text-tertiary">
                Estimación orientativa a partir de tus propios supuestos. No es un compromiso de
                captación.
              </p>
            </div>

            {status === "sent" ? (
              <div role="status" className="mt-6 border-t border-border pt-5">
                <p className="text-body text-foreground">
                  Cálculo enviado. Revisa tu correo en unos minutos.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-label uppercase tracking-wide text-text-secondary">
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
