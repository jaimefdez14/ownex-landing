/**
 * Analitica (§11). PostHog en host europeo.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * MEDICION COMPLETA, CON CONSENTIMIENTO - 02/09/2026, decision de Jaime
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Hasta hoy este fichero iniciaba PostHog con `persistence: "memory"`,
 * `autocapture: false`, `capture_pageview: false` y la grabacion de sesion
 * desactivada. Esa configuracion no escribia nada en el equipo de nadie, y por
 * eso el sitio no necesitaba banner. Tambien significaba que solo se veian los
 * catorce eventos manuales de esta lista: ni una pagina vista, ni un segundo de
 * duracion, ni un clic fuera de los botones instrumentados a mano.
 *
 * Se cambia a proposito y sabiendo lo que cuesta: vuelve el banner de
 * consentimiento que se habia evitado, y las paginas legales se reescriben para
 * decir la verdad. A cambio se obtiene duracion de la visita, mapa de clics,
 * profundidad de scroll, visitante recurrente, atribucion de campana y
 * grabacion de sesion.
 *
 * LA REGLA QUE NO SE NEGOCIA: mientras no haya un si explicito, este modulo NO
 * carga PostHog. No se importa el modulo, no se hace una sola peticion de red.
 * Ver `consent.ts`. Un rechazo tiene que ser indistinguible de no tener
 * analitica instalada.
 *
 * DOS DECISIONES QUE SE MANTIENEN DE LA VERSION ANTERIOR:
 * 1. Se carga de forma diferida, despues del primer pintado, para no penalizar
 *    el LCP. Ahora ademas se carga despues de una interaccion humana, asi que
 *    nunca compite con la primera pantalla.
 * 2. `posthog-js` sigue siendo una importacion dinamica, o sea que quien
 *    rechaza no descarga ni un byte de la libreria.
 */

import { env } from "./env";
import { readConsent, subscribeConsent } from "./consent";

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
  /*
    Modalidad elegida en el conmutador equity / deuda del simulador (04/09/2026).
    Es la senal que dice cual de los dos instrumentos interesa de verdad, y es
    barata: llega en cuanto alguien toca el control, mucho antes del correo. Se
    manda en cada cambio, no solo en el primero, porque lo que interesa es sobre
    cual se acaba parando y no que alguien lo probara.
  */
  | "calculator_mode"
  | "calculator_lead_submit"
  /*
    Tramo elegido en el cebo del hero. Es la unica senal que da la primera
    pantalla sobre el TAMANO de comunidad que se reconoce en la propuesta, y llega
    antes de que nadie rellene nada. Se manda en cada pulsacion, no solo en la
    primera: lo que interesa es el ultimo tramo elegido, no que alguien lo tocara.
  */
  | "hero_estimate"
  /*
    Sector elegido en las fichas de "En la practica". Es el unico dato de la
    pagina que dice a QUE sector pertenece quien la visita, asi que vale para
    saber cual mover al principio de la lista y cuales sobran.
  */
  | "sector_select"
  /*
    Acceso elegido en "Como funciona". Se retiro el 27/08 al desaparecer la barra
    de pestañas y vuelve el 28/08 con el escaparate anclado, que tiene sus tres
    puntos pulsables. Dice si al visitante le interesa mas la parte regulatoria,
    la operativa o la del accionista, que es la senal mas barata que da la pagina
    sobre por donde entrar en la conversacion.

    OJO: solo se dispara al PULSAR un punto, no cuando el escaparate cambia solo
    al desplazarse. Si se disparara con el scroll, cada visita mandaria los tres y
    el dato dejaria de decir nada.
  */
  | "surface_select"
  /*
    Respuesta al banner de consentimiento. Solo se envia el "acepto", por un
    motivo evidente: el "rechazo" no se puede medir sin medir a quien acaba de
    pedir que no se le mida. La proporcion se estima comparando visitas del
    servidor con visitas de PostHog, no instrumentando el no.
  */
  | "consent_granted"
  /*
    Cambio de idioma desde el conmutador (16/09/2026). Lleva `from` y `to`. Junto con
    la propiedad `idioma` que viaja en TODOS los eventos (ver `track`), es lo que dice
    cuanto trafico usa la version inglesa y si convierte distinto.
  */
  | "language_switch";

type PostHogClient = {
  init: (key: string, config: Props) => void;
  capture: (event: string, props?: Props) => void;
  opt_out_capturing: () => void;
  reset: () => void;
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

function load() {
  if (!isBrowser() || loading || client) return;
  if (!env.posthogKey) return;
  loading = true;

  const start = () => {
    /* El consentimiento se pudo retirar entre la programacion y la ejecucion. */
    if (readConsent() !== "granted") {
      loading = false;
      return;
    }

    import("posthog-js")
      .then((mod) => {
        if (readConsent() !== "granted") {
          loading = false;
          return;
        }

        const posthog = mod.default as unknown as PostHogClient;
        posthog.init(env.posthogKey, {
          api_host: env.posthogHost,

          /*
            Con cookie, que es lo que cambia respecto a la version anterior.
            `localStorage+cookie` es lo que permite reconocer al visitante
            recurrente y coser la sesion entre la landing y las paginas legales,
            que son documentos HTML sueltos y cargan de cero.
          */
          persistence: "localStorage+cookie",

          /*
            Cookie de este host y nada mas. Por defecto PostHog la escribe en el
            dominio padre para compartirla entre subdominios, y aqui eso no
            aporta nada (solo hay un sitio) pero complica borrarla: una cookie de
            `.ownex.co` no se elimina desde una pagina de `ownex.co` si no se
            acierta con el dominio exacto. Retirar el consentimiento tiene que
            funcionar siempre, asi que se renuncia a esa funcion.
          */
          cross_subdomain_cookie: false,

          /*
            NADIE INICIA SESION EN ESTA PAGINA, asi que no hay una sola persona
            que identificar: `identified_only` evita que PostHog cree una ficha
            de persona por cada visitante anonimo. Encaja con lo que dice la
            politica de privacidad (que PostHog no recibe tu nombre ni tu correo,
            ni siquiera al enviar el formulario) y de paso evita pagar por fichas
            que no sirven para nada. Nunca se llama a `identify`.
          */
          person_profiles: "identified_only",

          /* Paginas vistas y, sobre todo, `$pageleave`: sin el segundo evento
             no hay forma de calcular cuanto ha durado una visita. */
          capture_pageview: true,
          capture_pageleave: true,

          /* Clics, envios y cambios de campo sin instrumentar nada a mano. Es
             la base sobre la que PostHog dibuja el mapa de calor. */
          autocapture: true,
          enable_heatmaps: true,

          /*
            GRABACION DE SESION, con las mascaras puestas.

            `maskAllInputs` es el valor por defecto de PostHog, pero va escrito
            a proposito: en esta pagina el formulario recoge nombre, correo y
            marca, o sea datos personales de un tercero, y una grabacion que los
            capturase convertiria un problema de analitica en uno de proteccion
            de datos. `maskTextSelector` extiende la mascara a cualquier nodo
            marcado con `data-ph-mask`, para tapar tambien texto que no sea un
            campo de formulario.
          */
          disable_session_recording: false,
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: "[data-ph-mask]",
          },
        });

        client = posthog;
        flush();
      })
      .catch(() => {
        loading = false;
      });
  };

  /*
    EL `timeout` NO ES DECORATIVO - 02/09/2026.

    `requestIdleCallback` solo dispara cuando el navegador encuentra un hueco
    libre, y esta pagina no se lo da: el hero lleva un lienzo WebGL
    (`GradientWaves`) pintando en cada fotograma mientras esta a la vista. Sin
    plazo maximo, la llamada se puede quedar esperando indefinidamente, y eso es
    lo que pasaba: al aceptar el banner, PostHog no llegaba a cargarse hasta la
    siguiente recarga de la pagina. Se detecto probandolo en el navegador, no
    leyendo el codigo.

    Con `timeout` el navegador se compromete a ejecutarlo pasado ese plazo aunque
    nunca haya estado ocioso. Sigue siendo posterior al primer pintado, que es
    para lo que estaba puesto el `requestIdleCallback`, asi que el LCP no se
    resiente.

    El fallo venia de antes de este cambio: la version sin consentimiento tenia
    la misma llamada sin plazo. Alli se notaba menos porque `initAnalytics`
    corria al montar, cuando el lienzo todavia no habia arrancado.
  */
  const idle = (
    window as unknown as {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => void;
    }
  ).requestIdleCallback;

  if (typeof idle === "function") {
    idle(start, { timeout: 2000 });
  } else {
    window.setTimeout(start, 1200);
  }
}

/**
 * Borra todo lo que PostHog haya escrito en este navegador.
 *
 * POR QUE A MANO. `opt_out_capturing()` no borra el identificador: apunta la
 * negativa DENTRO de la misma persistencia y la deja donde estaba, y `reset()`
 * genera un identificador nuevo en lugar de quitarlo. Se comprobo en el
 * navegador: tras retirar el consentimiento, la cookie `ph_..._posthog` seguia
 * ahi. Eso convertiria en falsa la frase de la politica de cookies que promete
 * que al retirarlo el identificador se elimina, asi que se elimina de verdad.
 *
 * Se barre por prefijo `ph_` y no por nombre exacto porque PostHog escribe
 * varias claves (el identificador, el id de ventana, la marca de sesion) y la
 * lista cambia entre versiones. El prefijo es suyo y de nadie mas.
 */
function wipeStoredIdentifiers() {
  if (!isBrowser()) return;

  try {
    for (const raw of document.cookie.split(";")) {
      const name = raw.split("=")[0].trim();
      if (name.startsWith("ph_")) {
        document.cookie = `${name}=; max-age=0; path=/`;
      }
    }
  } catch {
    /* Sin cookies que recorrer, no hay nada que borrar. */
  }

  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      for (const key of Object.keys(store)) {
        if (key.startsWith("ph_")) store.removeItem(key);
      }
    } catch {
      /* Almacenamiento no disponible: tampoco habia nada escrito. */
    }
  }
}

/**
 * Corta la medicion y borra el identificador guardado por PostHog.
 *
 * TERMINA RECARGANDO LA PAGINA, y no por comodidad. Se probo la version sin
 * recarga y no funcionaba: mientras la instancia de PostHog sigue viva vuelve a
 * escribir su almacenamiento por su cuenta, asi que la cookie reaparecia unos
 * milisegundos despues de borrarla. `opt_out_capturing()` no ayuda, porque su
 * forma de recordar la negativa es precisamente guardarla en esa misma cookie.
 *
 * La libreria no ofrece ninguna manera de descargarse. Recargar es la unica que
 * garantiza lo que promete la politica de cookies: que al retirar el permiso el
 * identificador desaparece del navegador. En la pagina siguiente el
 * consentimiento ya es nulo, PostHog no se inicia y no queda nada que escriba.
 *
 * Solo se recarga si PostHog llego a arrancar. Quien nunca acepto no tiene nada
 * que borrar, y ahi el enlace del pie se limita a reabrir el banner.
 */
function unload() {
  queue.length = 0;

  /*
    `loading` vuelve a cero, y no es un detalle. Es el pestillo que impide cargar
    la libreria dos veces; si `unload` lo dejara puesto, un visitante que rechaza
    y luego acepta se quedaria sin medir hasta recargar la pagina, en silencio.
    Aparecio probando ese recorrido exacto en el navegador.
  */
  loading = false;

  const wasRunning = client !== null;

  if (client) {
    try {
      /* Corta la captura y la grabacion en el acto, antes de la recarga. */
      client.opt_out_capturing();
      client.reset();
    } catch {
      /* Si la libreria ya no responde, basta con soltarla y limpiar. */
    }
    client = null;
  }

  wipeStoredIdentifiers();

  if (wasRunning) window.location.reload();
}

/**
 * Punto de entrada unico, llamado una vez desde `App`.
 *
 * Arranca la medicion si ya hay consentimiento y se queda escuchando, para que
 * aceptar o retirar el permiso surta efecto en el acto y sin recargar.
 */
export function initAnalytics() {
  if (!isBrowser()) return;

  if (readConsent() === "granted") {
    load();
  } else {
    /*
      Sin permiso, toda carga de pagina empieza barriendo lo que PostHog hubiera
      dejado. Cubre el rastro que la propia libreria escribe al descargarse la
      pagina anterior (su evento de salida) y el de quien retiro el permiso desde
      otra pestaña. Aqui es seguro porque no hay ninguna instancia viva que pueda
      volver a escribirlo.
    */
    wipeStoredIdentifiers();
  }

  subscribeConsent((state) => {
    if (state === "granted") load();
    else unload();
  });
}

export function track(event: AnalyticsEvent, props?: Props) {
  if (!isBrowser()) return;

  /*
    EL IDIOMA VA EN CADA EVENTO - 16/09/2026. Los rotulos que se mandan (`label`) se
    quedan en espanol a proposito, como identificadores estables: si cambiaran con el
    idioma, el mismo boton contaria como dos en cada embudo. Lo que separa las dos
    versiones es esta propiedad, que se lee del `lang` del documento.
  */
  props = { idioma: document.documentElement.lang || "es", ...props };

  if (client) {
    client.capture(event, props);
    return;
  }

  /*
    La cola solo existe para el hueco entre el si y el momento en que la
    libreria termina de cargar. Sin consentimiento no se acumula nada: un evento
    guardado antes del si acabaria enviandose despues, o sea midiendo un
    comportamiento anterior al permiso, que es justo lo que el permiso impide.
  */
  if (readConsent() !== "granted") return;

  queue.push([event, props]);
  if (queue.length > 40) queue.shift();
}
