import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { NumericField } from "./ui/NumericField";
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

/*
  Atajos tambien para el ticket y la valoracion. Solo los tenia el numero de
  inversores, asi que los otros dos campos seguian obligando a inventarse una
  cifra y teclearla. Los valores son los tramos tipicos de una emision dirigida
  a comunidad de marca.
*/
const TICKET_PRESETS = [250, 500, 1500, 5000];
const PREMONEY_PRESETS = [1000000, 2000000, 5000000, 10000000];

/** Los importes grandes se abrevian: "10.000.000 €" no cabe en una pastilla. */
function abrevia(valor: number): string {
  /*
    El decimal va con COMA y no con punto: el sitio usa formato espanol (§4.1) y
    `1500 / 1000` devuelve en JavaScript "1.5", que se colaba tal cual en la
    pastilla como "1.5k €".
  */
  const conComa = (n: number) => String(n).replace(".", ",");
  if (valor >= 1000000) return `${conComa(valor / 1000000)} M€`;
  if (valor >= 1000) return `${conComa(valor / 1000)}k €`;
  return formatEuros(valor);
}

function Presets({
  valores,
  actual,
  onElegir,
  etiqueta,
  formato = formatInt,
}: {
  valores: number[];
  actual: number;
  onElegir: (valor: number) => void;
  etiqueta: string;
  formato?: (valor: number) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={etiqueta}>
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          aria-pressed={actual === valor}
          onClick={() => onElegir(valor)}
          className={
            actual === valor
              ? "min-h-touch rounded-full bg-accent-soft px-4 text-caption font-medium tabular text-on-accent-soft transition-colors"
              : "min-h-touch rounded-full border border-border bg-card-hover px-4 text-caption tabular text-text-secondary transition-colors hover:border-emerald-400/25 hover:text-foreground"
          }
        >
          {formato(valor)}
        </button>
      ))}
    </div>
  );
}

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

  /*
    Escenario incompleto: sin inversores o sin ticket no hay nada que estimar.

    Hasta el 26/08/2026 no existia este estado y la calculadora respondia
    igualmente, porque `estimateCapital` hace `Math.max(1, ...)` sobre los dos
    campos: con todo a cero decia "Capital captable: 1 €" y, debajo, un coste de
    "13.000 € a 17.000 €". O sea, cinco cifras de coste para captar un euro. La
    correccion es de presentacion y no toca el modelo: el calculo sigue siendo el
    mismo, solo que no se ensena hasta que hay supuestos que ensenar.
  */
  const escenarioIncompleto = investors < 1 || avgTicket < 1;

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

  const applyPreMoney = (value: number) => {
    onInteract();
    setPreMoney(value);
    track("calculator_shortcut", { lever: "premoney", value });
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
    /*
      EN OSCURO DESDE EL 28/08/2026, a peticion de Jaime.

      Es el cuarto bloque oscuro de la pagina (banda de cifras, tesis, este y el
      cierre) y sube el reparto por encima de la sexta parte que fija `brand/BRAND.md`
      §9.1. Queda dicho aqui para que se sepa que es una decision y no un
      descuido, y para que quien actualice esa seccion de la guia lo cuente.

      Funciona bien en su sitio: cae entre dos secciones de lienzo alterno
      (`framework` y `regulation`), asi que el corte se ve. Y el simulador es el
      unico elemento interactivo de la pagina; el oscuro lo separa del resto en
      vez de dejarlo como una seccion mas por la que se pasa.

      No hace falta tocar ni un componente de dentro: las variables de color se resuelven
      contra el tema (ver el bloque "Temas" de `index.css`). Lo unico que si hubo
      que arreglar fue la grafica, que llevaba `#34D399` y `#0A0B0C` a fuego y por
      tanto no seguia al tema; ver `CapitalCostChart.tsx`.

      `spotlight` porque los otros tres bloques oscuros lo llevan: el resplandor
      que sigue al cursor solo existe sobre `.theme-dark`, y sin el este seria el
      unico oscuro plano de la pagina.
    */
    <section
      id="calculator"
      aria-labelledby="calculator-title"
      className="section-padding spotlight bg-background theme-dark"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px]">
          <Reveal as="p" className="rule-grow label-caps mb-5">
            Simulador de emisión
          </Reveal>
          <Reveal
            as="h2"
            id="calculator-title"
            delay={60}
            className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            ¿Cuánto capital puede aportar tu comunidad?
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Introduce tus supuestos y obtén una estimación del capital captable y del coste de
            estructurar la operación.
          </Reveal>
        </div>

        {/*
          UNA SOLA TARJETA - 26/08/2026.

          Eran dos tarjetas al 50 {'%'} cada una, y no funcionaba: las entradas son
          tres campos y un par de atajos (442px de alto), mientras que la columna
          de resultados lleva las cifras, la grafica y la captura de correo
          (654px). Medido en escritorio, eso dejaba 212px de tarjeta vacia debajo
          de las entradas y, al mismo tiempo, apretaba la grafica en 530px cuando
          le sobraba sitio al lado.

          Ahora es UNA tarjeta con dos columnas de anchos distintos: las entradas
          se quedan en 340px, que es lo que necesitan, y todo lo demas se lleva el
          resto. Al ser una sola caja desaparece el problema de raiz, porque ya no
          hay dos alturas que cuadrar entre si, y la captura de correo pasa al pie
          a ancho completo, que es donde cierra el bloque.
        */}
        <Reveal delay={160} className="glass-card p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
          <div className="space-y-4">
            {/*
              `NumericField` y no `Field` con `type="number"`: ese tipo no admite
              separadores de millar, asi que las tres unicas cifras que el
              visitante ESCRIBE eran las unicas del sitio sin formato. Ver el
              docblock del componente.

              El minimo es 0 y no 1 a proposito: hay que poder vaciar el campo
              para llegar al estado "escenario incompleto" de mas abajo, que es el
              que explica que falta.
            */}
            <NumericField
              id="investors"
              label="Inversores estimados"
              min={0}
              max={1000000}
              value={investors}
              onChange={(valor) => {
                onInteract();
                setInvestors(valor);
              }}
            />
            <Presets
              valores={INVESTOR_PRESETS}
              actual={investors}
              onElegir={applyInvestors}
              etiqueta="Número de inversores sugerido"
            />
            <p className="text-caption text-text-tertiary">Clientes de tu base que estimas que suscribirían.</p>

            {/* El "(€)" se cae del rotulo: el simbolo va ya dentro del campo. */}
            <NumericField
              id="avg-ticket"
              label="Ticket medio por inversor"
              suffix="€"
              min={0}
              max={90000}
              value={avgTicket}
              onChange={(valor) => {
                onInteract();
                setAvgTicket(valor);
              }}
            />
            <Presets
              valores={TICKET_PRESETS}
              actual={avgTicket}
              onElegir={applyTicket}
              etiqueta="Ticket medio sugerido"
              formato={abrevia}
            />

            <NumericField
              id="pre-money"
              label="Valoración pre-money"
              suffix="€"
              min={0}
              max={1000000000}
              value={preMoney}
              onChange={(valor) => {
                onInteract();
                setPreMoney(valor);
              }}
            />
            <Presets
              valores={PREMONEY_PRESETS}
              actual={preMoney}
              onElegir={applyPreMoney}
              etiqueta="Valoración sugerida"
              formato={abrevia}
            />
            <p className="text-caption text-text-tertiary">
              Si aún no está cerrada, indica la valoración de referencia que estés manejando.
            </p>

          </div>

          <div className="flex flex-col">
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
              <div role="status">
              {escenarioIncompleto ? (
                <div className="flex min-h-[120px] flex-col justify-center rounded-md border border-dashed border-border px-5 py-6">
                  <p className="text-body text-foreground">
                    Indica cuántos inversores estimas y su ticket medio.
                  </p>
                  <p className="mt-1 text-caption text-text-tertiary">
                    Con esos dos datos calculamos el capital captable y el coste de la operación.
                  </p>
                </div>
              ) : (
                <>
              <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3">
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
                    EN UNA SOLA LINEA DONDE CABE - 26/08/2026, CORREGIDO EL 27.

                    El rango iba partido en dos ("18.000 €" arriba y "a 29.000 €"
                    debajo) porque no cabia cuando la columna media 530px. La
                    maqueta nueva le da 626px, asi que cabe entero, y para
                    asegurarlo se puso `whitespace-nowrap` en el parrafo.

                    Ese `nowrap` era demasiado: los 626px son la medida a 1440px.
                    En movil esta celda es la mitad de una retícula de dos (unos
                    155px) y la linea sin cortes mide unos 230, asi que "29.000 €"
                    se salia de la tarjeta y el `overflow-x: clip` de la pagina se
                    lo comia sin avisar. En el tramo de 1024 a 1280px pasaba lo
                    mismo, porque ahi la columna de resultados no llega a 460px.

                    El `nowrap` baja ahora a cada numero por separado. Donde cabe,
                    la linea sale entera igual que antes; donde no, corta por el
                    unico sitio por el que tiene sentido cortar (delante del nexo)
                    y vuelve a las dos lineas de siempre. Lo que ya no puede pasar
                    es que un importe se parta por la mitad ni que se salga.
                  */}
                  <p className="mt-1 text-title tabular text-foreground">
                    <span className="whitespace-nowrap">
                      <AnimatedNumber value={roundToThousand(result.costLow)} format={formatEuros} />
                    </span>{" "}
                    <span className="whitespace-nowrap">
                      {/*
                        El espacio va DENTRO del nexo y no solo como relleno de
                        CSS: el `pr-1` separaba los dos a la vista pero el texto
                        seguia siendo "a29.000 €" al copiarlo y al leerlo en voz
                        alta. Como el envoltorio ya es `whitespace-nowrap`, ese
                        espacio no abre un punto de corte nuevo.
                      */}
                      <span className="font-normal text-text-tertiary">{"a "}</span>
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
                </>
              )}
              </div>
            </div>

          </div>
          </div>

          {/*
            La captura de correo, al pie y a ancho completo. Estaba dentro de la
            columna de resultados, donde el campo y el boton se apretaban en 530px;
            aqui abajo cierra el bloque entero y respira.
          */}
          <div className="mt-8 border-t border-border pt-6">
            {status === "sent" ? (
            <div role="status" className="">
              <p className="text-body text-foreground">
                Desglose enviado. Lo recibirás en unos minutos.
              </p>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="">
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
