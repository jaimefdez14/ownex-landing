import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/Button";
import { readConsent, setConsent, subscribeConsent } from "../lib/consent";
import { env } from "../lib/env";
import { track } from "../lib/analytics";

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
      SIN CLAVE DE POSTHOG NO HAY BANNER. `initAnalytics` ya no carga nada
      cuando `VITE_POSTHOG_KEY` esta vacia, asi que un banner ahi seria pedir
      permiso para algo que no va a ocurrir: friccion pura y, encima,
      consentimientos guardados que no consienten nada. Mientras la clave no
      este puesta, el sitio se comporta exactamente como antes de este cambio.
    */
    if (!env.posthogKey) return;

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
              ¿Nos dejas medir esta visita?
            </p>
            {/*
              PRIMERA CAPA, Y SOLO LA PRIMERA - 02/09/2026.

              La redaccion anterior contaba aqui el tratamiento entero: quien
              mide, donde esta alojado, que se graba y con que mascaras. Era
              correcta y era demasiado: cuatro lineas en un movil que se leian
              como una confesion, cuando lo que tiene que hacer un banner es
              dejar decidir en dos segundos.

              La guia de la AEPD contempla la INFORMACION POR CAPAS justamente
              para esto. La primera capa necesita quien mide, para que, y las dos
              respuestas; el detalle vive en la segunda, que es la politica de
              cookies enlazada aqui al lado y que ya lo tiene todo escrito,
              tabla por tabla.

              LO QUE NO SE PUEDE QUITAR de esta capa, y por eso sigue: que se
              graba el RECORRIDO de la visita. Es la parte intrusiva, y una
              persona que no lo lea aqui no esta consintiendo eso, esta
              consintiendo una analitica corriente. "Como se usa la pagina" a
              secas no lo cubre.
            */}
            <p id="consent-body" className="text-caption text-text-secondary">
              Medimos con PostHog cómo se usa la página y grabamos el recorrido de la visita. Si no
              aceptas, no se carga nada.{" "}
              <a href="/cookies.html" className="text-accent-ink underline underline-offset-4">
                Política de cookies
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
              Rechazar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={accept}
              className="flex-1 lg:w-36 lg:flex-none"
            >
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
