import type { ReactNode } from "react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatEuros, formatInt } from "../lib/formatNumber";

/**
 * Mockups del producto (Panel de la Marca / Hub del Propietario), portados de la
 * v1 para las fases 02 y 03 de "Cómo funciona". No hay capturas reales todavía,
 * así que se construyen en HTML y CSS con datos de ejemplo.
 *
 * La ventana de navegador es deliberadamente clara, con colores fijos en vez de
 * las variables de color oscuras del resto del sitio: es lo que separa visualmente "esto es
 * una captura de pantalla" del lienzo, que es oscuro de principio a fin. Misma
 * lógica que ya aplicaba la v1 (Stripe y Klaviyo muestran así las suyas).
 *
 * Espacio de nombres del texto no es NB ( ): los importes de ejemplo lo usan
 * antes de "€" para que `check:copy` no los marque como espacio sin espacio duro.
 */

const NB = " ";

function BrowserFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="mt-4 overflow-hidden rounded-lg bg-mockup-chrome shadow-[0_20px_50px_-24px_rgba(0,0,0,0.6)] lg:mt-8"
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

const segments = [
  { name: "Todos los accionistas", count: 412, selected: false },
  { name: "Tramo 3 · posición alta", count: 86, selected: true },
  { name: "Sin compra · 90 días", count: 24, selected: false },
];

const votes = [
  { label: "Modelo A", share: 62, chosen: true },
  { label: "Modelo B", share: 38, chosen: false },
];

/**
 * Motor de activación (fase 03).
 *
 * Antes esta fase mostraba el Panel de la Marca: capital captado y libro de
 * propietarios. Eso es administración, y el texto de la fase no habla de
 * administrar: habla de comportamiento (compran más, refieren más, permanecen más)
 * y de "las herramientas para activar ese comportamiento". El mockup ilustraba
 * otra cosa distinta de la que decía el texto justo al lado.
 *
 * Este panel muestra esas herramientas: segmentar la base de accionistas, lanzar
 * una acción dirigida a un tramo y ver la recomendación que genera.
 *
 * Deliberadamente no muestra métricas de resultado del tipo "los accionistas
 * compran 2 veces más": serían cifras de rendimiento inventadas presentadas como
 * si fueran datos. Lo que se ve son capacidades del producto con datos de ejemplo,
 * que es una afirmación que sí se sostiene.
 */
export function ActivationMockup() {
  return (
    <BrowserFrame label="marca.com/activacion">
      <div className="flex items-center justify-between">
        <p className="text-label text-mockup-ink">Segmentos</p>
        <span className="rounded-full bg-mockup-ink px-[10px] py-1 text-micro text-mockup-surface">
          Nueva acción
        </span>
      </div>

      <div className="mt-2 space-y-1 lg:mt-3">
        {segments.map((segment) => (
          <div
            key={segment.name}
            className={
              segment.selected
                ? "flex items-center justify-between gap-3 rounded-sm bg-emerald-500/10 px-3 py-[6px] ring-1 ring-inset ring-emerald-500/30 lg:py-[10px]"
                : "flex items-center justify-between gap-3 rounded-sm bg-mockup-raised px-3 py-[6px] lg:py-[10px]"
            }
          >
            <span className="flex items-center gap-2">
              <span
                className={
                  segment.selected
                    ? "h-[6px] w-[6px] shrink-0 rounded-full bg-emerald-500"
                    : "h-[6px] w-[6px] shrink-0 rounded-full bg-mockup-dot"
                }
              />
              <span
                className={
                  segment.selected
                    ? "text-caption font-medium text-mockup-ink"
                    : "text-caption text-mockup-ink"
                }
              >
                {segment.name}
              </span>
            </span>
            <AnimatedNumber
              value={segment.count}
              format={formatInt}
              className="text-caption tabular text-mockup-muted"
            />
          </div>
        ))}
      </div>

      {/* La acción dirigida al segmento elegido: el beneficio que activa la compra. */}
      <div className="mt-3 rounded-md bg-mockup-raised p-3 lg:mt-4 lg:p-4">
        <p className="text-micro text-mockup-muted">Beneficio para Tramo 3</p>
        <p className="mt-2 text-caption font-medium text-mockup-ink">
          Acceso anticipado a la nueva colección
        </p>
        <div className="mt-2 flex items-center justify-between lg:mt-3">
          <span className="text-micro text-mockup-muted">86 accionistas</span>
          <span className="rounded-full bg-emerald-500/15 px-[10px] py-1 text-micro font-medium text-mockup-accent">
            Activo
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between rounded-md bg-mockup-raised px-4 py-2 lg:mt-3 lg:py-3">
        <span>
          <span className="block text-caption font-medium text-mockup-ink">Enlace de recomendación</span>
          <span className="block text-micro text-mockup-muted">Activo para los 412 accionistas</span>
        </span>
        <span className="rounded-sm bg-mockup-badge px-[10px] py-1 text-micro text-mockup-muted">Copiar</span>
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
