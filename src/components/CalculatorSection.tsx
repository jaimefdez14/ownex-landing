import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, Send } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { estimateCapital } from "../lib/capitalEstimate";
import { formatEuros, formatInt } from "../lib/formatNumber";
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
 */

const DEFAULTS = { minInvestors: 50, maxInvestors: 150, avgTicket: 1500 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CalculatorSection() {
  const [minInvestors, setMinInvestors] = useState(DEFAULTS.minInvestors);
  const [maxInvestors, setMaxInvestors] = useState(DEFAULTS.maxInvestors);
  const [avgTicket, setAvgTicket] = useState(DEFAULTS.avgTicket);

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

  const result = useMemo(
    () =>
      estimateCapital({
        minInvestors: Math.max(1, minInvestors),
        maxInvestors: Math.max(1, safeMax),
        avgTicket: Math.max(1, avgTicket),
      }),
    [minInvestors, safeMax, avgTicket],
  );

  const onInteract = () => {
    if (interacted.current) return;
    interacted.current = true;
    track("calculator_interaction");
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
            `capital neto estimado entre ${formatEuros(result.netMin)} y ${formatEuros(result.netMax)}.`,
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
            Introduce tu propia estimación de inversores y ticket medio: el cálculo aplica el
            mismo modelo de costes que usamos en una emisión real.
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
          </div>

          <div className="glass-card flex flex-col justify-between p-8 md:p-10">
            <div>
              <span className="icon-badge mb-6 flex h-10 w-10 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
                <Calculator aria-hidden="true" size={18} className="text-emerald-400" />
              </span>

              {result.belowFixedCosts ? (
                <div>
                  <h3 className="mb-3 text-title leading-tight text-foreground">
                    Con esta combinación, no cubres los costes de estructuración.
                  </h3>
                  <p className="text-body text-text-secondary">
                    Prueba a subir el número de inversores del escenario conservador o el ticket
                    medio: los costes fijos de una emisión (legal, regulatorio, registro digital)
                    necesitan un mínimo de capital captado para amortizarse.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-2 text-label uppercase tracking-wide text-text-secondary">
                    Capital neto estimado en tu cuenta
                  </p>
                  <p className="mb-1 text-display text-foreground md:text-display-lg">
                    <AnimatedNumber value={result.netMin} format={formatEuros} /> a{" "}
                    <AnimatedNumber value={result.netMax} format={formatEuros} />
                  </p>
                  <p className="text-body text-text-secondary">
                    Sobre un capital bruto de {formatEuros(result.grossMin)} a{" "}
                    {formatEuros(result.grossMax)}, después de estructuración legal, validación
                    regulatoria y fees de Ownex.
                  </p>
                </div>
              )}

              <p className="mt-6 text-caption text-text-tertiary">
                Estimación orientativa a partir de tus propios supuestos. No es una previsión de
                resultado ni un compromiso de captación.
              </p>
            </div>

            {status === "sent" ? (
              <div role="status" className="mt-8 border-t border-border pt-6">
                <p className="text-body text-foreground">
                  Cálculo enviado. Revisa tu correo en unos minutos.
                </p>
              </div>
            ) : (
              <form
                noValidate
                onSubmit={onSubmit}
                className="mt-8 border-t border-border pt-6"
              >
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
                      <p id="calc-email-error" role="alert" className="mt-2 text-caption text-[#FCA5A5]">
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
                  <p role="alert" className="mt-3 text-caption text-[#FCA5A5]">
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
