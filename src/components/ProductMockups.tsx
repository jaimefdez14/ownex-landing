import type { ReactNode } from "react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatEuros, formatInt } from "../lib/formatNumber";

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
    <div
      aria-hidden="true"
      className={
        flush
          ? "overflow-hidden rounded-lg bg-mockup-chrome shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)]"
          : "mt-4 overflow-hidden rounded-lg bg-mockup-chrome shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] lg:mt-8"
      }
    >
      <div className="flex items-center gap-3 px-4 py-2 lg:py-3">
        <span className="flex gap-[6px]">
          <span className="h-2 w-2 rounded-full bg-mockup-dot" />
          <span className="h-2 w-2 rounded-full bg-mockup-dot" />
          <span className="h-2 w-2 rounded-full bg-mockup-dot" />
        </span>
        <span className="truncate rounded-sm bg-mockup-surface px-3 py-1 text-micro text-mockup-muted">{label}</span>
      </div>
      <div className="bg-mockup-surface p-4 lg:p-5">{children}</div>
    </div>
  );
}

const votes = [
  { label: "Modelo A", share: 62, chosen: true },
  { label: "Modelo B", share: 38, chosen: false },
];

const holders = [
  { name: "Marta Solé", tier: "Tramo 3", amount: 5000, kyc: "verificado" as const },
  { name: "Laia Ferrer", tier: "Tramo 1", amount: 250, kyc: "pendiente" as const },
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
  return (
    <BrowserFrame flush label="marca.com/emision">
      <div className="flex items-center justify-between border-b border-mockup-badge pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-mockup-ink text-[10px] font-medium text-mockup-surface">
            M
          </span>
          <span className="text-label text-mockup-ink">Tu marca</span>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
          Ronda abierta
        </span>
      </div>

      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <p className="text-micro text-mockup-muted">Capital captado</p>
        <AnimatedNumber
          value={185250}
          format={formatEuros}
          className="mt-2 block text-title tabular text-mockup-ink"
        />
        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-mockup-badge">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: "74%" }} />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-micro text-mockup-muted">74{NB}% del objetivo</span>
          <span className="text-micro tabular text-mockup-muted">250.000{NB}€</span>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-3">
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Accionistas</p>
          <AnimatedNumber
            value={247}
            format={formatInt}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
        </div>
        <div className="rounded-md bg-mockup-raised p-3">
          <p className="text-micro text-mockup-muted">Ticket medio</p>
          <AnimatedNumber
            value={750}
            format={formatEuros}
            className="mt-1 block text-label tabular text-mockup-ink"
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-mockup-raised px-3 py-[10px] lg:mt-3">
        <span className="text-caption text-mockup-ink">Líneas en tu cap table</span>
        <span className="text-caption font-medium tabular text-mockup-accent">1</span>
      </div>
    </BrowserFrame>
  );
}

/**
 * Hub del Propietario (fase 02).
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
        <p className="text-micro text-mockup-muted">Mi participación</p>
        <AnimatedNumber
          value={1500}
          format={formatEuros}
          className="mt-2 block text-title tabular text-mockup-ink"
        />
        <div className="mt-2 flex gap-2 lg:mt-3">
          <span className="rounded-full bg-mockup-surface px-[10px] py-1 text-micro text-mockup-muted">Tramo 2</span>
          <span className="rounded-full bg-mockup-surface px-[10px] py-1 text-micro text-mockup-muted">3 participaciones</span>
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
                  className={option.chosen ? "h-full rounded-full bg-emerald-500" : "h-full rounded-full bg-mockup-dot"}
                  style={{ width: `${option.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-micro text-mockup-muted lg:mt-3">Cierra en 4 días</p>
      </div>
    </BrowserFrame>
  );
}

/**
 * Panel de la Marca (fase 03).
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
 * con estado de KYC) Y actúa sobre esa base (un beneficio activo dirigido a un
 * tramo). La lista de accionistas se recorta a dos filas, antes eran tres, para
 * dejar sitio a la tarjeta de beneficio sin que el panel crezca más que los
 * otros dos de la sección.
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

      <div className="mt-2 space-y-1 lg:mt-3">
        {holders.map((holder) => (
          <div
            key={holder.name}
            className="flex items-center justify-between gap-3 rounded-sm bg-mockup-raised px-3 py-[6px] lg:py-[10px]"
          >
            <span className="min-w-0">
              <span className="block truncate text-caption font-medium text-mockup-ink">{holder.name}</span>
              <span className="block text-micro text-mockup-muted">{holder.tier}</span>
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
        `ActivationMockup` retirado, para no inventar un ejemplo nuevo.
      */}
      <div className="mt-2 rounded-md bg-mockup-raised p-3 lg:mt-3 lg:p-4">
        <div className="flex items-center justify-between">
          <p className="text-micro text-mockup-muted">Beneficio activo · Tramo 3</p>
          <span className="rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
            Activo
          </span>
        </div>
        <p className="mt-2 text-caption font-medium text-mockup-ink">
          Acceso anticipado a la nueva colección
        </p>
        <p className="mt-1 text-micro text-mockup-muted">Dirigido a 86 accionistas</p>
      </div>
    </BrowserFrame>
  );
}
