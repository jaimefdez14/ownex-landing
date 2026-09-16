import { useEffect, useRef, useState, type ReactNode } from "react";
import { Banknote, Gift } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { useLiveRound } from "../lib/useLiveRound";
import { useCopy } from "../i18n/locale";
import { useFormat } from "../i18n/format";
import { useDrawOnReveal } from "../lib/useDrawOnReveal";
/*
  Retrato del accionista para la cabecera del portal (`OwnerHubMockup`). Import
  directo y no `import.meta.glob` como las fotos de sector: aquí el fichero es uno
  y conocido, así que Vite lo resuelve igual (URL con hash, cache eterna) sin la
  maquinaria del glob. Va SOLO en este mockup: es la única superficie donde una
  cara tiene sentido (el portal de una persona), y aun así diminúscula y dentro de
  un marco `aria-hidden`, así que no es un testimonio, es el avatar de "Mi cuenta".
*/
import ownerAvatar from "../assets/persona-retrato.webp";

/**
 * Mockups del producto (Hub del Propietario, Panel de la Marca), portados de la
 * v1 para las fases 02 y 03 de "Cómo funciona". No hay capturas reales todavía,
 * así que se construyen en HTML y CSS con datos de ejemplo.
 *
 * La ventana de navegador es deliberadamente clara, con colores fijos en vez de
 * las variables de color oscuras del resto del sitio: es lo que separa visualmente "esto es
 * una captura de pantalla" del lienzo, que es oscuro de principio a fin. Misma
 * lógica que ya aplicaba la v1 (Stripe y Klaviyo muestran así las suyas).
 *
 * REVISIÓN DEL 15-ago-2026: los tres paneles eran cajas grises apiladas. Leían
 * como un wireframe, no como un producto. Lo que se ha añadido, y por qué:
 *
 *  - El marco lleva ahora resplandor esmeralda difuso detrás y un filo claro
 *    arriba. Sobre un fondo casi negro, una ventana clara sin halo se recorta
 *    como un rectángulo pegado; con él se separa del lienzo y gana profundidad.
 *  - Una gráfica de área de verdad (`Sparkline`) en el panel del hero. Es lo que
 *    distingue una captura de producto de una lista de cifras.
 *  - Pilas de iniciales (`AvatarStack`) donde se habla de personas. Un número de
 *    accionistas no se ve; una fila de caras, sí.
 *  - Una fila de actividad en vivo con punto pulsante. Da la señal de que al
 *    otro lado hay una ronda pasando ahora mismo.
 *
 * Espacio de nombres del texto no es NB ( ): los importes de ejemplo lo usan
 * antes de "€" para que `check:copy` no los marque como espacio sin espacio duro.
 */

const NB = " ";
/*
  EL COPY DE LOS MOCKUPS, POR IDIOMA - 16/09/2026.

  Las pantallas son la unica prueba de producto de la pagina, asi que una sola
  etiqueta en espanol dentro de la version inglesa las delata enteras. Tres
  decisiones que no son obvias:

   - LOS DOMINIOS DE LA BARRA cambian tambien ("marca.com" -> "brand.com"): es la
     primera linea que se lee de la ventana y lo que dice es "esto pasa en TU
     dominio", que es justo el argumento del portal del accionista.
   - LA INICIAL DEL AVATAR DE MARCA sigue a la palabra: "M" de Marca en espanol y
     "B" de Brand en ingles. Es un cuadrado de 20px con una letra; si se queda en
     "M" en ingles, no significa nada.
   - "Tier Gold" pasa a "Gold tier". El sustantivo va detras en ingles, y estos
     rotulos aparecen tres veces en la misma pantalla: dejarlos al reves es el
     detalle que hace que una captura parezca traducida a medias.

  LAS CIFRAS NO ESTAN AQUI: salen de `useLiveRound` y se pintan con los
  formateadores del idioma (`useFormat`), asi que en ingles se leen "€185,250" y en
  espanol "185.250 €" sin duplicar ni un numero.

  OJO CON EL DOMINIO DEL WORKSPACE: decia "ownex.com", que no es nuestro (el dominio
  es .co, y el .com es de un tercero). Corregido en los dos idiomas.
*/
const COPY = {
  es: {
    urlOffering: "marca.com/emision",
    urlWorkspace: "ownex.co/workspace",
    urlShareholders: "marca.com/accionistas",
    urlPortal: "marca.com/mi-participacion",
    brand: "Tu marca",
    brandInitial: "M",
    roundOpen: "Ronda abierta",
    capitalRaised: "Capital captado",
    perWeek: "/ 7d",
    ofTarget: "del objetivo",
    shareholders: "Accionistas",
    avgTicket: "Ticket medio",
    median: "Mediana",
    newSubscriptionOf: "Nueva suscripción de",
    now: "ahora",
    dividends: "Repartir dividendos",
    newBenefit: "Crear nuevo beneficio",
    fileTitle: "Expediente de la emisión",
    offeringOpen: "Captación abierta",
    file: [
      { doc: "Acuerdo de emisión", rol: "Abogado", estado: "Certificado" },
      { doc: "Documento de la emisión", rol: "Notaría", estado: "Elevado" },
      { doc: "Documento de Oferta", rol: "ESI", estado: "Validado" },
      { doc: "Libro registro", rol: "ERIR", estado: "Abierto" },
    ],
    subsRegister: "Registro de suscripciones",
    integrity: "Referencia de integridad",
    myAccount: "Mi cuenta",
    myStake: "Mi participación",
    tierSilver: "Tier Silver",
    tierGold: "Tier Gold",
    tierBronze: "Tier Bronze",
    shares: "participaciones",
    toNextTier: "para Tier Gold",
    poll: "Consulta a la comunidad",
    participated: "Has participado",
    pollQuestion: "¿Qué referencia lanzamos en otoño?",
    optionA: "Modelo A",
    optionB: "Modelo B",
    pollCloses: "Cierra en 4 días",
    registerTitle: "Libro de accionistas",
    export: "Exportar",
    tierSplit: "Reparto por tiers",
    verified: "Verificado",
    pending: "Pendiente",
    activeBenefit: "Beneficio activo · Tier Gold",
    active: "Activo",
    benefitName: "Acceso anticipado a la nueva colección",
    alreadyActivated: "ya activado",
    stripOf: "de",
    stripShareholders: "accionistas · última suscripción de",
  },
  en: {
    urlOffering: "brand.com/offering",
    urlWorkspace: "ownex.co/workspace",
    urlShareholders: "brand.com/shareholders",
    urlPortal: "brand.com/my-stake",
    brand: "Your brand",
    brandInitial: "B",
    roundOpen: "Round open",
    capitalRaised: "Capital raised",
    perWeek: "/ 7d",
    ofTarget: "of target",
    shareholders: "Shareholders",
    avgTicket: "Average ticket",
    median: "Median",
    newSubscriptionOf: "New subscription of",
    now: "now",
    dividends: "Distribute dividends",
    newBenefit: "Create new benefit",
    fileTitle: "Issuance file",
    offeringOpen: "Offering open",
    /*
      Los cuatro estados conservan el verbo exacto de cada entidad (ver la nota del
      01/09 sobre el modelo canonico del proceso): el abogado certifica el acuerdo,
      la notaria lo eleva a publico -- "Notarised", que es el termino ingles del
      acto --, la ESI valida la informacion al inversor y el registro queda abierto.
    */
    file: [
      { doc: "Issuance resolution", rol: "Lawyer", estado: "Certified" },
      { doc: "Issuance document", rol: "Notary", estado: "Notarised" },
      { doc: "Offering Document", rol: "ESI", estado: "Validated" },
      { doc: "Securities register", rol: "ERIR", estado: "Open" },
    ],
    subsRegister: "Subscription register",
    integrity: "Integrity reference",
    myAccount: "My account",
    myStake: "My stake",
    tierSilver: "Silver tier",
    tierGold: "Gold tier",
    tierBronze: "Bronze tier",
    shares: "shares",
    toNextTier: "to Gold tier",
    poll: "Community poll",
    participated: "You've taken part",
    pollQuestion: "Which product should we launch this autumn?",
    optionA: "Model A",
    optionB: "Model B",
    pollCloses: "Closes in 4 days",
    registerTitle: "Shareholder register",
    export: "Export",
    tierSplit: "Split by tier",
    verified: "Verified",
    pending: "Pending",
    activeBenefit: "Active benefit · Gold tier",
    active: "Active",
    benefitName: "Early access to the new collection",
    alreadyActivated: "already activated",
    stripOf: "of",
    stripShareholders: "shareholders · latest subscription of",
  },
};


/**
 * `flush` quita el margen superior del marco, y desde el 01/09/2026 lo usan los
 * cuatro sitios: el hueco lo pone siempre el `gap` de la retícula que envuelve al
 * marco. Antes los tres paneles de "Cómo funciona" iban al final de su columna y
 * se ponían su propio margen; ahora la pantalla va EN MEDIO del texto en móvil
 * (titular arriba, descripción debajo), así que un margen propio solo en la parte
 * de arriba dejaba el hueco descuadrado: 44px por encima y 24 por debajo.
 *
 * El parámetro se queda aunque hoy nadie lo omita: quitarlo obligaría a decidir
 * por el próximo que use el marco, y el default correcto depende de dónde lo meta.
 */
function BrowserFrame({
  label,
  children,
  flush = false,
}: {
  label: string;
  children: ReactNode;
  flush?: boolean;
}) {
  return (
    <div aria-hidden="true" className={flush ? "relative isolate" : "relative isolate mt-5 lg:mt-0"}>
      {/*
        RETIRADO EL 25/08/2026: el resplandor esmeralda detrás del marco.

        Existía para despegar una ventana clara de un fondo casi negro. Con el ritmo
        claro de `brand/BRAND.md` §9.1 los tres mockups viven ya sobre lienzo claro
        (hero y "Cómo funciona"), así que el halo no despegaba nada: solo dejaba un
        velo verde detrás de una captura blanca, y gastaba acento donde no toca.

        Lo que separa ahora la ventana del lienzo es su propia elevación, abajo.
      */}
      {/*
        El filo sube del 7 al 12{'%'} y la sombra se alarga. Sobre el fondo negro de
        antes, el marco se recortaba solo; sobre lienzo claro compite con el, y el
        anillo al 7{'%'} daba 1,06:1 contra el blanco, o sea invisible. Al 12{'%'}
        son 1,17:1: el mockup vuelve a leerse como una ventana apoyada encima de la
        pagina y no como una mancha impresa sobre ella.
      */}
      <div className="overflow-hidden rounded-lg bg-mockup-chrome shadow-[0_0_0_1px_rgb(14_15_12_/_0.12),0_2px_4px_-2px_rgb(14_15_12_/_0.06),0_24px_56px_-24px_rgb(14_15_12_/_0.30)]">
        <div className="flex items-center gap-3 px-4 py-2 lg:py-3">
          <span className="flex gap-[6px]">
            <span className="h-2 w-2 rounded-full bg-mockup-dot" />
            <span className="h-2 w-2 rounded-full bg-mockup-dot" />
            <span className="h-2 w-2 rounded-full bg-mockup-dot" />
          </span>
          {/*
            La pastilla ocupa el ancho que queda (`flex-1`) en vez de encogerse al
            texto. Antes la barra del navegador se quedaba con casi la mitad derecha
            vacia, y una barra medio vacia no se lee como un navegador: se lee como
            una etiqueta puesta encima de una caja.
          */}
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-sm bg-mockup-surface px-3 py-1">
            {/* Candado: la señal universal de "esto es una pantalla real, servida". */}
            <svg
              viewBox="0 0 24 24"
              className="h-[10px] w-[10px] shrink-0 text-mockup-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <span className="truncate text-mk-micro text-mockup-muted">{label}</span>
          </span>
        </div>
        <div className="bg-mockup-surface p-4 lg:p-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * Gráfica de área de la evolución de la captación. Los puntos son fijos y de
 * ejemplo; lo que importa es la forma, que sube con un tramo plano al principio
 * (las primeras semanas de una ronda siempre lo son) y se acelera al final.
 *
 * Se dibuja sobre una retícula de 100x36 con `preserveAspectRatio="none"`, así
 * que se estira al ancho que le den sin que haya que recalcular la ruta.
 */
function Sparkline() {
  const line =
    "M0 33 L10 32 L20 29 L30 30 L40 24 L50 21 L60 22 L70 15 L80 12 L90 8 L100 4";

  /*
    La linea se traza al entrar en pantalla en vez de aparecer ya dibujada. La
    longitud la mide el hook sobre la ruta real; ver `useDrawOnReveal`.
  */
  const svgRef = useRef<SVGSVGElement>(null);
  useDrawOnReveal(svgRef);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      className="mt-3 h-9 w-full overflow-visible lg:h-11"
      fill="none"
    >
      <defs>
        {/*
          El color sale de la variable de tema del mockup y no de un hexadecimal
          fijo, como el resto del panel. Estaba en
          #10B981, que es el acento del tema OSCURO: sobre la ventana blanca daba una
          linea menta brillante, justo el resplandor del que `brand/BRAND.md` §5.3
          separa a la marca, y ademas era el unico color de estos paneles que no
          seguia al tema.
        */}
        <linearGradient id="ownex-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(var(--c-mk-accent))" stopOpacity="0.20" />
          <stop offset="100%" stopColor="rgb(var(--c-mk-accent))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="draw-area" d={`${line} L100 36 L0 36 Z`} fill="url(#ownex-spark)" />
      <path
        className="draw-line"
        d={line}
        stroke="rgb(var(--c-mk-accent))"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/*
        El punto final NO puede ser un `<circle>`. Con `preserveAspectRatio="none"` la
        reticula de 100x36 se estira al ancho real (unos 380 px), asi que un circulo
        se deforma en una elipse casi cuatro veces mas ancha que alta: lo que se veia
        al final de la linea era una raya verde, no un punto.

        Un subtrazo de longitud cero con `strokeLinecap="round"` se pinta como un
        disco del diametro del trazo, y el trazo no se escala (`non-scaling-stroke`),
        asi que sale redondo pase lo que pase con el ancho. `overflow-visible` en el
        svg es lo que evita que la mitad derecha se recorte, porque el punto cae justo
        en el borde de la reticula.
      */}
      <path
        className="draw-area"
        d="M100 4 L100 4"
        stroke="rgb(var(--c-mk-accent))"
        strokeWidth={5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * Pila de iniciales. Cuatro caras y un resto contado: es como se representa una
 * base de accionistas sin inventar fotos de personas que no existen.
 *
 * Una sola letra por circulo, no dos: a 20px con las caras solapadas, la segunda
 * letra queda debajo de la siguiente y se lee como un recorte, no como un nombre.
 */
function AvatarStack({
  initials,
  rest,
  on = "raised",
}: {
  initials: string[];
  /*
    Nodo y no numero, porque el resto contado a veces cuenta. En el panel del hero
    esta cifra es la misma que la tarjeta de "Accionistas" de al lado, que entra
    contando: cuando aqui iba un numero suelto, durante el segundo y medio de la
    entrada el panel decia "25" arriba y "+243" aqui. Ahora quien lo necesita pasa
    un `AnimatedNumber` y las dos cifras cuentan a la vez; quien no, pasa el texto.
  */
  rest: ReactNode;
  on?: "raised" | "surface";
}) {
  return (
    <span className="flex items-center">
      {initials.map((text, index) => (
        <span
          key={text}
          /*
            EL SOLAPE COMIA LA LETRA - 29/08/2026. Era -7px sobre circulos de 20 px
            que ademas llevan 2 px de anillo hacia fuera: cada cara tapaba 9 de los
            20 px de la anterior, casi la mitad, y la inicial esta centrada. Lo que
            quedaba a la vista no era una fila de caras sino una fila de recortes de
            letra. A -5px se tapan 7 px: solape suficiente para que lea como pila y
            la inicial entra entera.

            El anillo tiene que ser del color de la superficie que hay DEBAJO, no
            siempre `raised`: en la tarjeta de beneficio del panel de marca la pila
            va sobre `surface` y el anillo dibujaba un halo gris alrededor de cada
            cara.
          */
          className={`-ml-[5px] flex h-5 w-5 items-center justify-center rounded-full bg-mockup-badge text-[10px] font-medium text-mockup-muted ring-2 first:ml-0 ${
            on === "surface" ? "ring-mockup-surface" : "ring-mockup-raised"
          }`}
          style={{ zIndex: initials.length - index }}
        >
          {text}
        </span>
      ))}
      <span className="ml-2 text-mk-micro tabular text-mockup-muted">+{rest}</span>
    </span>
  );
}

/** Punto verde con pulso: el estado "esto está pasando ahora". */
function LivePulse() {
  return (
    <span className="relative flex h-[6px] w-[6px] shrink-0">
      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
      <span className="relative h-[6px] w-[6px] rounded-full bg-emerald-500" />
    </span>
  );
}

const holders = [
  { name: "Marta Solé", initials: "MS", tier: "gold" as const, amount: 5000, kyc: "verificado" as const },
  { name: "Laia Ferrer", initials: "LF", tier: "bronze" as const, amount: 250, kyc: "pendiente" as const },
];

/**
 * Panel de la emisión en curso, para el hero.
 *
 * Hasta el 11-ago-2026 la página no enseñaba nada del producto hasta "Cómo
 * funciona", que es la sexta de nueve secciones: el visitante recorría cinco
 * secciones de texto y tarjetas antes de ver una sola pantalla. Este panel es lo
 * que rompe esa espera, y va en el hero por decisión de Jaime frente a las otras
 * dos ubicaciones que se plantearon (una banda propia bajo el hero, o el cierre
 * de "El desajuste").
 *
 * Deliberadamente no es ninguno de los paneles de "Cómo funciona": si fuera una
 * copia de `BrandPanelMockup`, la misma pantalla apareceria dos veces en la misma
 * página. Lo que enseña aquí (progreso de la ronda contra el objetivo, ticket
 * medio, y la única línea que ocupa la emisión en el cap table) no sale en ningún
 * otro panel, y las tres cifras que sí comparte con `BrandPanelMockup` (185.250
 * euros, 247 accionistas, y por tanto 750 euros de ticket medio) llevan a
 * proposito los mismos valores: son la misma marca de ejemplo vista desde dos
 * pantallas distintas, no dos ejemplos que se contradicen.
 *
 * La última fila es la promesa del titular convertida en producto: el hero dice
 * "una sola línea en tu cap table" y aquí se ve esa línea contada.
 */
export function HeroPanelMockup() {
  /*
    LA RONDA EN MARCHA - 26/08/2026. El panel enseñaba una captura congelada en
    la primera pantalla del sitio. Ahora entra una suscripción cada pocos
    segundos y el capital, la barra y el contador de accionistas suben con ella.
    Ver `useLiveRound.ts` para las tres decisiones que lo hacen seguro
    (guion fijo y no aleatorio, arranque en los valores prerenderizados, y
    parada con movimiento reducido y con la pestaña oculta).
  */
  const ronda = useLiveRound();
  const t = useCopy(COPY);
  const f = useFormat();

  /*
    Solo sirve para que la barra de progreso tenga un estado inicial distinto del
    final y su transicion de CSS pueda correr. Se enciende en el primer efecto
    tras el montaje; en el HTML prerenderizado la barra sale a cero, que es lo
    correcto: sin JavaScript no hay animacion que contradiga nada, y la cifra de
    al lado sale ya con su valor.
  */
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  return (
    <BrowserFrame flush label={t.urlOffering}>
      <div className="flex items-center justify-between border-b border-mockup-badge pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-mockup-ink text-[10px] font-medium text-mockup-surface">
            {t.brandInitial}
          </span>
          <span className="text-mk-label text-mockup-ink">{t.brand}</span>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium text-mockup-accent">
          <LivePulse />
          {t.roundOpen}
        </span>
      </div>

      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-mk-micro text-mockup-muted">{t.capitalRaised}</p>
            <AnimatedNumber
              value={ronda.capital}
              format={f.euros}
              className="mt-2 block text-mk-title tabular text-mockup-ink"
            />
          </div>
          {/*
            El delta semanal. Sin él, la cifra grande podría ser un saldo
            parado; con él se lee que la ronda se mueve, que es justo lo que
            el sparkline de debajo dibuja.
          */}
          <span className="mt-[2px] shrink-0 rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium tabular text-mockup-accent">
            +{f.euros(12400)} {t.perWeek}
          </span>
        </div>

        <Sparkline />

        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
          {/*
            `transition` en el ancho y no un salto: la barra acompana a la cifra
            en vez de teletransportarse cuando entra una suscripcion.

            Y arranca VACIA, no en su valor. Antes se pintaba directamente al 74 %
            mientras la cifra de al lado contaba desde cero, asi que durante el
            segundo y medo de la entrada el panel se contradecia: "7.721 € de
            250.000" con la barra ya casi llena. Ahora las dos salen de cero y
            llegan juntas.

            El primer pintado es a cero y el valor real entra despues del montaje,
            que es lo que hace que la transicion de CSS tenga de donde salir: si se
            pintara ya con el valor final no habria cambio que animar.
          */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
            style={{ width: `${montado ? ronda.progreso : 0}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-mk-micro tabular text-mockup-muted">{f.percent(ronda.progreso)} {t.ofTarget}</span>
          <span className="text-mk-micro tabular text-mockup-muted">{f.euros(ronda.objetivo)}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-mk-micro text-mockup-muted">{t.shareholders}</p>
          <AnimatedNumber
            value={ronda.accionistas}
            format={f.int}
            className="mt-1 block text-mk-label tabular text-mockup-ink"
          />
          <span className="mt-2 block">
            <AvatarStack
              initials={["M", "J", "L", "A"]}
              rest={<AnimatedNumber value={ronda.accionistas - 4} format={f.int} />}
            />
          </span>
        </div>
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-mk-micro text-mockup-muted">{t.avgTicket}</p>
          <AnimatedNumber
            value={ronda.ticketMedio}
            format={f.euros}
            className="mt-1 block text-mk-label tabular text-mockup-ink"
          />
          <span className="mt-2 block text-mk-micro text-mockup-muted">{t.median} {f.euros(400)}</span>
        </div>
      </div>

      {/*
        Fila de actividad. Es la única superficie del panel en `mockup-surface`
        sobre el resto en `mockup-raised` y con sombra propia: se levanta del
        plano y lee como algo que acaba de entrar, no como un dato más.
      */}
      {/*
        La fila de actividad ya no dice "hace 2 min" para siempre: cada entrada
        nueva reemplaza a la anterior. La `key` cambia con cada suscripcion, asi
        que React remonta el nodo y la animacion de entrada vuelve a correr; sin
        eso el texto cambiaria en silencio y no se notaria que ha pasado algo.
      */}
      <div
        key={ronda.ultima.id}
        className="mt-2 flex animate-slide-in items-center gap-2 rounded-md bg-mockup-surface px-3 py-[10px] shadow-[0_2px_8px_-2px_rgba(20,20,16,0.18)] motion-reduce:animate-none lg:mt-3"
      >
        <LivePulse />
        <span className="min-w-0 flex-1 truncate text-mk-caption text-mockup-ink">
          {t.newSubscriptionOf} {f.euros(ronda.ultima.importe)}
        </span>
        <span className="shrink-0 text-mk-micro text-mockup-muted">{t.now}</span>
      </div>

      {/*
        Aqui iba "Lineas en tu cap table: 1". Era la unica fila del panel que no
        se movia y, sobre todo, era un DATO donde el hero necesita ensenar lo que
        el emisor HACE con la emision: repartir dividendos y crear beneficios. La
        promesa del producto no es que el cap table tenga una linea, es que la
        marca opera su base de accionistas desde la pantalla.

        Ocupan exactamente la altura de la fila que sustituyen (una linea de
        `mk-caption` con `py-[10px]`), asi que el panel no crece ni un pixel: el
        hero ya esta ajustado al pliegue en 1440px y este bloque es el ultimo.

        No son botones reales (`div`, no `button`): el marco entero es
        `aria-hidden` y decorativo, y un control focalizable dentro de un dibujo
        seria una parada de tabulacion que no lleva a ninguna parte.
      */}
      {/*
        Iconos de Lucide, no emoji (`brand/BRAND.md` §8.5: una sola libreria, un
        solo grosor, nunca emoji). A 12px hacen el trabajo que hacia el emoji en
        el encargo -- que se lean como botones y que se vea de que van sin leer:
        monedas para el dividendo, regalo para el beneficio.

        Van en `mockup-accent` y el rotulo en tinta: el glifo es lo unico teñido,
        asi que el par se lee como accion sin gastar el presupuesto de acento del
        hero, que ya se lo lleva entero el boton verde de "Agendar una llamada".

        La sombra de 1px es lo que los levanta del plano: sin ella, una pastilla
        `mockup-badge` es la misma pieza que las etiquetas de estado del panel y
        se leia como dato, no como algo que se pulsa.
      */}
      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="flex items-center justify-center gap-[6px] rounded-md bg-mockup-badge px-2 py-[10px] text-mk-caption font-medium text-mockup-ink shadow-[0_1px_2px_-1px_rgb(20_20_16_/_0.22)]">
          <Banknote className="h-[14px] w-[14px] shrink-0 text-mockup-accent" strokeWidth={2} />
          {t.dividends}
        </div>
        <div className="flex items-center justify-center gap-[6px] rounded-md bg-mockup-badge px-2 py-[10px] text-mk-caption font-medium text-mockup-ink shadow-[0_1px_2px_-1px_rgb(20_20_16_/_0.22)]">
          <Gift className="h-[14px] w-[14px] shrink-0 text-mockup-accent" strokeWidth={2} />
          {t.newBenefit}
        </div>
      </div>
    </BrowserFrame>
  );
}

/**
 * Hub del Propietario (fase 03).
 *
 * Antes mostraba la posición y una lista de novedades con etiquetas. Faltaban las
 * dos cosas que el texto de la fase promete y que son las que diferencian:
 *
 *  - Que los accionistas **participan** en las decisiones de la marca. Era una
 *    fila de texto ("Voto abierto: dos referencias para otoño"), sin mecánica.
 *    Ahora es una consulta de verdad, con opciones, reparto y estado. Consulta y
 *    no votación: el voto que el accionista tiene por serlo es el de la junta del
 *    SPV, y ese no se decide eligiendo la referencia del otoño (01/09/2026).
 *  - Que todo va **bajo la marca del cliente, no la de Ownex**. El mockup no lo
 *    demostraba de ninguna forma. Ahora lleva cabecera de marca propia, y al pie
 *    se indica que la infraestructura es de Ownex pero no se ve por ninguna parte.
 *
 * Es deliberadamente la vista del ACCIONISTA y solo eso: nada de capital
 * captado, listas de accionistas ni herramientas de segmentación, que es lo que
 * usa el equipo de la marca y vive en `BrandPanelMockup`. Antes del 11-ago-2026
 * la fase que envolvía este mockup mezclaba texto de las dos audiencias; el
 * mockup en sí nunca tuvo ese problema.
 */
/*
  Expediente de la emision: el workspace donde trabajan el abogado, la ESI y el
  ERIR.

  Es el mockup que faltaba. Hasta el 27/08/2026 "Como funciona" ensenaba dos
  superficies de las tres que tiene el producto (`docs/CLAUDE.md`: A Emisor,
  B Operations Workspace, C Owner Portal), y la que se callaba era justo la que
  sostiene el argumento regulatorio. Jaime decidio ensenarla.

  Lo que se ve es una lista de documentos con QUIEN responde de cada uno y en que
  estado esta, porque eso es lo que convierte "cumplimos la normativa" en algo
  comprobable: cada paso lo firma una figura distinta y deja un estado.

  LAS CUATRO FILAS SE REHICIERON EL 01/09/2026. Las de antes no cuadraban con el
  modelo canonico del proceso (`src/lib/process.ts` de la plataforma):

   - "Documento de la emisión | ESI | Validado" mezclaba dos documentos. La ESI
     valida la INFORMACION AL INVERSOR, o sea el Documento de Oferta (art. 36.1
     Ley 6/2023, del que sale su informe de validacion). El Documento de la
     Emision (art. 7 Ley 6/2023, arts. 9-11 RD 814/2023) lo redacta el abogado,
     lo eleva la notaria y se deposita ante la ERIR: la ESI no lo valida. Y la
     viñeta de al lado, a tres centimetros, ya lo decia bien.
   - "Escritura de emisión | Notaría" era ese MISMO documento otra vez: la
     escritura es la elevacion a publico del documento de la emision (art. 9.2
     RD 814/2023), asi que el expediente listaba una cosa dos veces con dos
     responsables.
   - "Pacto de socios | Abogado | Firmado": el abogado lo redacta, lo firman los
     socios. En las otras tres filas la columna se lee como "quien hizo esto",
     asi que esa atribuia una firma a quien no firma. Su sitio lo ocupa ahora la
     certificacion del acuerdo de emision (LSC arts. 296 y ss.), que si es un
     entregable del expediente y si es del abogado.
   - "Libro registro | ERIR | Inscrito" con el chip en precaptacion era
     imposible: los valores se constituyen con la primera inscripcion (art. 10
     Ley 6/2023) y eso pasa en el CIERRE. Durante la ventana el registro esta
     abierto y lo que se acumulan son suscripciones.

  Las cuatro van en orden cronologico: acuerdo (fase 3), documento elevado
  (fase 5), oferta validada (fase 4 -- se valida antes de abrir, por eso va
  delante del registro) y registro abierto (fase 6).

  En pantalla nunca "hash": "referencia de integridad", igual que en el producto.

  LAS CUATRO FILAS VIVEN EN `COPY` (arriba), una version por idioma, desde el
  16/09/2026: son texto visible, y el reparto de responsabilidades que sostienen es
  justo lo que no puede quedarse a medio traducir.
*/

export function WorkspaceMockup() {
  /*
    Vive de la MISMA ronda que el resto de pantallas (ver `useLiveRound`). Aqui lo
    que se mueve es el contador de SUSCRIPCIONES, no de inscripciones: mientras la
    ventana esta abierta, cada suscripcion que entra en el portal se anota en el
    registro de suscripciones y pagos, y el ERIR las inscribe todas de una vez en
    el cierre (art. 10 Ley 6/2023). Hasta el 01/09/2026 esta pantalla contaba
    "inscripciones", que es un acto que en captacion todavia no ha ocurrido.
  */
  const ronda = useLiveRound();
  const t = useCopy(COPY);
  const f = useFormat();

  return (
    <BrowserFrame flush label={t.urlWorkspace}>
      <div className="flex items-center justify-between">
        <p className="min-w-0 text-mk-label text-mockup-ink">{t.fileTitle}</p>
        {/*
          `whitespace-nowrap` en el chip: en telefono el titulo y el chip partian
          los dos en dos lineas a la vez, y dos bloques de dos lineas enfrentados
          leen como un desbordamiento, no como una cabecera. Un estado siempre va
          en una linea; el que cede es el titulo.
        */}
        <span className="shrink-0 whitespace-nowrap rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium text-mockup-accent">
          {t.offeringOpen}
        </span>
      </div>

      <div className="mt-2 space-y-1 lg:mt-3">
        {t.file.map(({ doc, rol, estado }) => (
          <div
            key={doc}
            /*
              En telefono el panel mide unos 308 px y la fila no da para las tres
              columnas: el nombre del documento se cortaba en "Documento d...", que
              es justo el dato que sostiene la seccion. Ahi el rol y el estado bajan
              a una segunda linea, sangrados a la altura del nombre; desde `lg`, con
              420 px de panel, vuelven a su columna y la fila es una sola linea.
            */
            className="rounded-sm bg-mockup-raised px-3 py-[7px] lg:flex lg:items-center lg:justify-between lg:gap-3 lg:py-[10px]"
          >
            <span className="flex min-w-0 items-center gap-2">
              {/* Marca de verificado. Es un glifo, no un icono de libreria: aqui
                  dentro todo se dibuja a mano para que el mockup no herede el
                  grosor de trazo de la pagina que lo rodea. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[13px] w-[13px] shrink-0 text-mockup-accent"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="truncate text-mk-caption text-mockup-ink">{doc}</span>
            </span>
            {/*
              COLUMNAS, NO PASTILLAS FLOTANDO - 29/08/2026. El rol y el estado se
              alineaban al final de cada fila, asi que como "ESI", "Notaria",
              "Abogado" y "ERIR" miden distinto, las cuatro filas rompian por sitios
              distintos y el bloque quedaba con el borde izquierdo de la columna
              dentado. Un expediente es una tabla: se leen los estados en vertical, y
              para eso las columnas tienen que empezar en la misma x.

              `text-right` en el estado mantiene ademas el borde derecho a plomo con
              el resto del panel.
            */}
            <span className="mt-[3px] flex items-center gap-2 pl-[21px] lg:mt-0 lg:shrink-0 lg:pl-0">
              <span className="block w-[72px] shrink-0 rounded-sm bg-mockup-badge px-[6px] py-[2px] text-center text-mk-micro text-mockup-muted">
                {rol}
              </span>
              <span className="w-[66px] shrink-0 text-right text-mk-micro text-mockup-muted">
                {estado}
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-mockup-raised p-3 lg:mt-3">
        <span className="min-w-0">
          <span className="block text-mk-micro text-mockup-muted">{t.subsRegister}</span>
          {/*
            La cifra va sola, sin repetir el sustantivo: con el rotulo diciendo ya
            "Registro de suscripciones", poner "331 suscripciones" debajo lo decia
            dos veces, y en telefono el rotulo parte en dos lineas y la redundancia
            se ve el doble.
          */}
          <span className="mt-1 block text-mk-label tabular text-mockup-ink">
            <AnimatedNumber value={ronda.accionistas} format={f.int} />
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-mk-micro text-mockup-muted">{t.integrity}</span>
          <span className="mt-1 block text-mk-micro tabular text-mockup-muted">a7f3{NB}·{NB}9c21{NB}·{NB}4e08</span>
        </span>
      </div>
    </BrowserFrame>
  );
}

/*
  La posicion del accionista de ejemplo. Una sola cifra, porque las dos que se
  ven en pantalla salen de ella: el importe y el numero de participaciones.

  ANTES DECIA "3 participaciones" PARA 1.500 EUROS - corregido el 01/09/2026.
  Eso implicaba participaciones de 500 €, y con ese precio no existirian ni la
  posicion de 250 € de Laia Ferrer en el panel de al lado ni la mitad de los
  tickets de la ronda (ver `useLiveRound`). En el producto la participacion vale
  1 € (`src/lib/seed/issuances.ts`), asi que 1.500 € son 1.500 participaciones y
  cualquier importe de la ronda cuadra.

  El resto de la tarjeta ya cuadraba y no se toca: 1.500 de 2.500 es el 60 % de
  la barra, y de ahi los 1.000 € que faltan para Tier Gold.
*/
const POSICION = 1500;

export function OwnerHubMockup() {
  /*
    Aqui NO se mueve la posicion del accionista: 1.500 € invertidos no cambian
    porque entre otro. Lo que se mueve es la consulta abierta, que es justo lo que
    un accionista ve cambiar en su portal mientras los demas responden. El reparto
    sale de la misma ronda y oscila en una horquilla estrecha, porque algo que
    salta veinte puntos cada cuatro segundos no parece una consulta, parece una
    animacion.

    ES UNA CONSULTA, NO UNA VOTACION - 01/09/2026. Se rotulaba "Votación abierta"
    y preguntaba que referencia lanzar en otoño. Como voto es falso: el accionista
    del SPV vota en la junta (cuentas, dividendos, acuerdos), no decide el catalogo
    de la marca. Como consulta a la comunidad es verdad y sigue siendo el mismo
    argumento de pertenencia. El voto de junta se sigue prometiendo en la viñeta de
    la seccion, que es donde le corresponde.
  */
  const ronda = useLiveRound();
  const t = useCopy(COPY);
  const f = useFormat();
  const respuestas = [
    { label: t.optionA, share: ronda.votoA, chosen: true },
    { label: t.optionB, share: 100 - ronda.votoA, chosen: false },
  ];

  return (
    <BrowserFrame flush label={t.urlPortal}>
      {/* Cabecera de la marca: es lo que hace visible que el panel es suyo. */}
      <div className="flex items-center justify-between border-b border-mockup-badge pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-mockup-ink text-[10px] font-medium text-mockup-surface">
            {t.brandInitial}
          </span>
          <span className="text-mk-label text-mockup-ink">{t.brand}</span>
        </div>
        {/*
          "Mi cuenta" gana el avatar del accionista: es el patrón de cualquier
          portal (Stripe, la banca) y es lo que hace que la cabecera se lea como
          "esto es MI sesión" y no como otra etiqueta más. `alt=""` porque todo el
          marco es `aria-hidden`; el anillo es del color de la superficie de la
          ventana para que la cara no quede flotando.
        */}
        <span className="flex items-center gap-[6px] text-mk-micro text-mockup-muted">
          {t.myAccount}
          <img
            src={ownerAvatar}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-[22px] w-[22px] shrink-0 rounded-full object-cover ring-1 ring-mockup-badge"
          />
        </span>
      </div>

      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-mk-micro text-mockup-muted">{t.myStake}</p>
            <AnimatedNumber
              value={POSICION}
              format={f.euros}
              className="mt-2 block text-mk-title tabular text-mockup-ink"
            />
          </div>
          <span className="mt-[2px] shrink-0 rounded-full bg-mockup-accent px-[10px] py-1 text-mk-micro font-medium text-mockup-surface">
            {t.tierSilver}
          </span>
        </div>

        {/*
          Progreso hasta el siguiente tier. Es la mecánica que hace que la
          tarjeta de posición sea algo más que un saldo: enseña que ampliar
          posición tiene una consecuencia concreta y a cuánto está.
        */}
        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
            style={{ width: "60%" }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-mk-micro tabular text-mockup-muted">
            {f.int(POSICION)} {t.shares}
          </span>
          <span className="text-mk-micro tabular text-mockup-muted">{f.euros(1000)} {t.toNextTier}</span>
        </div>
      </div>

      {/* La consulta a la comunidad: lo que hace del portal algo mas que un saldo. */}
      <div className="mt-2 rounded-md bg-mockup-raised p-3 lg:mt-3 lg:p-4">
        <div className="flex items-center justify-between">
          <p className="text-mk-label text-mockup-ink">{t.poll}</p>
          <span className="rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium text-mockup-accent">
            {t.participated}
          </span>
        </div>
        <p className="mt-2 text-mk-caption text-mockup-muted">{t.pollQuestion}</p>

        <div className="mt-2 space-y-2 lg:mt-3">
          {respuestas.map((option) => (
            <div key={option.label}>
              <div className="flex items-center justify-between">
                <span
                  className={
                    option.chosen
                      ? "text-mk-caption font-medium text-mockup-ink"
                      : "text-mk-caption text-mockup-muted"
                  }
                >
                  {option.label}
                </span>
                <span className="text-mk-caption tabular text-mockup-muted">{f.percent(option.share)}</span>
              </div>
              <div className="mt-1 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
                <div
                  className={
                    option.chosen
                      ? "h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      : "h-full rounded-full bg-mockup-dot"
                  }
                  style={{ width: `${option.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex items-center justify-between lg:mt-3">
          <AvatarStack initials={["J", "A", "M"]} rest={f.int(161)} />
          <span className="text-mk-micro text-mockup-muted">{t.pollCloses}</span>
        </div>
      </div>
    </BrowserFrame>
  );
}

/**
 * Panel de la Marca (fase 02).
 *
 * REVISADO EL 11-ago-2026: hasta entonces esta pantalla y `ActivationMockup`
 * (retirado) eran dos mockups para dos fases distintas, "Motor de activación" y
 * "Panel de la Marca", que en realidad describían el mismo panel del equipo de
 * la marca visto desde dos ángulos. El texto de las dos fases ya se pisaba
 * (las dos hablaban de segmentar y de lanzar algo dirigido a un segmento); este
 * mockup solo enseñaba la mitad de registro (capital, libro de accionistas) y
 * dejaba fuera la mitad de activación (el beneficio dirigido a un segmento) que
 * vivía en el otro mockup.
 *
 * Ahora enseña las dos mitades en un solo panel, que es lo que de verdad hace el
 * equipo de la marca aquí: sabe quién ha invertido (capital, accionistas, libro
 * con estado de KYC) Y actúa sobre esa base (un beneficio dirigido a un tier).
 * La lista de accionistas se recorta a dos filas, antes eran tres, para dejar
 * sitio a la tarjeta de beneficio sin que el panel crezca más que los otros dos
 * de la sección.
 */
export function BrandPanelMockup() {
  /*
    Las tres cifras que esta pantalla comparte con el panel del hero ya llevaban a
    proposito los mismos valores, porque son la misma marca de ejemplo vista desde
    dos sitios. Ahora ademas se mueven juntas: las dos leen de `useLiveRound`, que
    es un estado unico de modulo. Antes eran dos copias del mismo numero escritas a
    mano; ahora es el mismo numero.
  */
  const ronda = useLiveRound();
  const t = useCopy(COPY);
  const f = useFormat();

  /*
    EL REPARTO POR TIERS SE DERIVA DEL CONTADOR - 01/09/2026. Estaba a fuego en
    86 / 74 / 87, que suma 247: exactamente los accionistas con los que ARRANCA la
    ronda. Pero el contador de arriba sube cada 4,2 s hasta ~330, asi que a los
    pocos segundos el mismo panel decia "251 accionistas" y debajo un desglose que
    sumaba 247. Ahora los tres salen del mismo numero con las proporciones de
    partida (34,8 / 30 / 35,2 %) y el bronce se lleva el resto de la division, que
    es lo que garantiza que los tres sumen SIEMPRE el total y no 247 ni 248.
  */
  const gold = Math.round(ronda.accionistas * 0.348);
  const silver = Math.round(ronda.accionistas * 0.3);
  const bronze = ronda.accionistas - gold - silver;

  return (
    <BrowserFrame flush label={t.urlShareholders}>
      <div className="flex items-center justify-between">
        <p className="text-mk-label text-mockup-ink">{t.registerTitle}</p>
        <span className="rounded-sm bg-mockup-badge px-[10px] py-1 text-mk-micro text-mockup-muted">{t.export}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-mk-micro text-mockup-muted">{t.capitalRaised}</p>
          <AnimatedNumber
            value={ronda.capital}
            format={f.euros}
            className="mt-1 block text-mk-label tabular text-mockup-ink"
          />
        </div>
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-mk-micro text-mockup-muted">{t.shareholders}</p>
          <AnimatedNumber
            value={ronda.accionistas}
            format={f.int}
            className="mt-1 block text-mk-label tabular text-mockup-ink"
          />
        </div>
      </div>

      {/*
        Reparto por tiers. Es la herramienta de segmentación del texto de la
        fase enseñada como lo que es: una base partida en tres, sobre la que
        después se dirige el beneficio de abajo.
      */}
      <div className="mt-2 rounded-md bg-mockup-raised p-3 lg:mt-3">
        <div className="flex items-center justify-between">
          {/*
            Aqui iba otra vez el numero de accionistas. Se quita por dos motivos: ya
            esta dos centimetros mas arriba, en su propia tarjeta; y ese estaba
            contando (`AnimatedNumber`) mientras este se pintaba directo, asi que
            durante la entrada la pantalla mostraba "17" arriba y "258" aqui.
          */}
          <p className="text-mk-micro text-mockup-muted">{t.tierSplit}</p>
        </div>
        <div className="mt-2 flex h-[8px] gap-[3px] overflow-hidden">
          <span className="rounded-full bg-emerald-500" style={{ width: "35%" }} />
          <span className="rounded-full bg-emerald-500/45" style={{ width: "30%" }} />
          <span className="rounded-full bg-mockup-dot" style={{ width: "35%" }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-[6px] text-mk-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-emerald-500" />
            {t.tierGold} · {f.int(gold)}
          </span>
          <span className="flex items-center gap-[6px] text-mk-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-emerald-500/45" />
            {t.tierSilver} · {f.int(silver)}
          </span>
          <span className="flex items-center gap-[6px] text-mk-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-mockup-dot" />
            {t.tierBronze} · {f.int(bronze)}
          </span>
        </div>
      </div>

      <div className="mt-2 space-y-1 lg:mt-3">
        {holders.map((holder) => (
          <div
            key={holder.name}
            className="flex items-center justify-between gap-3 rounded-sm bg-mockup-raised px-3 py-[6px] lg:py-[10px]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mockup-badge text-[9px] font-medium text-mockup-muted">
                {holder.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-mk-caption font-medium text-mockup-ink">{holder.name}</span>
                <span className="block text-mk-micro text-mockup-muted">
                  {holder.tier === "gold" ? t.tierGold : t.tierBronze}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <AnimatedNumber value={holder.amount} format={f.euros} className="text-mk-caption tabular text-mockup-muted" />
              <span
                className={
                  holder.kyc === "verificado"
                    ? "rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium text-mockup-accent"
                    : "rounded-full bg-mockup-badge px-[10px] py-1 text-mk-micro text-mockup-muted"
                }
              >
                {holder.kyc === "verificado" ? t.verified : t.pending}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/*
        La mitad de activación: un beneficio ya lanzado y dirigido a un segmento.
        La pila cuenta el Tier Gold entero, el mismo numero que el reparto de
        arriba (por eso se deriva de `gold` y no va a fuego): el beneficio va
        dirigido justo a ese segmento, y el 41 % es la parte que ya lo ha
        activado.
      */}
      <div className="mt-2 rounded-md bg-mockup-surface p-3 shadow-[0_2px_8px_-2px_rgba(20,20,16,0.18)] lg:mt-3 lg:p-4">
        <div className="flex items-center justify-between">
          <p className="text-mk-micro text-mockup-muted">{t.activeBenefit}</p>
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-[10px] py-1 text-mk-micro font-medium text-mockup-accent">
            <LivePulse />
            {t.active}
          </span>
        </div>
        <p className="mt-2 text-mk-caption font-medium text-mockup-ink">
          {t.benefitName}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <AvatarStack initials={["M", "J", "A"]} rest={f.int(gold - 3)} on="surface" />
          <span className="text-mk-micro tabular text-mockup-muted">{f.percent(41)} {t.alreadyActivated}</span>
        </div>
      </div>
    </BrowserFrame>
  );
}

/**
 * La ronda en marcha, en una franja. Solo para telefono y tablet.
 *
 * NUEVO EL 29/08/2026.
 *
 * El panel del hero se retiro del movil esa misma manana, y con razon: 560px,
 * media primera pantalla, para repetir en dibujo lo que el titular ya dice en
 * palabras. Pero al irse se llevo lo unico que en movil no era tipografia. La
 * primera pantalla quedo siendo cinco bloques de texto seguidos: nada que MIRAR,
 * y ninguna prueba de que exista un producto detras del argumento.
 *
 * Lo que hace falta no es el panel: es la prueba de que la cosa esta viva. Eso
 * son tres datos (capital, progreso, accionistas) y una barra, y caben en 120px,
 * o sea la quinta parte de lo que ocupaba el panel.
 *
 * VA AL FILO DEL PLIEGUE a proposito. En 375x812 asoma por el borde inferior en
 * vez de caber entera, y es la invitacion a bajar: un borde de seccion cortado
 * es la senal de scroll mas barata que hay, y en escritorio se resuelve acotando
 * el alto del hero (ver `HeroSection`).
 *
 * `lg:hidden` porque desde ahi manda `HeroPanelMockup`, que enseña esto mismo y
 * cuatro cosas mas. Las dos leen de `useLiveRound`, asi que aunque llegaran a
 * coincidir dirian el mismo numero.
 *
 * Decorativa (`aria-hidden`), como el panel: sus cifras no dicen nada que el copy
 * del hero no diga, y leidas en voz alta como una lista de datos sueltos solo
 * estorbarian.
 */
export function HeroLiveStrip() {
  const ronda = useLiveRound();
  const t = useCopy(COPY);
  const f = useFormat();

  /* Mismo motivo que en el panel: la barra necesita salir de cero para poder
     transicionar, y en el HTML prerenderizado sale a cero, que es lo correcto. */
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  return (
    <div
      aria-hidden="true"
      className="rounded-lg bg-mockup-surface p-4 shadow-[0_0_0_1px_rgb(14_15_12_/_0.10),0_12px_32px_-20px_rgb(14_15_12_/_0.30)]"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-mk-micro font-medium text-mockup-accent">
          <LivePulse />
          {t.roundOpen}
        </span>
        <span className="text-mk-micro tabular text-mockup-muted">
          {f.percent(ronda.progreso)} {t.ofTarget}
        </span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <AnimatedNumber
          value={ronda.capital}
          format={f.euros}
          className="text-mk-title tabular text-mockup-ink"
        />
        <span className="text-mk-caption tabular text-mockup-muted">
          {t.stripOf} {f.euros(ronda.objetivo)}
        </span>
      </div>

      <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-[1400ms] ease-out motion-reduce:transition-none"
          style={{ width: `${montado ? ronda.progreso : 0}%` }}
        />
      </div>

      {/*
        La ultima suscripcion es la que convierte tres cifras en un hecho que
        acaba de pasar. Va con el separador de punto medio y no en otra fila:
        una segunda fila solo por esto costaria 24px de pliegue.
      */}
      <p className="mt-3 text-mk-caption tabular text-mockup-muted">
        {f.int(ronda.accionistas)} {t.stripShareholders}{" "}
        {f.euros(ronda.ultima.importe)}
      </p>
    </div>
  );
}
