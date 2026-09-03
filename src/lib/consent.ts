/**
 * Consentimiento de analitica (art. 22.2 de la Ley 34/2002 y guia de la AEPD).
 *
 * Existe desde el 02/09/2026, cuando la analitica pasa de medir sin cookies a
 * medir con ellas: paginas vistas, duracion, clics, mapas de calor y grabacion
 * de sesion. Todo eso escribe un identificador en el equipo de quien visita, y
 * eso es exactamente lo que la ley condiciona a consentimiento previo.
 *
 * TRES REGLAS QUE ESTE MODULO EXISTE PARA GARANTIZAR:
 *
 * 1. NADA antes del si. PostHog no se carga siquiera mientras el estado sea
 *    `null`. No es que se cargue y no capture: es que no se descarga el fichero.
 *    Un rechazo no puede dejar rastro de red.
 * 2. Rechazar cuesta lo mismo que aceptar. La AEPD lo pide explicitamente, y el
 *    banner lo cumple con dos botones del mismo tamano y en el mismo sitio; aqui
 *    se cumple con que `denied` sea un estado que se guarda igual que `granted`,
 *    y no un "ya te lo preguntare otra vez" disfrazado.
 * 3. La decision se puede cambiar. Por eso hay `clearConsent()` y por eso el pie
 *    lleva un enlace que la reabre.
 *
 * DONDE SE GUARDA. En `localStorage`, no en cookie. Guardar la propia decision
 * es tratamiento estrictamente necesario y esta exento del consentimiento
 * previo: es el unico modo de no volver a preguntar. Es tambien el unico dato
 * que este sitio escribe en el equipo de alguien que ha dicho que no.
 *
 * CADUCIDAD. La guia de la AEPD sitúa en 24 meses el plazo maximo para renovar
 * el consentimiento. Pasado ese plazo el registro se considera vencido y el
 * banner vuelve a salir, tanto si se acepto como si se rechazo.
 */

export type ConsentState = "granted" | "denied";

/** Version del registro. Subirla invalida los consentimientos anteriores. */
const VERSION = 1;

const KEY = "ownex_consent";

/** 24 meses en milisegundos. */
const MAX_AGE = 1000 * 60 * 60 * 24 * 365 * 2;

type Stored = { v: number; state: ConsentState; at: number };

const isBrowser = () => typeof window !== "undefined";

const listeners = new Set<(state: ConsentState | null) => void>();

/**
 * Estado guardado, o `null` si no hay ninguno valido.
 *
 * Devuelve `null` tambien cuando el registro esta caducado, es de una version
 * anterior o el almacenamiento no esta disponible (navegacion privada, tercero
 * bloqueado). El `null` siempre significa lo mismo: todavia no hay permiso, asi
 * que no se mide.
 */
export function readConsent(): ConsentState | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (parsed.v !== VERSION) return null;
    if (parsed.state !== "granted" && parsed.state !== "denied") return null;
    if (typeof parsed.at !== "number" || Date.now() - parsed.at > MAX_AGE) return null;

    return parsed.state;
  } catch {
    return null;
  }
}

/** Guarda la decision y avisa a quien este escuchando. */
export function setConsent(state: ConsentState) {
  if (!isBrowser()) return;

  try {
    const record: Stored = { v: VERSION, state, at: Date.now() };
    window.localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /*
      Si no se puede escribir, la decision vale para esta sesion y el banner
      volvera a salir en la siguiente. Preferible a romper la pagina: lo que no
      puede pasar es que un fallo de almacenamiento se interprete como un si.
    */
  }

  for (const listener of listeners) listener(state);
}

/** Borra la decision y vuelve a preguntar. Lo usa el enlace del pie. */
export function clearConsent() {
  if (!isBrowser()) return;

  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Nada que borrar si no habia donde escribir. */
  }

  for (const listener of listeners) listener(null);
}

/** Escucha los cambios. Devuelve la funcion para dejar de escuchar. */
export function subscribeConsent(listener: (state: ConsentState | null) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
