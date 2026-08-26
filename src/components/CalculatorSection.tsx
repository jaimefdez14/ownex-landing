import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { Field } from "./ui/Field";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { CapitalCostChart } from "./CapitalCostChart";
import {
  FIXED_COST_HIGH,
  FIXED_COST_LOW,
  estimateCapital,
  roundToThousand,
} from "../lib/capitalEstimate";
import { formatEuros, formatInt, formatPercentDecimal } from "../lib/formatNumber";
import { env } from "../lib/env";
import { track, sourceProperties } from "../lib/analytics";

/**
 * Simulador de emisión (lead magnet, §2.4).
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
 * optimista) y todo salía en rangos. Jaime pidió simplificarlo a tres datos
 * y dos respuestas:
 *
 *   Pide:     número de inversores, ticket medio, valoración pre-money
 *   Devuelve: cuánto puedes levantar (capital bruto, cifra única), y una
 *             estimación de lo que cuesta levantarlo (rango de ±20 %)
 *
 * El coste vuelve a mostrarse como rango, segunda vuelta sobre esta misma
 * revisión: hubo una versión que absorbía el margen del ±20 % por dentro sin
 * enseñarlo, y Jaime pidió que volviera a ser visible. Ver `capitalEstimate.ts`
 * para el porqué del rango y de contra qué extremo se mide "suficiente".
 *
 * La dilución se conserva como dato secundario: la valoración sigue siendo
 * un input, y sin dilución ese input no serviría para nada. Sigue siendo,
 * junto al capital, una de las dos cifras con las que un fundador decide una
 * ronda.
 *
 * Y el bloque de texto que explicaba el reparto bruto/coste (un párrafo y
 * una tabla, y después un anillo, `CapitalDonut`) se sustituye por
 * `CapitalCostChart`: una gráfica de área con ejes reales, eje X el capital
 * levantado, eje Y el coste de levantarlo. `CapitalDonut` y `CoverageBar`
 * quedan retirados: la gráfica cubre lo que hacían los dos.
 *
 * SIMPLIFICADO EL 23-ago-2026: MENOS DETALLE EN PANTALLA
 *
 * La pantalla habia acabado publicando el modelo de costes entero: las cuatro
 * partidas fijas con su importe una a una, el reparto entre costes fijos y
 * comision de exito, el porcentaje que cobra Ownex, el coste al euro y un
 * estado alternativo que, cuando el escenario no llegaba, decia el umbral
 * exacto de viabilidad. Es decir, la tarifa de los proveedores y la propia, en
 * una pagina abierta. Jaime pidio quedarse con la estimacion y soltar el
 * detalle.
 *
 * En pantalla quedan tres cifras (capital captable, coste estimado redondeado
 * al millar y dilucion) y la grafica, ya sin capas ni leyenda (ver
 * `CapitalCostChart.tsx`). Se van: el desglose por partidas, el reparto
 * fijo/comision, el estado de "no llegas" con sus dos atajos, y el umbral.
 *
 * El desglose no desaparece del producto, cambia de sitio: el correo que
 * recibe el lead lo sigue llevando entero, que es exactamente lo que el
 * formulario de abajo ofrece a cambio del email. El detalle se gana con un
 * dato de contacto, no se regala a un visitante anonimo.
 */

const DEFAULTS = { investors: 100, avgTicket: 1500, preMoney: 2000000 };

/**
 * Tamaños de base con los que arrancar sin teclear.
 *
 * La columna de entradas eran tres campos numéricos y nada más: en escritorio
 * dejaba unos 700px de tarjeta vacía al lado de una columna de resultados llena,
 * y sobre todo obligaba a inventarse un número de inversores antes de ver nada.
 * Estos cuatro atajos son los tamaños típicos de una base de accionistas de
 * marca, y dan la primera respuesta de un toque.
 */
const INVESTOR_PRESETS = [50, 100, 250, 500];

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

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem("_gotcha") as HTMLInputElement | null)?.value ?? "";
    if (honeypot.trim().length > 0) return;
    if (Date.now() - renderedAt.current < 2000) return;

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setEmailError("Introduce una dirección de correo válida.");
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
            `Simulación de emisión: ` +
            `${formatInt(investors)} inversores, ticket medio ${formatEuros(avgTicket)}, ` +
            `valoración pre-money ${formatEuros(preMoney)}. ` +
            `Capital captable: ${formatEuros(result.gross)}. ` +
            `Coste estimado: ${formatEuros(result.costLow)} a ${formatEuros(result.costHigh)} ` +
            `(suelo fijo de ${formatEuros(FIXED_COST_LOW)} a ${formatEuros(FIXED_COST_HIGH)} ` +
            `más comisión de éxito sobre el capital captado). ` +
            (preMoney > 0 ? `Dilución: ${formatPercentDecimal(result.dilution)}.` : ""),
          ...sourceProperties(),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      track("calculator_lead_submit");
    } catch (error) {
      setStatus("idle");
      setSubmitError("No se ha podido enviar. Vuelve a intentarlo en unos minutos.");
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
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px]">
          <Reveal as="p" className="label-caps mb-5">
            Simulador de emisión
          </Reveal>
          <Reveal
            as="h2"
            id="calculator-title"
            delay={60}
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            ¿Cuánto capital puede aportar tu comunidad?
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Introduce tus supuestos y obtén una estimación del capital captable y del coste de
            estructurar la operación.
          </Reveal>
        </div>

        <Reveal delay={160} className="grid gap-3 lg:grid-cols-2">
          {/*
            `self-start`: la columna de entradas es mas corta que la de resultados
            (que lleva grafica y formulario). Estirandola hasta igualarlas quedaba
            un tercio de tarjeta vacio; asi termina donde termina su contenido.
          */}
          <div className="glass-card space-y-4 self-start p-6 md:p-8">
            <Field
              id="investors"
              label="Inversores estimados"
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
            <div className="flex flex-wrap items-center gap-2">
              {INVESTOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={investors === preset}
                  onClick={() => applyInvestors(preset)}
                  className={
                    investors === preset
                      ? "min-h-touch rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 text-caption tabular text-emerald-400 transition-colors"
                      : "min-h-touch rounded-full border border-border bg-card-hover px-4 text-caption tabular text-text-secondary transition-colors hover:border-emerald-400/25 hover:text-foreground"
                  }
                >
                  {formatInt(preset)}
                </button>
              ))}
            </div>
            <p className="text-caption text-text-tertiary">Clientes de tu base que estimas que suscribirían.</p>

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
              Si aún no está cerrada, indica la valoración de referencia que estés manejando.
            </p>

          </div>

          <div className="glass-card flex flex-col justify-between p-6 md:p-8">
            <div>
              {/*
                `role="status"` para que el resultado no cambie en silencio: la
                cifra se recalcula al teclear, y sin esto quien navega con lector
                de pantalla teclea a ciegas y no se entera de que hay respuesta.
              */}
              {/*
                Tres cifras y ya. Hasta el 23-ago-2026 aqui vivian ademas el
                reparto entre costes fijos y comision de exito, y un estado
                alternativo para el escenario que no llegaba al punto de
                equilibrio, que decia en pantalla el umbral exacto. Jaime pidio
                soltar ese nivel de detalle: la calculadora responde con un
                orden de magnitud y el desglose completo se envia por correo,
                que es justo lo que el formulario de abajo ofrece a cambio del
                email.

                El coste va redondeado al millar (`roundToThousand`), y el
                capital no: el capital es la cifra del propio visitante
                (inversores x ticket), asi que redondearla seria corregirle sus
                numeros.
              */}
              <div role="status" className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-micro uppercase tracking-wide text-text-secondary">
                    Capital captable
                  </p>
                  <p className="mt-1 text-title tabular text-foreground md:text-headline">
                    <AnimatedNumber value={result.gross} format={formatEuros} />
                  </p>
                </div>
                <div>
                  <p className="text-micro uppercase tracking-wide text-text-secondary">
                    Coste estimado
                  </p>
                  {/*
                    Rango, no cifra unica: los dos extremos los fija Jaime
                    (13.000 € + 3 % y 17.000 € + 8 %). En una tarjeta estrecha
                    "18.000 € a 29.000 €" no cabe en una linea, asi que el "a"
                    va en su propia linea y las dos cifras quedan alineadas
                    debajo, en vez de partirse por donde toque.
                  */}
                  <p className="mt-1 text-title tabular leading-tight text-foreground md:text-headline">
                    <span className="block">
                      <AnimatedNumber value={roundToThousand(result.costLow)} format={formatEuros} />
                    </span>
                    <span className="block whitespace-nowrap">
                      <span className="text-body font-normal text-text-tertiary">a </span>
                      <AnimatedNumber value={roundToThousand(result.costHigh)} format={formatEuros} />
                    </span>
                  </p>
                </div>
                {preMoney > 0 ? (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-micro uppercase tracking-wide text-text-secondary">
                      Dilución
                    </p>
                    <p className="mt-1 text-title tabular text-foreground md:text-headline">
                      {formatPercentDecimal(result.dilution)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <CapitalCostChart gross={result.gross} />
              </div>

              <p className="mt-5 text-caption text-text-tertiary">
                Estimación orientativa basada en los supuestos introducidos. No constituye un
                compromiso de captación ni una oferta de valores.
              </p>
            </div>

            {status === "sent" ? (
              <div role="status" className="mt-6 border-t border-border pt-5">
                <p className="text-body text-foreground">
                  Desglose enviado. Lo recibirás en unos minutos.
                </p>
              </div>
            ) : (
              <form noValidate onSubmit={onSubmit} className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-label uppercase tracking-wide text-text-secondary">
                  Recibe el desglose completo por correo
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
                    Enviar el desglose
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
