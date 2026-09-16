import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { readConsent, setConsent, subscribeConsent } from "../lib/consent";
import { hasConsentedAnalytics } from "../lib/env";
import { track } from "../lib/analytics";
import { useCopy } from "../i18n/locale";
import { LEGAL } from "../i18n/routes";

/*
  El texto ingles dice lo MISMO que el espanol, ni mas ni menos, y eso aqui no es
  estilo: la primera capa del consentimiento tiene que declarar la finalidad (guia de
  la AEPD), y una version que dijera menos dejaria el consentimiento cojo en un idioma
  y no en el otro. El enlace apunta a la politica de cookies del mismo idioma.
*/
const COPY = {
  es: {
    title: "Cookies",
    body: "Usamos cookies propias y de terceros para medir cómo se usa la página y mejorarla. Si no aceptas, no se instala ninguna.",
    policy: "Política de cookies",
    reject: "Rechazar",
    accept: "Aceptar",
  },
  en: {
    title: "Cookies",
    body: "We use our own and third-party cookies to measure how the page is used and to improve it. If you don't accept, none are installed.",
    policy: "Cookie policy",
    reject: "Reject",
    accept: "Accept",
  },
};

/**
 * Banner de consentimiento de analitica.
 *
 * Aparece el 02/09/2026, cuando la medicion pasa a usar cookies (ver
 * `lib/analytics.ts`). Hasta entonces el sitio presumia, con razon, de no
 * necesitarlo.
 *
 * LAS CUATRO REGLAS QUE LO GOBIERNAN, y de donde salen:
 *
 *  - Rechazar cuesta lo mismo que aceptar. Los dos botones son la MISMA
 *    variante, el mismo tamano y estan uno al lado del otro. Por eso "Aceptar"
 *    no usa el esmeralda solido del resto de la pagina: seria el unico boton
 *    con resplandor de toda la interfaz, y la guia de la AEPD sobre patrones
 *    enganosos va exactamente contra eso. Aqui el acento de marca se cede a
 *    proposito.
 *  - No hay muro. El banner no bloquea el contenido, no atenua el fondo y no
 *    atrapa el foco: se puede leer la pagina entera sin contestar. Lo unico que
 *    no ocurre mientras tanto es la medicion.
 *  - No hay tercera opcion disfrazada. Ni "seguir navegando", ni una X que
 *    equivalga a un si. Cerrar sin decidir no existe: o se acepta o se rechaza.
 *  - Se puede cambiar de idea. El pie lleva "Preferencias de cookies", que
 *    borra la decision y vuelve a abrir esto (`clearConsent`).
 *
 * SIN JAVASCRIPT NO SE PINTA, y es correcto: sin JavaScript tampoco se carga
 * PostHog, asi que no hay nada que consentir.
 *
 * TAPA LA BARRA MOVIL. `MobileCtaBar` vive tambien abajo del todo, en `z-40`.
 * Este banner va en `z-50` y la cubre mientras haya una decision pendiente. Es
 * el orden que toca: primero se contesta, despues se convierte. En la practica
 * casi nunca coinciden, porque la barra movil no entra hasta haber dejado atras
 * la primera pantalla, y el banner suele contestarse antes de eso.
 */
export function ConsentBanner() {
  const t = useCopy(COPY);
  const legal = useCopy(LEGAL);
  /*
    `null` significa "todavia no se ha leido el almacenamiento", que es el estado
    del prerenderizado y el del primer pintado. Se distingue del "no hay decision
    guardada" con `open`, y por eso el servidor y el cliente coinciden en pintar
    nada: sin esto, la hidratacion no cuadraria.
  */
  const [open, setOpen] = useState(false);
  const [focusOnOpen, setFocusOnOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /*
      SIN HERRAMIENTA NO HAY BANNER. `initAnalytics` no carga nada cuando
      `VITE_POSTHOG_KEY` esta vacia y Google Analytics esta apagado (`VITE_GA_ID=off`), asi que un banner ahi seria pedir
      permiso para algo que no va a ocurrir: friccion pura y, encima,
      consentimientos guardados que no consienten nada. Mientras la clave no
      este puesta, el sitio se comporta exactamente como antes de este cambio.
    */
    if (!hasConsentedAnalytics) return;

    setOpen(readConsent() === null);

    return subscribeConsent((state) => {
      setOpen(state === null);
      /*
        Solo se roba el foco cuando el banner REAPARECE por haberse borrado la
        decision desde el pie. En la primera visita el foco se queda donde
        estaba: mover el foco al banner nada mas cargar dejaria a un usuario de
        teclado empezando la pagina por el final.
      */
      if (state === null) setFocusOnOpen(true);
    });
  }, []);

  useEffect(() => {
    if (open && focusOnOpen) {
      panel.current?.focus();
      setFocusOnOpen(false);
    }
  }, [open, focusOnOpen]);

  if (!open) return null;

  const accept = () => {
    setConsent("granted");
    /*
      Se envia despues de guardar el si, asi que ya hay permiso cuando el evento
      entra en la cola. Es el primer evento de la sesion.
    */
    track("consent_granted");
  };

  return (
    <div
      ref={panel}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-body"
      className="consent-banner theme-dark fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 outline-none backdrop-blur-xl"
    >
      <div className="shell py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-measure">
            <p id="consent-title" className="mb-1 text-label font-medium text-foreground">
              {t.title}
            </p>
            {/*
              PRIMERA CAPA A NIVEL DE FINALIDAD - 02/09/2026, decision de Jaime.

              Este texto ha bajado dos escalones en el mismo dia y conviene que
              quede escrito por que, para que dentro de un mes no parezca que se
              recorto por descuido.

              Empezo contando el tratamiento entero: quien mide, donde se aloja,
              que se graba y con que mascaras. Cuatro lineas en un movil que se
              leian como una confesion. Se recorto a finalidad mas grabacion, y
              Jaime siguio viendolo "demasiado claro y raro".

              Ahora se queda en la FINALIDAD, que es lo que la guia de la AEPD
              pide de la primera capa: quien pone las cookies (propias y de
              terceros), para que (medir el uso), las dos respuestas, y el enlace
              a la segunda capa. La grabacion del recorrido es una TECNICA dentro
              de esa finalidad, no una finalidad distinta, asi que vive en la
              politica de cookies, que la describe entera en su apartado 3 y la
              anuncia ya en su entradilla.

              SE ADVIRTIO, y la advertencia sigue en pie: nombrar la grabacion
              aqui era la opcion mas defendible, porque nadie discute un banner
              que dice lo que hace. Al bajar a finalidad, TODO el peso recae en
              que la segunda capa este a un clic y sea explicita. Si algun dia se
              toca el enlace de abajo, o la politica de cookies deja de hablar
              claro de la grabacion en su primer parrafo, este banner se queda
              corto y hay que volver a subir el detalle aqui.

              LO QUE NO SE PUEDE HACER, y se planteo: juntar esto con unos
              terminos y condiciones. El consentimiento tiene que ser especifico
              (art. 4.11 del RGPD); un boton que acepta dos cosas a la vez no
              vale para ninguna. Ademas esta web no tiene terminos que aceptar:
              es informativa, no un servicio contratable.
            */}
            <p id="consent-body" className="text-caption text-text-secondary">
              {t.body}{" "}
              <a
                href={legal.cookies}
                /* `whitespace-nowrap`: sin esto el enlace se parte y deja "de
                   cookies" solo en una segunda linea. Que salte entero. */
                className="whitespace-nowrap text-accent-ink underline underline-offset-4"
              >
                {t.policy}
              </a>
            </p>
          </div>

          {/*
            `shrink-0` y el ancho fijo en escritorio: los dos botones tienen que
            verse igual de grandes pase lo que pase con el texto de al lado. En
            movil ocupan media fila cada uno, o sea tambien iguales.
          */}
          <div className="flex shrink-0 gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setConsent("denied")}
              className="flex-1 lg:w-36 lg:flex-none"
            >
              {t.reject}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={accept}
              className="flex-1 lg:w-36 lg:flex-none"
            >
              {t.accept}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
