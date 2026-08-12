import { useEffect, useMemo, useRef, useState } from "react";
import { Send, TrendingUp } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { CoverageBar } from "./CoverageBar";
import { CapitalDonut } from "./CapitalDonut";
import { COST_UNCERTAINTY, estimateCapital } from "../lib/capitalEstimate";
import { formatEuros, formatInt, formatPercent, formatPercentDecimal } from "../lib/formatNumber";
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
 * cambio.
 *
 * DE TEXTO A GRÁFICO (revisión del 11-ago-2026)
 *
 * La primera versión de este bloque explicaba el reparto bruto/coste/neto en un
 * párrafo, y debajo repetía la misma idea en una lista de tres métricas con su
 * propia frase de aclaración cada una: ocho o nueve líneas de texto para decir,
 * en el fondo, una sola cosa ("de tu bruto, esta parte es neto"). Jaime pidió
 * menos texto, menos espacio y un gráfico. `CapitalDonut` sustituye ese bloque
 * entero por un anillo con un único número dentro: el resto de las explicaciones
 * (helpers bajo los campos, el aviso de escenario invertido, el disclaimer
 * final) también se recortan a una línea donde antes había un párrafo.
 *
 * El coste sigue agregado en una sola cifra, sin desglosar por partida
 * (decisión de Jaime del 11-ago-2026): el visitante ve lo que le cuesta la
 * operación entera, no el reparto interno entre terceros y Ownex.
 */

const DEFAULTS = { minInvestors: 50, maxInvestors: 150, avgTicket: 1500, preMoney: 2000000 };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "±20 %" sin escribir el número a mano, para que siga al modelo si cambia. */
const UNCERTAINTY_LABEL = `±${formatPercent(COST_UNCERTAINTY * 100)}`;

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
  /*
    El anillo solo tiene sentido cuando hay un reparto real que dibujar: en
    "insuficiente" el coste puede superar al bruto (más del 100 %), y un anillo
    que se sale de sí mismo no comunica nada. Ahí ya está el bloque de abajo
    (con el hueco en euros y los dos atajos), que es la información que importa
    en ese estado.
  */
  const netPercentWorst = Math.max(0, 100 - result.intermediation.worst);
  const netPercentBest = Math.max(0, 100 - result.intermediation.best);

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
            Ajusta tus supuestos y descubre cuánto capital recibes y qué porcentaje de tu empresa
            cedes a cambio.
          </Reveal>
        </div>

        <Reveal delay={160} className="grid gap-3 lg:grid-cols-2">
          <div className="glass-card space-y-4 p-6 md:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                Usamos {formatInt(minInvestors)} inversores en los dos escenarios.
              </p>
            ) : null}

            <p className="text-caption text-text-tertiary">Tu propia estimación, no la nuestra.</p>

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
                {insufficient ? (
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
                      así que hay un suelo: {formatEuros(result.breakEvenLow)} a{" "}
                      {formatEuros(result.breakEvenHigh)}.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/*
                      El anillo y el número grande, uno al lado del otro: el
                      anillo responde "¿a qué precio?" y la cifra en euros
                      responde "¿cuánto?", las dos preguntas que hasta ahora
                      contestaban un párrafo y una tabla de tres filas.
                    */}
                    <div className="flex items-center gap-5">
                      <CapitalDonut netPercent={netPercentWorst} />
                      <div className="min-w-0">
                        <p className="text-micro uppercase tracking-wide text-text-secondary">
                          Capital neto estimado
                        </p>
                        <p className="text-title tabular text-foreground md:text-headline">
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
                        <p className="mt-1 text-caption text-text-tertiary">
                          Hasta {formatPercent(netPercentBest)} en tu mejor escenario.
                        </p>
                      </div>
                    </div>

                    {preMoney > 0 ? (
                      <p className="mt-5 border-t border-border pt-4 text-body text-foreground">
                        A cambio de{" "}
                        <span className="tabular text-headline">
                          {formatPercentDecimal(result.dilutionMin)} a{" "}
                          {formatPercentDecimal(result.dilutionMax)}
                        </span>{" "}
                        de tu empresa.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>

              {/*
                La escala de equilibrio solo se enseña cuando aporta algo nuevo:
                en "holgado" el anillo ya deja claro que el coste es una porción
                pequeña, y repetir la misma idea en una segunda barra era
                exactamente el tipo de redundancia que se quería quitar.
              */}
              {result.status !== "holgado" ? (
                <div className="mt-6">
                  <CoverageBar
                    grossMin={result.grossMin}
                    grossMax={result.grossMax}
                    breakEvenLow={result.breakEvenLow}
                    breakEvenHigh={result.breakEvenHigh}
                    status={result.status}
                  />
                </div>
              ) : null}

              {/*
                Los dos atajos. En rojo son la salida del callejón; en ámbar,
                el empujón para salir de la zona dudosa. En verde no aparecen:
                no hay nada que arreglar.
              */}
              {result.status !== "holgado" ? (
                <div className="mt-6 rounded-md border border-border bg-card-hover/50 p-4">
                  <p className="mb-3 text-caption text-text-secondary">
                    {insufficient ? "Dos formas de llegar:" : "Estás en zona ajustada. Prueba:"}
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

              <p className="mt-5 text-caption text-text-tertiary">
                Estimación orientativa, {UNCERTAINTY_LABEL} sobre los costes. No es un compromiso de
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
