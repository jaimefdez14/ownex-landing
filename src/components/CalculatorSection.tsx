import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { NumericField } from "./ui/NumericField";
import { Button } from "./ui/Button";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { ModeSwitch, type ModeOption } from "./ui/ModeSwitch";
import { CapitalCostChart } from "./CapitalCostChart";
import {
  FIXED_COST_HIGH,
  FIXED_COST_LOW,
  estimateCapital,
  roundToThousand,
} from "../lib/capitalEstimate";
import {
  CUPON_FIJO_POR_DEFECTO,
  CUPON_VARIABLE_POR_DEFECTO,
  DEBT_FIXED_COST_HIGH,
  DEBT_FIXED_COST_LOW,
  PLAZO_POR_DEFECTO,
  QUIEBRO_MANTENIMIENTO,
  TRAMOS_PLAZO,
  TRAMOS_CUPON_FIJO,
  TRAMOS_CUPON_VARIABLE,
  estimateDebt,
  totalCostRangeForGross,
} from "../lib/debtEstimate";
import { useCopy, useLocale, type Localized } from "../i18n/locale";
import { useFormat } from "../i18n/format";
import {
  PREMONEY_POR_DEFECTO,
  TICKET_POR_DEFECTO,
  TRAMOS_INVERSORES,
  useInvestors,
} from "../lib/useScenario";
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
 * La lógica de negocio vive aparte, en `lib/capitalEstimate.ts` (equity) y
 * `lib/debtEstimate.ts` (deuda): aquí solo hay estado de formulario y
 * presentación.
 *
 * DOS MODALIDADES DESDE EL 04/09/2026: EQUITY Y DEUDA
 * ===================================================
 *
 * Petición de Jaime: la misma calculadora tenía que contestar también "cuánto me
 * sale financiarme con deuda en vez de cediendo equity", con un control que
 * dejara pasar de una a otra sin recargar nada.
 *
 * QUÉ SE COMPARTE Y QUÉ NO. Las dos modalidades preguntan lo mismo por el lado de
 * la comunidad (cuántos inversores y con qué ticket medio) porque el capital
 * captable no depende del instrumento: depende de la gente. A partir de ahí se
 * separan, y se separan del todo:
 *
 *   equity  pregunta la valoración pre-money y responde con la dilución.
 *   deuda   pregunta el cupón anual y el plazo, y responde con el coste efectivo
 *           anual, que es el equivalente exacto de la dilución en el otro lado:
 *           la magnitud con la que un fundador decide si le compensa.
 *
 * Por eso el número de inversores y el ticket sobreviven al conmutar y el resto
 * no: cambiar de instrumento no cambia el tamaño de tu comunidad.
 *
 * EL GRÁFICO ES EL MISMO EN LAS DOS, y es deliberado. Mismos ejes y misma escala,
 * lo único que cambia es la función que dibuja la banda; en equity es el coste de
 * estructurar y en deuda el coste total de la financiación durante el plazo. Al
 * conmutar, lo que se ve es la banda inclinándose, y esa inclinación ES la
 * diferencia entre los dos instrumentos: el equity cuesta una vez, la deuda cuesta
 * cada año. Con dos gráficos distintos no habría nada que comparar.
 *
 * LO QUE LA COMPARACIÓN NO PUEDE HACER, y conviene tenerlo claro antes de tocar
 * esta pantalla: los dos costes no son la misma magnitud. En deuda el eje lleva la
 * factura entera, porque todo lo que se paga son euros. En equity no puede
 * llevarla, porque lo que de verdad se paga allí es propiedad, y eso no tiene
 * precio en el eje Y: por eso la dilución sigue siendo una cifra aparte y no un
 * sumando. Poner las dos bandas en el mismo dibujo diría que el equity es más
 * barato, y no es que sea más barato: es que su precio está en otra unidad.
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
 *
 * La modalidad de deuda respeta esa misma regla: en pantalla van tres cifras y la
 * gráfica, y el correo lleva los supuestos y el desglose de lo que se devuelve.
 */

/*
  LOS SUPUESTOS DE PARTIDA SE IMPORTAN - 29/08/2026.

  Estaban escritos aqui. Desde que el cebo del hero estima con el mismo ticket
  medio, los dos tienen que salir del mismo sitio o el dia que alguien cambie uno
  la cifra que promete la primera pantalla dejara de ser la que se encuentra al
  llegar aqui. Viven en `lib/useScenario.ts`, con el estado compartido.

  Los de deuda (cupon y plazo) viven en `lib/debtEstimate.ts`, al lado del modelo
  que los usa, y salen de la pestana `Cliente-Deuda` del modelo financiero.
*/
const DEFAULTS = { avgTicket: TICKET_POR_DEFECTO, preMoney: PREMONEY_POR_DEFECTO };

type Modalidad = "equity" | "deuda";

/*
  Los rotulos son las dos palabras que un fundador usa, no las dos que serian
  correctas en una escritura. "Equity" convive ya con "accionista" en el resto del
  sitio (ver la nota de `data/faq.ts`, donde se dice que aqui se usa el termino
  divulgativo y cual es la posicion juridica real).
*/
const MODALIDADES: Localized<ModeOption<Modalidad>[]> = {
  es: [
    { value: "equity", label: "Equity" },
    { value: "deuda", label: "Deuda" },
  ],
  en: [
    { value: "equity", label: "Equity" },
    { value: "deuda", label: "Debt" },
  ],
};

/*
  Una linea por modalidad, y las dos dicen lo mismo con el signo cambiado: que se
  entrega y que no. Es la comparacion entera en dos frases, y es lo que hace que el
  conmutador ensene algo aunque nadie llegue a tocar un campo.
*/
type Copy = {
  modeEquity: string;
  modeDebt: string;
  modeLabel: string;
  explainEquity: string;
  explainDebt: string;
  eyebrow: string;
  title: string;
  lede: string;
  incompleteTitle: string;
  incompleteBody: string;
  raisable: string;
  effectiveAnnual: string;
  dilution: string;
  issuanceCosts: string;
  estimatedCost: string;
  to: string;
  repayBefore: string;
  /* La preposicion del plazo: "en 3 años" / "over 3 years". */
  repayIn: string;
  repayAfter: string;
  investors: string;
  investorsHint: string;
  investorsPresets: string;
  ticket: string;
  ticketPresets: string;
  couponFixed: string;
  couponFixedPresets: string;
  couponVariable: string;
  couponVariablePresets: string;
  term: string;
  preMoney: string;
  preMoneyHint: string;
  preMoneyPresets: string;
  chartDebtTitle: string;
  chartDebtShort: string;
  chartDebtAxisY: string;
  chartDebtCard: string;
  chartDebtConcept: string;
  disclaimerDebt: string;
  disclaimerEquity: string;
  emailInvalid: string;
  sendError: string;
  sent: string;
  capture: string;
  emailLabel: string;
  emailPlaceholder: string;
  send: string;
  year: string;
  years: string;
};

/*
  EL SIMULADOR EN INGLES - 16/09/2026.

  Tres cosas que no son traduccion literal y que estan decididas aqui:

   - "Capital captable" -> "Raisable capital". Es un rotulo de dos palabras en una
     celda de resultados, asi que no cabe la explicacion ("capital you could raise");
     "raisable" dice exactamente eso y entra en el mismo ancho.
   - "Gastos de emision" -> "Issuance costs". Es el termino contable, igual que en
     espanol: bajo el plan contable estos gastos se reparten a lo largo de la vida del
     instrumento para calcular su coste efectivo, que es la celda de al lado. Se
     descarto "upfront costs", que se lee como un adjetivo y pierde esa relacion.
   - "Coste efectivo anual" -> "Effective annual cost", no "effective annual rate":
     no es solo el tipo del cupon, incluye el mantenimiento del registro y los gastos
     de emision, y eso es un COSTE. La nota al pie lo define entero en los dos
     idiomas.

  Las cifras no estan aqui: las pinta `useFormat()` con el formato del idioma.
*/
const COPY: Localized<Copy> = {
  es: {
    modeEquity: "Equity",
    modeDebt: "Deuda",
    modeLabel: "Tipo de financiación",
    explainEquity:
      "Tu comunidad entra como accionista: no devuelves el capital, cedes una parte de la propiedad.",
    explainDebt:
      "Tu comunidad presta: no cedes propiedad, devuelves el principal con cupón fijo más variable.",
    eyebrow: "Simulador de emisión",
    title: "¿Cuánto capital puede aportar tu comunidad?",
    lede: "Elige cómo quieres financiarte, introduce tus supuestos y obtén una estimación del capital captable y de lo que cuesta estructurar la operación.",
    incompleteTitle: "Indica cuántos inversores estimas y su ticket medio.",
    incompleteBody: "Con esos dos datos calculamos el capital captable y el coste de la operación.",
    raisable: "Capital captable",
    effectiveAnnual: "Coste efectivo anual",
    dilution: "Dilución",
    issuanceCosts: "Gastos de emisión",
    estimatedCost: "Coste estimado",
    to: "a ",
    repayBefore: "Devolverás",
    repayIn: "en",
    repayAfter: ", principal incluido.",
    investors: "Inversores estimados",
    investorsHint: "Clientes de tu base que estimas que suscribirían.",
    investorsPresets: "Número de inversores sugerido",
    ticket: "Ticket medio por inversor",
    ticketPresets: "Ticket medio sugerido",
    couponFixed: "Cupón fijo",
    couponFixedPresets: "Cupón fijo sugerido",
    couponVariable: "Tramo variable",
    couponVariablePresets: "Tramo variable sugerido",
    term: "Plazo del instrumento",
    preMoney: "Valoración pre-money",
    preMoneyHint: "Si aún no está cerrada, indica la valoración de referencia que estés manejando.",
    preMoneyPresets: "Valoración sugerida",
    chartDebtTitle: "Coste total de la financiación según el capital captado",
    chartDebtShort: "Coste total vs. capital",
    chartDebtAxisY: "Coste total, en euros",
    chartDebtCard: "Coste total",
    chartDebtConcept: "coste total de la financiación durante el plazo",
    disclaimerDebt:
      "Estimación orientativa. La gráfica representa los euros pagados a lo largo del plazo. El coste efectivo anual es la tasa que iguala el importe neto realmente percibido con el valor actual de los pagos comprometidos: el cupón al inversor, el mantenimiento del registro digital y los gastos de emisión. El extremo inferior de la horquilla contempla únicamente el cupón fijo; el superior incorpora además el componente variable. Esta información no constituye un compromiso de captación ni una oferta de valores.",
    disclaimerEquity:
      "Estimación orientativa basada en los supuestos introducidos. No constituye un compromiso de captación ni una oferta de valores.",
    emailInvalid: "Introduce una dirección de correo válida.",
    sendError: "No se ha podido enviar. Vuelve a intentarlo en unos minutos.",
    sent: "Desglose enviado. Lo recibirás en unos minutos.",
    capture: "Recibe el desglose completo por correo",
    emailLabel: "Email",
    emailPlaceholder: "tu@empresa.com",
    send: "Enviar el desglose",
    year: "año",
    years: "años",
  },
  en: {
    modeEquity: "Equity",
    modeDebt: "Debt",
    modeLabel: "Type of financing",
    explainEquity:
      "Your community comes in as shareholders: you don't repay the capital, you give up a share of the ownership.",
    explainDebt:
      "Your community lends: you give up no ownership, you repay the principal with a fixed coupon plus a variable one.",
    eyebrow: "Issuance simulator",
    title: "How much capital can your community contribute?",
    lede: "Choose how you want to raise the money, enter your assumptions and get an estimate of the capital you can raise and of what it costs to structure the deal.",
    incompleteTitle: "Enter how many investors you expect and their average ticket.",
    incompleteBody: "With those two figures we calculate the raisable capital and the cost of the deal.",
    raisable: "Raisable capital",
    effectiveAnnual: "Effective annual cost",
    dilution: "Dilution",
    issuanceCosts: "Issuance costs",
    estimatedCost: "Estimated cost",
    to: "to ",
    repayBefore: "You will repay",
    repayIn: "over",
    repayAfter: ", principal included.",
    investors: "Estimated investors",
    investorsHint: "Customers in your base you expect would subscribe.",
    investorsPresets: "Suggested number of investors",
    ticket: "Average ticket per investor",
    ticketPresets: "Suggested average ticket",
    couponFixed: "Fixed coupon",
    couponFixedPresets: "Suggested fixed coupon",
    couponVariable: "Variable coupon",
    couponVariablePresets: "Suggested variable coupon",
    term: "Term of the instrument",
    preMoney: "Pre-money valuation",
    preMoneyHint: "If it isn't closed yet, enter the reference valuation you're working with.",
    preMoneyPresets: "Suggested valuation",
    chartDebtTitle: "Total cost of the financing by capital raised",
    chartDebtShort: "Total cost vs. capital",
    chartDebtAxisY: "Total cost, in euros",
    chartDebtCard: "Total cost",
    chartDebtConcept: "total cost of the financing over the term",
    disclaimerDebt:
      "Indicative estimate. The chart shows the euros paid over the term. The effective annual cost is the rate that equates the net amount actually received with the present value of the committed payments: the coupon paid to the investor, the maintenance of the digital register and the issuance costs. The lower end of the range assumes only the fixed coupon is paid; the upper end also includes the variable component. This information is not a fundraising commitment or an offer of securities.",
    disclaimerEquity:
      "Indicative estimate based on the assumptions entered. It is not a fundraising commitment or an offer of securities.",
    emailInvalid: "Enter a valid email address.",
    sendError: "It couldn't be sent. Please try again in a few minutes.",
    sent: "Breakdown sent. You'll get it in a few minutes.",
    capture: "Get the full breakdown by email",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    send: "Send the breakdown",
    year: "year",
    years: "years",
  },
};

/**
 * Tamaños de base con los que arrancar sin teclear.
 *
 * La columna de entradas eran tres campos numéricos y nada más: en escritorio
 * dejaba unos 700px de tarjeta vacía al lado de una columna de resultados llena,
 * y sobre todo obligaba a inventarse un número de inversores antes de ver nada.
 * Estos cuatro atajos son los tamaños típicos de una base de accionistas de
 * marca, y dan la primera respuesta de un toque.
 */
/* Compartidos con el cebo del hero, ver `lib/useScenario.ts`. */
const INVESTOR_PRESETS = TRAMOS_INVERSORES;

/*
  Atajos tambien para el ticket y la valoracion. Solo los tenia el numero de
  inversores, asi que los otros dos campos seguian obligando a inventarse una
  cifra y teclearla. Los valores son los tramos tipicos de una emision dirigida
  a comunidad de marca.
*/
const TICKET_PRESETS = [250, 500, 1500, 5000];
const PREMONEY_PRESETS = [1000000, 2000000, 5000000, 10000000];

/*
  La abreviatura de importes ("1,5 M€" / "€1.5M") vive en `lib/formatNumber.ts`, con
  una version por idioma: el separador decimal y el sitio del simbolo cambian con el
  idioma, asi que no puede ser una funcion suelta de este fichero.

  El plazo en anos ("3 años" / "3 years") se arma dentro del componente, que es donde
  hay copy e idioma.
*/

/*
  LA VARIANTE COMPACTA - 05/09/2026.

  Los dos cupones comparten una fila de dos columnas, asi que cada terna de pastillas
  dispone de unos 154px. Con el relleno de siempre (`px-4`) una pastilla de "5 %" mide 52
  y tres no caben: 156 mas los huecos se van a 172.

  LAS TRES SE REPARTEN EL ANCHO (`flex-1`) EN VEZ DE MEDIR LO QUE MIDE SU TEXTO, y esa
  es la parte que importa. Apretar el relleno a `px-3` parecia bastar -- 44px por
  pastilla, 148 de 154 -- pero medido en telefono seguian partiendose en dos renglones:
  alli `text-caption` sube de 12 a 13px (ver `index.css`), la pastilla se va a 46 y las
  tres suman 154 sobre 152 disponibles. Por seis pixeles.

  Con `flex-1` el ancho deja de depender del texto: las tres se reparten lo que haya,
  sea cual sea el tamano de letra, el idioma o el ancho de pantalla. Una fila, siempre,
  por construccion y no por que las cuentas salgan. Y quedan ademas alineadas con el
  campo del que cuelgan, que es lo que hace evidente a cual pertenecen.

  Y el reparto lleva SUELO (`basis-[40px]`), no solo `flex-1`. Sin el, a 320px de
  pantalla la media columna se queda en 122 y las tres pastillas se encogian a 34px de
  ancho. Con el suelo, cuando las tres no caben en un renglon se pasan a dos en vez de
  encogerse: el ancho minimo esta garantizado y el renglon unico es lo que se cede, que
  es el orden correcto de prioridades.

  El suelo son 40 y no 44 porque el aire entre las dos ternas subio a 24px para que se
  lean como dos grupos y no como una fila de seis, y eso deja 146px por terna en un
  telefono de 390. A 44 de suelo no caben (148) y se parten en dos renglones; a 40 si, y
  las pastillas se pintan a 43px. Es un pixel por debajo del objetivo tactil de 44 y muy
  por encima del minimo de 24 que la rubrica pide en web, asi que se cede ese pixel a
  cambio de que los dos grupos se distingan, que es lo que de verdad se estaba fallando.
*/
function Presets({
  valores,
  actual,
  onElegir,
  etiqueta,
  formato,
  compacto = false,
}: {
  valores: number[];
  actual: number;
  onElegir: (valor: number) => void;
  etiqueta: string;
  /* Siempre explicito: el formato de una cifra depende del idioma (`useFormat`). */
  formato: (valor: number) => string;
  compacto?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label={etiqueta}
    >
      {valores.map((valor) => (
        <button
          key={valor}
          type="button"
          aria-pressed={actual === valor}
          onClick={() => onElegir(valor)}
          className={
            actual === valor
              ? `min-h-touch rounded-full bg-accent-soft ${compacto ? "flex-1 basis-[40px] px-1" : "px-4"} text-caption font-medium tabular text-on-accent-soft transition-colors`
              : `min-h-touch rounded-full border border-border bg-card-hover ${compacto ? "flex-1 basis-[40px] px-1" : "px-4"} text-caption tabular text-text-secondary transition-colors hover:border-emerald-400/25 hover:text-foreground`
          }
        >
          {formato(valor)}
        </button>
      ))}
    </div>
  );
}

/** Rótulo de un grupo de atajos que no acompaña a ningún campo, como el del plazo. */
function EtiquetaGrupo({ children }: { children: string }) {
  return (
    <p className="mb-2 block text-micro uppercase text-text-secondary" aria-hidden="true">
      {children}
    </p>
  );
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function CalculatorSection() {
  const t = useCopy(COPY);
  const f = useFormat();
  const modalidades = useCopy(MODALIDADES);

  /** "3 años" / "3 years", con el singular resuelto por si algun dia hay un tramo de 1. */
  const enAnios = (valor: number) => `${f.int(valor)} ${valor === 1 ? t.year : t.years}`;
  /*
    EL NUMERO DE INVERSORES NO ES ESTADO LOCAL - 29/08/2026.

    Lo comparte con el cebo del hero (`HeroTeaser`), asi que quien toque "250"
    arriba llega aqui con 250 puesto y no con el valor por defecto. El resto del
    escenario (ticket, valoracion, cupon y plazo) si es local: el cebo no los
    pregunta.

    La firma es la de `useState`, asi que todo lo que ya llamaba a `setInvestors`
    (los atajos, las pastillas, el campo) sigue igual.
  */
  const [investors, setInvestors] = useInvestors();
  const [avgTicket, setAvgTicket] = useState(DEFAULTS.avgTicket);
  const [preMoney, setPreMoney] = useState(DEFAULTS.preMoney);

  /*
    LA MODALIDAD ES ESTADO LOCAL, a diferencia del numero de inversores. El cebo
    del hero no la pregunta y ninguna otra seccion la necesita, asi que sacarla a
    un almacen compartido seria maquinaria sin nadie al otro lado.
  */
  const [modalidad, setModalidad] = useState<Modalidad>("equity");
  /*
    EL CUPON SON DOS CAMPOS, NO UNO - 05/09/2026, decisión de Jaime: la deuda de
    Ownex siempre lleva un tramo fijo y uno variable. El porqué de los valores de
    partida y de que ninguna de las cinco emisiones comparables haga esto, en
    `lib/debtEstimate.ts`.
  */
  const [couponFixed, setCouponFixed] = useState(CUPON_FIJO_POR_DEFECTO);
  const [couponVariable, setCouponVariable] = useState(CUPON_VARIABLE_POR_DEFECTO);
  const [years, setYears] = useState(PLAZO_POR_DEFECTO);

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const interacted = useRef(false);
  const renderedAt = useRef(0);

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const esDeuda = modalidad === "deuda";
  const locale = useLocale();
  const esIngles = locale === "en";

  const result = useMemo(
    () =>
      estimateCapital({
        investors: Math.max(1, investors),
        avgTicket: Math.max(1, avgTicket),
        preMoney: Math.max(0, preMoney),
      }),
    [investors, avgTicket, preMoney],
  );

  const deuda = useMemo(
    () =>
      estimateDebt({
        investors: Math.max(1, investors),
        avgTicket: Math.max(1, avgTicket),
        couponFixed,
        couponVariable,
        years,
      }),
    [investors, avgTicket, couponFixed, couponVariable, years],
  );

  /*
    La banda que dibuja el grafico en deuda. Va en `useCallback` porque el grafico
    la usa tambien como dependencia del trazado inicial: con una funcion nueva en
    cada render, el trazo se rearmaria continuamente.
  */
  const bandaDeuda = useCallback(
    (g: number) => totalCostRangeForGross(g, { couponFixed, couponVariable, years }),
    [couponFixed, couponVariable, years],
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

  const applyCouponFixed = (value: number) => {
    onInteract();
    setCouponFixed(value);
    track("calculator_shortcut", { lever: "cupon_fijo", value });
  };

  const applyCouponVariable = (value: number) => {
    onInteract();
    setCouponVariable(value);
    track("calculator_shortcut", { lever: "cupon_variable", value });
  };

  const applyYears = (value: number) => {
    onInteract();
    setYears(value);
    track("calculator_shortcut", { lever: "plazo", value });
  };

  const applyModalidad = (value: Modalidad) => {
    onInteract();
    setModalidad(value);
    track("calculator_mode", { modalidad: value });
  };

  /*
    EL CUERPO DEL CORREO SE ARMA POR MODALIDAD.

    Es lo unico que el lead recibe con el detalle que la pantalla ya no ensena, asi
    que lleva los supuestos introducidos Y como se compone el coste. En deuda
    ademas lleva lo que de verdad se devuelve, que es la cifra que ninguna otra
    parte del circuito puede reconstruir despues.
  */
  const mensajeDelLead = () => {
    if (esDeuda) {
      /*
        EN EL IDIOMA DEL LEAD, que es el idioma en el que ha simulado. Va a
        Mailchimp como campo del contacto (`api/lead.ts`) y es lo que el lead
        recibe, asi que un desglose en espanol para quien entro por `/en/` seria
        peor que no mandarlo.
      */
      if (esIngles) {
        return (
          `Issuance simulation (debt): ` +
          `${f.int(investors)} investors, average ticket ${f.euros(avgTicket)}, ` +
          `fixed coupon ${f.percent(couponFixed)} a year plus a variable component of ` +
          `${f.percent(couponVariable)}, term ${enAnios(years)}. ` +
          `Raisable capital: ${f.euros(deuda.gross)}. ` +
          `Issuance costs: ${f.euros(deuda.setupLow)} to ${f.euros(deuda.setupHigh)} ` +
          `(fixed floor of ${f.euros(DEBT_FIXED_COST_LOW)} to ${f.euros(DEBT_FIXED_COST_HIGH)} ` +
          `plus a success fee on the capital raised). ` +
          `Fixed coupon over the term: ${f.euros(deuda.interestFixed)}` +
          (couponVariable > 0
            ? `, plus up to ${f.euros(deuda.interestVariable)} of variable component`
            : "") +
          `. Total to repay: ${f.euros(deuda.repaymentLow)}` +
          (couponVariable > 0 ? ` to ${f.euros(deuda.repaymentHigh)}` : "") +
          `. ` +
          `Estimated effective annual cost: ${f.percentRange(deuda.annualRateLow, deuda.annualRateHigh)}.`
        );
      }

      return (
        `Simulación de emisión (deuda): ` +
        `${f.int(investors)} inversores, ticket medio ${f.euros(avgTicket)}, ` +
        `cupón fijo ${f.percent(couponFixed)} anual más tramo variable ` +
        `${f.percent(couponVariable)}, plazo ${enAnios(years)}. ` +
        `Capital captable: ${f.euros(deuda.gross)}. ` +
        `Gastos de emisión: ${f.euros(deuda.setupLow)} a ${f.euros(deuda.setupHigh)} ` +
        `(suelo fijo de ${f.euros(DEBT_FIXED_COST_LOW)} a ${f.euros(DEBT_FIXED_COST_HIGH)} ` +
        `más comisión de éxito sobre el capital captado). ` +
        `Cupón fijo a lo largo del plazo: ${f.euros(deuda.interestFixed)}` +
        (couponVariable > 0
          ? `, más hasta ${f.euros(deuda.interestVariable)} de tramo variable`
          : "") +
        `. Total a devolver: ${f.euros(deuda.repaymentLow)}` +
        (couponVariable > 0 ? ` a ${f.euros(deuda.repaymentHigh)}` : "") +
        `. ` +
        /* La misma horquilla que se pinta en pantalla, con la misma forma. */
        `Coste efectivo anual estimado: ${f.percentRange(deuda.annualRateLow, deuda.annualRateHigh)}.`
      );
    }

    if (esIngles) {
      return (
        `Issuance simulation (equity): ` +
        `${f.int(investors)} investors, average ticket ${f.euros(avgTicket)}, ` +
        `pre-money valuation ${f.euros(preMoney)}. ` +
        `Raisable capital: ${f.euros(result.gross)}. ` +
        `Estimated cost: ${f.euros(result.costLow)} to ${f.euros(result.costHigh)} ` +
        `(fixed floor of ${f.euros(FIXED_COST_LOW)} to ${f.euros(FIXED_COST_HIGH)} ` +
        `plus a success fee on the capital raised). ` +
        (preMoney > 0 ? `Dilution: ${f.percentDecimal(result.dilution)}.` : "")
      );
    }

    return (
      `Simulación de emisión (equity): ` +
      `${f.int(investors)} inversores, ticket medio ${f.euros(avgTicket)}, ` +
      `valoración pre-money ${f.euros(preMoney)}. ` +
      `Capital captable: ${f.euros(result.gross)}. ` +
      `Coste estimado: ${f.euros(result.costLow)} a ${f.euros(result.costHigh)} ` +
      `(suelo fijo de ${f.euros(FIXED_COST_LOW)} a ${f.euros(FIXED_COST_HIGH)} ` +
      `más comisión de éxito sobre el capital captado). ` +
      (preMoney > 0 ? `Dilución: ${f.percentDecimal(result.dilution)}.` : "")
    );
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
      setEmailError(t.emailInvalid);
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
          /*
            La modalidad va como campo propio ademas de dentro del mensaje: en el
            registro de leads se puede filtrar por ella, y en la audiencia entra
            como etiqueta. Un dato que solo vive dentro de un parrafo no se puede
            segmentar despues (ver `api/lead.ts`).
          */
          modalidad,
          idioma: locale,
          mensaje: mensajeDelLead(),
          ...sourceProperties(),
        }),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus("sent");
      track("calculator_lead_submit", { modalidad });
    } catch (error) {
      setStatus("idle");
      setSubmitError(t.sendError);
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
      que arreglar fue la grafica, que llevaba dos colores a fuego y por tanto no
      seguia al tema; ver `CapitalCostChart.tsx`.

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
        <div className="mb-6 max-w-[800px] sm:mb-10">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="calculator-title"
            delay={60}
            className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            {t.title}
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body text-text-secondary sm:text-body-lg">
            {t.lede}
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
        <Reveal delay={160} className="glass-card p-5 sm:p-6 md:p-8">
          {/*
            EL CONMUTADOR ABRE LA TARJETA - 04/09/2026.

            Va arriba del todo y no al lado de los campos porque no es un supuesto
            mas: es lo que decide QUE se pregunta debajo y QUE se responde encima.
            Un control que reescribe media tarjeta tiene que estar por encima de la
            parte que reescribe, o se lee como si dependiera de ella.

            La linea de al lado cambia con el, y es la que hace que el control
            ensene algo aunque nadie toque un campo: dice lo que se entrega en cada
            modalidad, que es la unica diferencia que de verdad importa antes de
            mirar una sola cifra.
          */}
          <div className="mb-6 flex flex-col gap-3 border-b border-border pb-6 sm:mb-8 sm:pb-8 lg:flex-row lg:items-center lg:gap-6">
            <ModeSwitch
              options={modalidades}
              value={modalidad}
              onChange={applyModalidad}
              ariaLabel={t.modeLabel}
              className="shrink-0"
            />
            <p className="max-w-reading text-caption text-text-secondary sm:text-body">
              {esDeuda ? t.explainDebt : t.explainEquity}
            </p>
          </div>

          {/*
            LAS TRES CIFRAS SUBEN A UNA FILA PROPIA, A ANCHO COMPLETO - 28/08/2026.

            Jaime: los tres numeros no tenian el mismo tamano. Era verdad, y al
            medirlo salio que el problema no era la letra sino el sitio. Capital y
            dilucion iban a 28px desde `md`; el coste se habia quedado en 20px
            porque es lo unico que cabia: son DOS importes y un nexo en una celda
            pensada para uno.

            Medido: dentro de la columna de resultados la celda daba 198px, y el
            peor caso del rango ("688.000 € a 1.817.000 €", que sale con 250
            inversores al tope de ticket) necesita 240px a 20px y 336px a 28px. O
            sea que a NINGUN tamano cabia. Igualar la letra sin tocar la maqueta
            solo habria movido el corte de sitio.

            Asi que las cifras se salen de la columna y se llevan el ancho entero
            de la tarjeta, en una fila propia encima de las entradas. Dos ventajas
            ademas de la que se pedia: la respuesta va primero y las entradas
            despues, que es el orden natural de un simulador, y la grafica se queda
            sola en su columna con el sitio que necesita.

            En deuda la fila lleva las mismas tres celdas con el mismo reparto: el
            capital, el coste (que es el que necesita el doble de ancho) y, en el
            sitio de la dilucion, el coste efectivo anual. La maqueta no cambia
            porque la forma de la respuesta tampoco: una cifra, un rango ancho y
            una cifra.
          */}
          {/*
            COMPACTADO EN TELEFONO - 29/08/2026.

            La fila de resultados iba en una columna (`grid gap-6`, cada cifra a
            20px con su rotulo a 11px y `mt-2`), y con el `mb-8 pb-8` del separador
            se comia ~230px antes de la primera entrada. En una tarjeta que ya
            mide dos pantallas y pico, es la primera grasa que sobra.

            Ahora en telefono es una reticula de dos columnas: capital y dilucion
            comparten fila (los dos importes cortos), y el coste, que lleva un
            rango de dos importes, se lleva la fila entera debajo (`col-span-2`).
            Ninguna cifra encoge y el bloque baja de ~230 a ~150px. Desde `lg`
            vuelve la fila unica de tres columnas de anchos distintos de siempre.
          */}
          <div
            role="status"
            className="mb-6 border-b border-border pb-6 sm:mb-8 sm:pb-8"
          >
            {escenarioIncompleto ? (
              <div className="flex min-h-[72px] flex-col justify-center sm:min-h-[96px]">
                <p className="text-body text-foreground">{t.incompleteTitle}</p>
                <p className="mt-1 text-caption text-text-tertiary">{t.incompleteBody}</p>
              </div>
            ) : (
              <>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)_minmax(0,1fr)] lg:gap-4">
                  <div>
                    <dt className="text-micro uppercase tracking-wide text-text-secondary">
                      {t.raisable}
                    </dt>
                    <dd className="mt-1 text-title tabular text-foreground sm:mt-2 lg:text-headline">
                      <AnimatedNumber
                        value={esDeuda ? deuda.gross : result.gross}
                        format={f.euros}
                      />
                    </dd>
                  </div>

                  {esDeuda ? (
                    <div className="lg:order-3">
                      <dt className="text-micro uppercase tracking-wide text-text-secondary">
                        {t.effectiveAnnual}
                      </dt>
                      {/*
                        Es el equivalente de la dilucion en deuda, y por eso ocupa
                        su misma celda: la cifra que dice, en una sola magnitud, lo
                        que cuesta el dinero. Va en horquilla porque sus dos
                        sumandos inciertos (el trabajo legal y el mantenimiento
                        anual) lo son; ver `debtEstimate.ts`.
                      */}
                      {/*
                        EL GUION VA EN TINTA TERCIARIA, como el "a" de la celda de al
                        lado. En las dos celdas lo que se lee son las cifras y el nexo
                        es andamiaje; pintarlos igual de fuerte hacia que la horquilla
                        se leyera como una sola cifra rara. Fuera de `tabular` a
                        proposito: con ancho de digito el guion se separa tanto de los
                        numeros que parece un signo menos suelto.
                      */}
                      <dd className="mt-1 whitespace-nowrap text-title tabular text-foreground sm:mt-2 lg:text-headline">
                        {f.percentDecimal(deuda.annualRateLow).replace(/\s*%$/, "")}
                        <span className="px-[3px] font-normal [font-variant-numeric:normal] text-text-tertiary">
                          -
                        </span>
                        {f.percentDecimal(deuda.annualRateHigh)}
                      </dd>
                    </div>
                  ) : preMoney > 0 ? (
                    <div className="lg:order-3">
                      <dt className="text-micro uppercase tracking-wide text-text-secondary">
                        {t.dilution}
                      </dt>
                      <dd className="mt-1 text-title tabular text-foreground sm:mt-2 lg:text-headline">
                        {f.percentDecimal(result.dilution)}
                      </dd>
                    </div>
                  ) : null}

                  <div className="col-span-2 lg:order-2 lg:col-span-1">
                    <dt className="text-micro uppercase tracking-wide text-text-secondary">
                      {/*
                        EL ROTULO DE ESTA CELDA, TERCERA VERSION - 05/09/2026.

                        Fue "Coste de estructurar" y luego "Coste inicial". Jaime señaló
                        las dos: la primera es jerga de quien monta la operación, y la
                        segunda no dice DE QUÉ es el coste ni si va dentro de lo que
                        cuesta el instrumento.

                        QUÉ ES ESTA CIFRA, exactamente: lo que la marca paga UNA VEZ para
                        poder emitir. Dos familias dentro, y las dos se pagan al emitir y
                        no después: los costes de terceros (abogados, validación de la
                        entidad autorizada, alta en el registro digital, verificación de
                        inversores) y la comisión de Ownex sobre el capital captado. No
                        lleva ni el cupón ni el mantenimiento anual del registro, que son
                        lo que se paga cada año.

                        POR QUÉ "GASTOS DE EMISIÓN" Y NO OTRA COSA. Es el término con el
                        que estos costes se llaman en un documento de la emisión y en
                        contabilidad, y eso aquí no es una cuestión de estilo: bajo el
                        plan contable los gastos de emisión de una deuda se reparten a lo
                        largo de la vida del instrumento para calcular su coste efectivo,
                        que es EXACTAMENTE lo que hace la celda de al lado. O sea que el
                        nombre correcto es además el que deja ver la relación entre las
                        dos cifras: los gastos de emisión no son un coste aparte del
                        bono, son la parte del coste del bono que se paga por adelantado.

                        Se descartaron: "Coste de la emisión" (se lee como el coste de la
                        operación ENTERA, cupón incluido, que es justo la duda que hay que
                        despejar), "Costes one-off" (así los llama el modelo por dentro,
                        pero es un anglicismo) y "Comisiones y gastos" (largo, y
                        "comisiones" suena a banca).

                        La nota al pie del gráfico dice la relación en palabras, para que
                        no dependa de que alguien conozca el término.
                      */}
                      {esDeuda ? t.issuanceCosts : t.estimatedCost}
                    </dt>
                    {/*
                      El `whitespace-nowrap` sigue en cada numero por separado y no en
                      el parrafo entero: la fila ya garantiza el sitio, pero si algun
                      dia el rango crece, el corte tiene que caer delante del nexo y
                      nunca por dentro de un importe.
                    */}
                    <dd className="mt-1 text-title tabular text-foreground sm:mt-2 lg:text-headline">
                      <span className="whitespace-nowrap">
                        <AnimatedNumber
                          value={roundToThousand(esDeuda ? deuda.setupLow : result.costLow)}
                          format={f.euros}
                        />
                      </span>{" "}
                      <span className="whitespace-nowrap">
                        <span className="font-normal text-text-tertiary">{t.to}</span>
                        <AnimatedNumber
                          value={roundToThousand(esDeuda ? deuda.setupHigh : result.costHigh)}
                          format={f.euros}
                        />
                      </span>
                    </dd>
                  </div>
                </dl>

                {/*
                  LA DEVOLUCION, EN UNA LINEA - 04/09/2026.

                  No es una cuarta cifra en la fila y es a proposito: la fila
                  contesta "cuanto entra y cuanto cuesta", que es lo que se decide
                  de un vistazo, y esto contesta "cuanto sale y cuando", que es la
                  consecuencia. Meterla arriba habria roto el reparto de tres
                  celdas que la maqueta tiene medido al pixel, y sobre todo habria
                  puesto al mismo nivel una cifra que no es del mismo momento: el
                  coste se paga al emitir y esto se paga durante los anos
                  siguientes.
                */}
                {/*
                  LA TINTA SUBE UN ESCALON - 04/09/2026, en la revisión de formato.

                  Iba entera en terciario, que es la tinta de las notas al pie y de
                  los avisos legales, y aquí dentro hay tres cifras de las que
                  deciden: cuánto se devuelve, en cuánto tiempo y cuánto de eso es
                  cupón. Medido sobre la captura, se leía como el descargo de
                  responsabilidad de debajo del gráfico y no como parte de la
                  respuesta.

                  Ahora la frase va en secundario y los tres importes en primario y
                  tabulares, así que la línea se explora saltando de número a
                  número, que es como se lee. Sigue siendo `text-caption` (12px): no
                  compite con la fila de cifras de arriba, que es lo correcto,
                  porque esto es la consecuencia y aquello la respuesta.
                */}
                {/*
                  ACORTADA A UNA HORQUILLA - 05/09/2026, al comprimir la tarjeta.

                  Decía el desglose entero ("150.000 € de principal más 22.500 € de cupón
                  fijo. Con el tramo variable completo, 186.000 €"), que en teléfono son
                  TRES líneas, y las tres para decir cifras que o están en la fila de
                  arriba (el capital) o se deducen de ella. Lo único que no está en
                  ningún otro sitio es cuánto sale por la puerta, y eso es la horquilla.
                */}
                {esDeuda ? (
                  <p className="mt-4 text-caption text-text-secondary">
                    {t.repayBefore}{" "}
                    <span className="tabular font-medium text-foreground">
                      {f.euros(deuda.repaymentLow)}
                    </span>
                    {couponVariable > 0 ? (
                      <>
                        {` ${t.to}`}
                        <span className="tabular font-medium text-foreground">
                          {f.euros(deuda.repaymentHigh)}
                        </span>
                      </>
                    ) : null}{" "}
                    {` ${t.repayIn} ${enAnios(years)}`}
                    {t.repayAfter}
                  </p>
                ) : null}
              </>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
          {/*
            EL RITMO DE LA COLUMNA, POR SUPUESTOS - 04/09/2026.

            Era un `space-y-4` plano: campo, pastillas, pista, campo, pastillas...
            todo a 16px. Con tres supuestos ya se notaba y con los cuatro de deuda
            deja de leerse: nada dice qué fila de pastillas pertenece a qué campo,
            porque la distancia entre un campo y SUS pastillas es la misma que entre
            esas pastillas y el campo SIGUIENTE.

            Ahora cada supuesto es un bloque (12px por dentro) y los bloques se
            separan a 24px. La agrupación se ve sin necesidad de ningún borde, que es
            como se separa en esta marca, y la columna gana el escalón de jerarquía
            que le faltaba. Los dos valores siguen en la escala de 4/8.
          */}
          <div className="space-y-6">
            {/*
              `NumericField` y no `Field` con `type="number"`: ese tipo no admite
              separadores de millar, asi que las tres unicas cifras que el
              visitante ESCRIBE eran las unicas del sitio sin formato. Ver el
              docblock del componente.

              El minimo es 0 y no 1 a proposito: hay que poder vaciar el campo
              para llegar al estado "escenario incompleto" de mas abajo, que es el
              que explica que falta.
            */}
            <div className="space-y-3">
            <NumericField
              id="investors"
              label={t.investors}
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
              etiqueta={t.investorsPresets}
              formato={f.int}
            />
            {/*
              Las dos pistas de ayuda se ocultan en telefono (`hidden sm:block`).
              No aportan lo suficiente para justificar dos lineas cada una en una
              tarjeta que sobra de alto: "Clientes de tu base…" repite lo que dice
              el rotulo, y la de la valoracion cubre un caso de borde. En
              escritorio, donde el alto sobra, se quedan.
            */}
            <p className="hidden text-caption text-text-tertiary sm:block">
              {t.investorsHint}
            </p>
            </div>

            <div className="space-y-3">
            {/* El "(€)" se cae del rotulo: el simbolo va ya dentro del campo. */}
            <NumericField
              id="avg-ticket"
              label={t.ticket}
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
              etiqueta={t.ticketPresets}
              formato={f.compactEuros}
            />
            </div>

            {/*
              A PARTIR DE AQUI LAS DOS MODALIDADES PREGUNTAN COSAS DISTINTAS.

              Y no es un detalle de maquetacion: es la razon de que esto sean dos
              calculadoras y no una con un interruptor decorativo. Lo de arriba
              (cuanta gente y con que ticket) describe a la comunidad y vale para
              las dos; lo de aqui abajo describe el instrumento.
            */}
            {esDeuda ? (
              <>
                {/*
                  LOS DOS CUPONES, EN UNA FILA DE DOS COLUMNAS - 05/09/2026.

                  Petición de Jaime: la tarjeta de deuda tiene que caber en el mismo
                  espacio que la de equity, para que el conmutador no mueva la página.

                  Medido antes de tocar nada: equity dejaba la columna de entradas en
                  510px y deuda en 890, o sea que el toggle daba un salto de 414px en
                  escritorio y de 426 en teléfono (un 44 % más de tarjeta). Eso no es un
                  cambio de modalidad, es una recarga.

                  El origen del salto es que deuda pregunta CINCO cosas y equity tres, y
                  eso no se puede recortar: el cupón fijo, el variable y el plazo son los
                  tres supuestos que definen el instrumento. Así que se comprime la
                  FORMA, no las preguntas:

                   - Los dos cupones comparten fila. Son el mismo tipo de dato (un
                     porcentaje anual de una cifra) y se leen mejor juntos, porque lo
                     que importa de ellos es la PROPORCIÓN entre uno y otro.
                   - Y pierden sus pastillas de atajo. Es lo único que se sacrifica, y
                     es lo que menos cuesta: los valores útiles de un cupón caben en un
                     margen estrecho y son de una cifra, así que teclear "6" es una
                     pulsación. Las pastillas del plazo se quedan, que ahí sí ahorran
                     escribir "años".
                   - Se van las tres pistas de ayuda de estos campos. La línea de
                     referencia de mercado de aquí abajo dice más que las tres juntas y
                     ocupa una sola línea.
                */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <NumericField
                      id="coupon-fixed"
                      label={t.couponFixed}
                      suffix="%"
                      min={0}
                      /*
                        TOPES DE 15 Y 20, decisión de Jaime del 05/09/2026. Antes eran
                        30 en los dos, un número puesto a ojo que no significaba nada.
                        Los nuevos sí dicen algo: el tramo que compromete a la marca
                        pase lo que pase se acota más corto que el que se autoajusta al
                        desempeño, que es el orden correcto del riesgo.
                      */
                      max={15}
                      value={couponFixed}
                      onChange={(valor) => {
                        onInteract();
                        setCouponFixed(valor);
                      }}
                    />
                    <NumericField
                      id="coupon-variable"
                      label={t.couponVariable}
                      suffix="%"
                      min={0}
                      max={20}
                      value={couponVariable}
                      onChange={(valor) => {
                        onInteract();
                        setCouponVariable(valor);
                      }}
                    />

                    {/*
                      LOS ATAJOS VUELVEN, Y CADA UNO DEBAJO DE SU CAMPO - 05/09/2026.

                      Se habian retirado al comprimir la tarjeta y Jaime los quiere de
                      vuelta, con el mismo patron que el resto de campos. El sitio sale
                      de haber retirado la linea de referencia de mercado.

                      SON TRES Y NO CUATRO, y es lo unico que la media columna deja
                      hacer: a `px-3` caben tres pastillas en 148px de los 154
                      disponibles; la cuarta se iria a 200 y partiria la fila en dos
                      renglones, que es exactamente el alto que esta compresion existe
                      para no gastar.

                      Van dentro de la misma retícula de dos columnas que los campos, no
                      en una fila aparte: asi cada terna queda debajo de SU campo y en su
                      misma anchura, que es lo que hace evidente a cual pertenece.

                      Y LA SEPARACION ENTRE COLUMNAS SUBE A 24px (`gap-x-6`) mientras la
                      de dentro de cada terna se queda en 8. Con las dos a 12 las seis
                      pastillas se leian como UNA sola fila: al repartirse el ancho, cada
                      terna llena su media columna entera, asi que el unico limite entre
                      grupos era un hueco identico al que separa una pastilla de la
                      siguiente. Tres veces mas aire fuera que dentro es lo que vuelve a
                      hacer visibles los dos grupos, y es el mismo principio de
                      agrupacion que ya ordena la columna entera.
                    */}
                    <Presets
                      valores={TRAMOS_CUPON_FIJO}
                      actual={couponFixed}
                      onElegir={applyCouponFixed}
                      etiqueta={t.couponFixedPresets}
                      formato={f.percent}
                      compacto
                    />
                    <Presets
                      valores={TRAMOS_CUPON_VARIABLE}
                      actual={couponVariable}
                      onElegir={applyCouponVariable}
                      etiqueta={t.couponVariablePresets}
                      formato={f.percent}
                      compacto
                    />
                  </div>

                  {/*
                    EL PLAZO VIVE EN EL MISMO BLOQUE QUE LOS CUPONES, y no en uno propio
                    con su separación de 24px. Los tres describen el mismo objeto -- las
                    condiciones del instrumento -- así que agruparlos es además más
                    correcto que tenerlos sueltos, y cuesta 24px menos de tarjeta.

                    Conserva sus pastillas: aquí sí ahorran escribir, porque el dato lleva
                    unidad ("3 años") y no es un porcentaje de una cifra. Se va su pista de
                    ayuda, que repetía lo que ya dice la nota al pie del gráfico.
                  */}
                  <div>
                    <EtiquetaGrupo>{t.term}</EtiquetaGrupo>
                    <Presets
                      valores={TRAMOS_PLAZO}
                      actual={years}
                      onElegir={applyYears}
                      etiqueta={t.term}
                      formato={enAnios}
                    />
                  </div>

                  {/*
                    AQUI HABIA UNA PISTA -- "el fijo se paga pase lo que pase; el
                    variable, solo si el negocio llega" -- y se retira el 05/09/2026 al
                    comprimir la tarjeta. No se pierde el dato: la nota al pie del
                    gráfico lo dice ya, y con más precisión ("el suelo de la horquilla
                    supone que solo se paga el cupón fijo; el techo, que se paga también
                    el tramo variable completo"). Eran dos líneas para repetir una.
                  */}

                  {/*
                    AQUI HABIA UNA LINEA DE REFERENCIA DE MERCADO, retirada el
                    05/09/2026 a peticion de Jaime. Decia el cupon total y si caia
                    dentro, por encima o por debajo del rango de las emisiones
                    comparables (8,5-12,8 % anual).

                    El dato NO se pierde de la casa: sigue entero, con sus fuentes, en
                    `CLAUDE OUTPUTS/.../03_Financiero/OwnEX_Comparables-Cupones-Deuda_v1.md`
                    y resumido en el docblock de `lib/debtEstimate.ts`. Lo que se
                    retira es enseñarselo al visitante, que es otra cosa.

                    El sitio que deja libre es justo lo que costaban las pastillas de
                    atajo de los dos cupones, que vuelven aqui abajo.
                  */}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                <NumericField
                  id="pre-money"
                  label={t.preMoney}
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
                  etiqueta={t.preMoneyPresets}
                  formato={f.compactEuros}
                />
                <p className="hidden text-caption text-text-tertiary sm:block">
                  {t.preMoneyHint}
                </p>
                </div>
              </>
            )}

          </div>

          {/*
            ALINEADA ARRIBA, NO CENTRADA - 04/09/2026.

            Estaba en `justify-center`, y con la columna de entradas siempre más alta
            que la gráfica eso dejaba la gráfica flotando en mitad de la columna:
            medido en escritorio, 266px de vacío repartidos arriba y abajo en equity,
            y la gráfica arrancando a la altura del segundo campo en vez de a la del
            primero. Dos columnas de una misma retícula se leen alineadas por arriba;
            centrar la corta contra la larga es lo que hacía que pareciera suelta.

            Con esto y con los 300px de alto que la gráfica gana en `lg` (ver
            `CapitalCostChart.tsx`), el vacío baja lo suficiente como para que la
            tarjeta no tenga un agujero.
          */}
          <div className="flex flex-col justify-start">
            {escenarioIncompleto ? null : (
              <>
                {esDeuda ? (
                  <CapitalCostChart
                    gross={deuda.gross}
                    rangeFor={bandaDeuda}
                    /*
                      El mantenimiento anual del registro tiene un mínimo, así que el
                      coste total deja de ser una recta y dobla en ese punto. El gráfico
                      necesita saber dónde para no dibujar la banda saltándose el codo.
                    */
                    quiebros={[QUIEBRO_MANTENIMIENTO]}
                    titulo={t.chartDebtTitle}
                    tituloCorto={t.chartDebtShort}
                    tituloEjeY={t.chartDebtAxisY}
                    rotuloFicha={t.chartDebtCard}
                    concepto={t.chartDebtConcept}
                  />
                ) : (
                  <CapitalCostChart gross={result.gross} />
                )}
                {/*
                  EL AVISO SE ANCLA AL PIE DE LA COLUMNA - 04/09/2026.

                  La columna de entradas siempre es más alta que la de la gráfica, y
                  con las dos alineadas arriba eso dejaba el sobrante entero colgando
                  al final de la columna derecha: unos 380px de nada debajo del aviso
                  en deuda, que es donde la columna izquierda es más larga.

                  Con `mt-auto` el aviso se va al fondo, así que la columna queda
                  sujeta por sus dos extremos (gráfica arriba, aviso abajo) y el aire
                  cae ENTRE los dos elementos en vez de después del último. Es el
                  mismo espacio; la diferencia es que así se lee como reparto y no
                  como un final que se quedó a medias.
                */}
                <p className="mt-3 text-caption text-text-tertiary sm:mt-5 lg:mt-auto lg:pt-5">
                  {esDeuda ? t.disclaimerDebt : t.disclaimerEquity}
                </p>
              </>
            )}
          </div>
          </div>

          {/*
            La captura de correo, al pie y a ancho completo. Estaba dentro de la
            columna de resultados, donde el campo y el boton se apretaban en 530px;
            aqui abajo cierra el bloque entero y respira.
          */}
          <div className="mt-6 border-t border-border pt-6 sm:mt-8">
            {status === "sent" ? (
            <div role="status" className="">
              <p className="text-body text-foreground">{t.sent}</p>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="">
              <p className="mb-3 text-label uppercase tracking-wide text-text-secondary">
                {t.capture}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex-1">
                  <label htmlFor="calc-email" className="sr-only">
                    {t.emailLabel}
                  </label>
                  <input
                    id="calc-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder={t.emailPlaceholder}
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
                  {t.send}
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
