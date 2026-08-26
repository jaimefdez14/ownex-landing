import { useRef, type ReactNode } from "react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatEuros, formatInt } from "../lib/formatNumber";
import { useLiveRound } from "../lib/useLiveRound";
import { useDrawOnReveal } from "../lib/useDrawOnReveal";

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

/**
 * `flush` quita el margen superior del marco. Los paneles de "Cómo funciona" van
 * debajo del texto de su fase y necesitan ese margen; el del hero ocupa su propia
 * celda de la retícula, donde el hueco ya lo pone el `gap`, y ahí el margen se
 * sumaba al del contenedor y descuadraba el centrado vertical respecto a la
 * columna de texto.
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
          <span className="flex min-w-0 items-center gap-2 rounded-sm bg-mockup-surface px-3 py-1">
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
            <span className="truncate text-micro text-mockup-muted">{label}</span>
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
      className="mt-3 h-9 w-full lg:h-11"
      fill="none"
    >
      <defs>
        <linearGradient id="ownex-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="draw-area" d={`${line} L100 36 L0 36 Z`} fill="url(#ownex-spark)" />
      <path
        className="draw-line"
        d={line}
        stroke="#10B981"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle className="draw-area" cx="100" cy="4" r="2.5" fill="#10B981" vectorEffect="non-scaling-stroke" />
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
function AvatarStack({ initials, rest }: { initials: string[]; rest: number }) {
  return (
    <span className="flex items-center">
      {initials.map((text, index) => (
        <span
          key={text}
          className="-ml-[7px] flex h-5 w-5 items-center justify-center rounded-full bg-mockup-badge text-[10px] font-medium text-mockup-muted ring-2 ring-mockup-raised first:ml-0"
          style={{ zIndex: initials.length - index }}
        >
          {text}
        </span>
      ))}
      <span className="ml-2 text-micro tabular text-mockup-muted">+{formatInt(rest)}</span>
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

const votes = [
  { label: "Modelo A", share: 62, chosen: true },
  { label: "Modelo B", share: 38, chosen: false },
];

const holders = [
  { name: "Marta Solé", initials: "MS", tier: "Tramo 3", amount: 5000, kyc: "verificado" as const },
  { name: "Laia Ferrer", initials: "LF", tier: "Tramo 1", amount: 250, kyc: "pendiente" as const },
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

  return (
    <BrowserFrame flush label="marca.com/emision">
      <div className="flex items-center justify-between border-b border-mockup-badge pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-mockup-ink text-[10px] font-medium text-mockup-surface">
            M
          </span>
          <span className="text-label text-mockup-ink">Tu marca</span>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
          <LivePulse />
          Ronda abierta
        </span>
      </div>

      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-micro text-mockup-muted">Capital captado</p>
            <AnimatedNumber
              value={ronda.capital}
              format={formatEuros}
              className="mt-2 block text-title tabular text-mockup-ink"
            />
          </div>
          {/*
            El delta semanal. Sin él, la cifra grande podría ser un saldo
            parado; con él se lee que la ronda se mueve, que es justo lo que
            el sparkline de debajo dibuja.
          */}
          <span className="mt-[2px] shrink-0 rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium tabular text-mockup-accent">
            +12.400{NB}€ / 7d
          </span>
        </div>

        <Sparkline />

        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
          {/*
            `transition` en el ancho y no un salto: la barra acompana a la cifra
            en vez de teletransportarse cuando entra una suscripcion.
          */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${ronda.progreso}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-micro tabular text-mockup-muted">{ronda.progreso}{NB}% del objetivo</span>
          <span className="text-micro tabular text-mockup-muted">{formatEuros(ronda.objetivo)}</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Accionistas</p>
          <AnimatedNumber
            value={ronda.accionistas}
            format={formatInt}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
          <span className="mt-2 block">
            <AvatarStack initials={["M", "J", "L", "A"]} rest={ronda.accionistas - 4} />
          </span>
        </div>
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Ticket medio</p>
          <AnimatedNumber
            value={750}
            format={formatEuros}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
          <span className="mt-2 block text-micro text-mockup-muted">Mediana 400{NB}€</span>
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
        <span className="min-w-0 flex-1 truncate text-caption text-mockup-ink">
          Nueva suscripción de {formatEuros(ronda.ultima.importe)}
        </span>
        <span className="shrink-0 text-micro text-mockup-muted">ahora</span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-mockup-raised px-3 py-[10px] lg:mt-3">
        <span className="text-caption text-mockup-ink">Líneas en tu cap table</span>
        <span className="text-caption font-medium tabular text-mockup-accent">1</span>
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
 *  - Que los accionistas **votan**. Era una fila de texto ("Voto abierto: dos
 *    referencias para otoño"), no una votación. Ahora es una votación de verdad,
 *    con opciones, reparto y estado, que es la parte de gobernanza del producto.
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
export function OwnerHubMockup() {
  return (
    <BrowserFrame label="marca.com/mi-participacion">
      {/* Cabecera de la marca: es lo que hace visible que el panel es suyo. */}
      <div className="flex items-center justify-between border-b border-mockup-badge pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-mockup-ink text-[10px] font-medium text-mockup-surface">
            M
          </span>
          <span className="text-label text-mockup-ink">Tu marca</span>
        </div>
        <span className="text-micro text-mockup-muted">Mi cuenta</span>
      </div>

      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-micro text-mockup-muted">Mi participación</p>
            <AnimatedNumber
              value={1500}
              format={formatEuros}
              className="mt-2 block text-title tabular text-mockup-ink"
            />
          </div>
          <span className="mt-[2px] shrink-0 rounded-full bg-mockup-accent px-[10px] py-1 text-micro font-medium text-mockup-surface">
            Tramo 2
          </span>
        </div>

        {/*
          Progreso hasta el siguiente tramo. Es la mecánica que hace que la
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
          <span className="text-micro text-mockup-muted">3 participaciones</span>
          <span className="text-micro tabular text-mockup-muted">1.000{NB}€ para el Tramo 3</span>
        </div>
      </div>

      {/* Votación: la parte de gobernanza, que antes solo se mencionaba. */}
      <div className="mt-2 rounded-md bg-mockup-raised p-3 lg:mt-3 lg:p-4">
        <div className="flex items-center justify-between">
          <p className="text-label text-mockup-ink">Votación abierta</p>
          <span className="rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
            Has votado
          </span>
        </div>
        <p className="mt-2 text-caption text-mockup-muted">¿Qué referencia lanzamos en otoño?</p>

        <div className="mt-2 space-y-2 lg:mt-3">
          {votes.map((option) => (
            <div key={option.label}>
              <div className="flex items-center justify-between">
                <span
                  className={
                    option.chosen
                      ? "text-caption font-medium text-mockup-ink"
                      : "text-caption text-mockup-muted"
                  }
                >
                  {option.label}
                </span>
                <span className="text-caption tabular text-mockup-muted">{option.share}{NB}%</span>
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
          <AvatarStack initials={["J", "A", "M"]} rest={161} />
          <span className="text-micro text-mockup-muted">Cierra en 4 días</span>
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
 * con estado de KYC) Y actúa sobre esa base (un beneficio dirigido a un tramo).
 * La lista de accionistas se recorta a dos filas, antes eran tres, para dejar
 * sitio a la tarjeta de beneficio sin que el panel crezca más que los otros dos
 * de la sección.
 */
export function BrandPanelMockup() {
  return (
    <BrowserFrame label="marca.com/accionistas">
      <div className="flex items-center justify-between">
        <p className="text-label text-mockup-ink">Libro de accionistas</p>
        <span className="rounded-sm bg-mockup-badge px-[10px] py-1 text-micro text-mockup-muted">Exportar</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Capital captado</p>
          <AnimatedNumber
            value={185250}
            format={formatEuros}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
        </div>
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Accionistas</p>
          <AnimatedNumber
            value={247}
            format={formatInt}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
        </div>
      </div>

      {/*
        Reparto por tramos. Es la herramienta de segmentación del texto de la
        fase enseñada como lo que es: una base partida en tres, sobre la que
        después se dirige el beneficio de abajo.
      */}
      <div className="mt-2 rounded-md bg-mockup-raised p-3 lg:mt-3">
        <div className="flex items-center justify-between">
          <p className="text-micro text-mockup-muted">Reparto por tramos</p>
          <span className="text-micro text-mockup-muted">247 accionistas</span>
        </div>
        <div className="mt-2 flex h-[8px] gap-[3px] overflow-hidden">
          <span className="rounded-full bg-emerald-500" style={{ width: "35%" }} />
          <span className="rounded-full bg-emerald-500/45" style={{ width: "30%" }} />
          <span className="rounded-full bg-mockup-dot" style={{ width: "35%" }} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-[6px] text-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-emerald-500" />
            Tramo 3 · 86
          </span>
          <span className="flex items-center gap-[6px] text-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-emerald-500/45" />
            Tramo 2 · 74
          </span>
          <span className="flex items-center gap-[6px] text-micro text-mockup-muted">
            <span className="h-[6px] w-[6px] rounded-full bg-mockup-dot" />
            Tramo 1 · 87
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
                <span className="block truncate text-caption font-medium text-mockup-ink">{holder.name}</span>
                <span className="block text-micro text-mockup-muted">{holder.tier}</span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2">
              <AnimatedNumber value={holder.amount} format={formatEuros} className="text-caption tabular text-mockup-muted" />
              <span
                className={
                  holder.kyc === "verificado"
                    ? "rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent"
                    : "rounded-full bg-mockup-badge px-[10px] py-1 text-micro text-mockup-muted"
                }
              >
                {holder.kyc === "verificado" ? "Verificado" : "Pendiente"}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/*
        La mitad de activación: un beneficio ya lanzado y dirigido a un segmento.
        86 accionistas y "Tramo 3" son las mismas cifras que usaba el
        `ActivationMockup` retirado, y las mismas que el reparto por tramos de
        arriba: el beneficio va dirigido justo a ese segmento.
      */}
      <div className="mt-2 rounded-md bg-mockup-surface p-3 shadow-[0_2px_8px_-2px_rgba(20,20,16,0.18)] lg:mt-3 lg:p-4">
        <div className="flex items-center justify-between">
          <p className="text-micro text-mockup-muted">Beneficio activo · Tramo 3</p>
          <span className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
            <LivePulse />
            Activo
          </span>
        </div>
        <p className="mt-2 text-caption font-medium text-mockup-ink">
          Acceso anticipado a la nueva colección
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <AvatarStack initials={["M", "J", "A"]} rest={83} />
          <span className="text-micro tabular text-mockup-muted">41{NB}% ya activado</span>
        </div>
      </div>
    </BrowserFrame>
  );
}
