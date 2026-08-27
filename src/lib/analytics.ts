/**
 * Analitica (§11). PostHog en host europeo.
 *
 * Dos decisiones deliberadas:
 * 1. Se carga de forma diferida, despues del primer pintado, para no penalizar el LCP.
 * 2. `persistence: "memory"` significa que no se escribe ninguna cookie, asi que el
 *    sitio no necesita banner de consentimiento ni introduce esa friccion.
 *
 * Los eventos disparados antes de que la libreria termine de cargar se acumulan en
 * una cola y se envian en cuanto esta lista. Ninguno se pierde.
 */

import { env } from "./env";

type Props = Record<string, unknown>;

export type AnalyticsEvent =
  | "landing_view"
  | "cta_click"
  | "section_view"
  | "faq_open"
  | "form_start"
  | "form_submit_success"
  | "form_submit_error"
  | "calendar_click"
  | "calculator_interaction"
  /* Atajo de la calculadora para salir del estado de cobertura insuficiente. */
  | "calculator_shortcut"
  | "calculator_lead_submit"
  /*
    Sector elegido en las fichas de "En la practica". Es el unico dato de la
    pagina que dice a QUE sector pertenece quien la visita, asi que vale para
    saber cual mover al principio de la lista y cuales sobran.
  */
  | "sector_select"
  /*
    Acceso elegido en "Como funciona". Dice si al visitante le interesa mas la
    parte regulatoria, la operativa o la del accionista, que es la senal mas
    barata que da la pagina sobre por donde entrar en la conversacion.
  */
  | "surface_select";

type PostHogClient = {
  init: (key: string, config: Props) => void;
  capture: (event: string, props?: Props) => void;
};

let client: PostHogClient | null = null;
let loading = false;
const queue: Array<[AnalyticsEvent, Props | undefined]> = [];

const isBrowser = () => typeof window !== "undefined";

/** Parametros de campana y procedencia, adjuntos a la vista inicial. */
export function sourceProperties(): Props {
  if (!isBrowser()) return {};
  const params = new URLSearchParams(window.location.search);
  const props: Props = { referrer: document.referrer || "directo" };
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) props[key] = value;
  }
  return props;
}

function flush() {
  if (!client) return;
  while (queue.length > 0) {
    const next = queue.shift();
    if (next) client.capture(next[0], next[1]);
  }
}

export function initAnalytics() {
  if (!isBrowser() || loading || client) return;
  if (!env.posthogKey) return;
  loading = true;

  const start = () => {
    import("posthog-js")
      .then((mod) => {
        const posthog = mod.default as unknown as PostHogClient;
        posthog.init(env.posthogKey, {
          api_host: env.posthogHost,
          persistence: "memory",
          autocapture: false,
          capture_pageview: false,
          disable_session_recording: true,
        });
        client = posthog;
        flush();
      })
      .catch(() => {
        loading = false;
      });
  };

  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
    .requestIdleCallback;

  if (typeof idle === "function") {
    idle(start);
  } else {
    window.setTimeout(start, 1200);
  }
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (!isBrowser()) return;
  if (client) {
    client.capture(event, props);
    return;
  }
  queue.push([event, props]);
  if (queue.length > 40) queue.shift();
}
