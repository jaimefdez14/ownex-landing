import { ArrowRight } from "lucide-react";
import { GradientWaves } from "./GradientWaves";
import { ButtonLink } from "./ui/Button";
import { Reveal } from "./ui/Reveal";
import { ThesisEvidence } from "./ThesisEvidence";
import { track } from "../lib/analytics";
import { useCopy } from "../i18n/locale";

const COPY = {
  es: {
    eyebrow: "La tesis Ownex",
    titleA: "Tu mayor activo ya está construido.",
    titleB: "¿Lo activamos?",
    body: "Fidelizar a los clientes es hoy una prioridad para cualquier marca de consumo. Convertirlos en inversores es la principal forma de lograrlo, haciéndoles partícipes del negocio e incentivando su retención y apuesta por el crecimiento de la compañía.",
    cta: "Agendar una llamada",
  },
  en: {
    eyebrow: "The Ownex thesis",
    titleA: "Your biggest asset is already built.",
    /*
      "¿Lo activamos?" en una sola pregunta corta, con el "nosotros" que mete a Ownex
      dentro de la frase: es lo que convierte la constatacion en una invitacion, y lo
      que hace par con el boton que va justo debajo.
    */
    titleB: "Shall we activate it?",
    body: "Customer loyalty is now a priority for every consumer brand. Turning customers into investors is the main way to earn it, making them part of the business and strengthening both their retention and their commitment to the company's growth.",
    cta: "Book a call",
  },
};

/**
 * La tesis. Es el momento de reencuadre de la pagina, y por eso lleva su propio
 * fondo: la reticula de siempre sobre un campo de olas en WebGL (ver el comentario
 * del bloque, mas abajo, y `components/GradientWaves.tsx`).
 *
 * REESCRITA EL 19-ago-2026. Decia "Tu comunidad no es un canal de marketing. Es
 * una fuente de capital.", y despues, durante un rato, "Tus clientes no son solo
 * compradores. Son tus mejores inversores.". Las dos hacian el mismo movimiento
 * que ya hacen otras tres partes de la pagina:
 *
 *   hero              "Convierte a tus clientes en accionistas"
 *   cierre de problem "¿Y si tus mejores clientes también pudieran ser tus accionistas?"
 *   entrada de solution "para que tus clientes inviertan en tu marca"
 *
 * Cuatro veces el mismo giro, y dos de ellas pegadas: el bloque anterior cierra
 * con la pregunta y esta seccion la contestaba con lo mismo. Jaime lo detecto y
 * eligio otro angulo: no volver a proponer la idea, sino senalar que el activo YA
 * existe y esta parado. El reencuadre deja de ser "podrias hacer esto" y pasa a
 * ser "ya lo tienes construido, solo falta activarlo", que es lo unico que esta
 * seccion no comparte con ninguna otra.
 *
 * El remate de la segunda linea es de Jaime, entre cuatro opciones: mira adelante
 * en lugar de reprochar lo que no se ha hecho, y engancha con "Activación", que
 * ya es una de las tres piezas de "Qué es Ownex" en la seccion siguiente.
 *
 * PASA A PREGUNTA EL 30/08/2026: "¿Lo activamos?" en vez de "Solo falta
 * activarlo.". Misma idea y dos silabas menos, pero deja de ser una constatacion
 * y se convierte en una invitacion dirigida al lector, con el "nosotros" que
 * mete a Ownex dentro de la frase. Cae justo encima del unico boton que hay entre
 * el hero y el formulario, asi que el titular pregunta y el boton contesta.
 *
 * El parrafo conserva el argumento de alineacion de incentivos, que sigue sin
 * estar en ningun otro sitio de la pagina y es el unico "por que funciona" que se
 * da. Y el boton se queda donde esta: en escritorio es la unica llamada a la
 * accion entre el hero y el formulario.
 *
 * PASADA DE COPY 29/08/2026 (varias vueltas). Se fue "Has tardado años en
 * construir una base... Hoy solo te da ingresos. Con la estructura adecuada...":
 * Jaime tumbo "la estructura adecuada" (evasiva), "hoy solo te da ingresos"
 * (frio) y el juego "tu capital / el suyo" (rebuscado). Pidio el angulo de
 * FIDELIZACION (el objetivo que toda marca persigue, y la propiedad como su forma
 * mas solida) y, en la ultima vuelta, registro mas profesional: fuera la pregunta
 * retorica y el "no se va a la competencia", dentro "prioridad para cualquier
 * marca de consumo" y "un motivo real para quedarse, recomendarlo y querer que
 * crezca".
 *
 * ULTIMA VUELTA, 30/08/2026, redaccion de Jaime. El remate deja de explicar el
 * mecanismo con una subordinada ("quien posee una parte del negocio tiene un
 * motivo real para...") y lo dice en gerundio, encadenado a la frase anterior:
 * "haciendoles participes del negocio e incentivando su retencion y apuesta por
 * el crecimiento de la compania". Y "la forma mas solida" pasa a "la principal
 * forma": afirma sin comparar contra nada que la pagina no ha puesto delante.
 */
export function PrincipleSection() {
  const t = useCopy(COPY);

  return (
    <section
      id="thesis"
      aria-labelledby="thesis-title"
      className="section-sink relative overflow-hidden bg-background spotlight theme-dark no-accent"
    >
      {/*
        EL FONDO DE LA SECCION - 30/08/2026.

        Aqui habia una "aurora": tres manchas de color desenfocadas moviendose
        despacio. Jaime la sustituye por el campo de olas en WebGL (React Bits),
        con la paleta del tema oscuro en vez de la del componente original.

        Los tres colores hacen todo el trabajo de adaptacion:

          horizonColor  #0E0F0C  el propio lienzo de la seccion. Las olas lejanas
                                 no se funden a un color ajeno: se funden al fondo
                                 y desaparecen, asi que el borde superior del
                                 efecto no existe.
          waveColor     #163529  verde muy profundo, el cuerpo de las olas. Es el
                                 unico verde que hay, y a este brillo lee como
                                 sombra con temperatura, no como color de marca.
          crestColor    #8F9C94  gris medio con temperatura verde, en las crestas
                                 cercanas. El componente original remata en blanco;
                                 aqui NO, y es la decision que mas cambia el
                                 resultado: encima de estas crestas va texto, y un
                                 blanco moviendose debajo de un parrafo lo borra.
                                 A gris medio las dunas se leen igual y el texto
                                 conserva su contraste.

        De los parametros, tres estan puestos a mano contra el original: `speed`
        0,18 (el original va a 0,4 y en un fondo de lectura eso se nota como
        movimiento, no como respiracion), `fogDepth` 26 (con el 15 de fabrica las
        olas se fundian al negro tan cerca que no se veia la forma, solo una
        mancha) y `detail` en `low`, que son 40 pasos de raymarch por pixel en vez
        de 70: a este brillo la diferencia no se ve, y en un movil de gama media
        se nota. Donde se ve el efecto y como se protege el texto lo deciden la
        mascara y el velo, en `index.css`.

        Va antes que la retícula en el DOM a proposito: las dos son `absolute` sin
        `z-index`, asi que pinta primero las olas y la retícula queda por encima.
      */}
      <div aria-hidden="true" className="thesis-waves">
        <GradientWaves
          horizonColor="#0E0F0C"
          waveColor="#163529"
          crestColor="#8F9C94"
          speed={0.18}
          amplitude={2.2}
          waveScale={0.55}
          tilt={1.16}
          height={5.0}
          fogDepth={26}
          detail="low"
          brightness={1.0}
          opacity={1.0}
          parallaxStrength={0.35}
          grainIntensity={0.04}
        />
      </div>

      {/* El velo: mantiene oscuro el fondo del texto pase lo que pase detras (ver `index.css`). */}
      <div aria-hidden="true" className="thesis-scrim" />

      {/*
        La retícula de fondo va a distinta velocidad que el texto: se desplaza
        unos pocos píxeles según entra la sección (`.figure-drift`, en
        `index.css`). Es `-inset-8` y no `inset-0` justamente por eso: al
        desplazarse dejaría descubierta una franja del borde, y el sobreancho la
        cubre. El `overflow-hidden` de la sección recorta lo que sobra.
      */}
      <div
        className="figure-drift grid-overlay pointer-events-none absolute -inset-8 opacity-25"
        aria-hidden="true"
      />

      {/*
        ALINEADA A LA IZQUIERDA EN TELEFONO - 29/08/2026.

        Era `text-center` en todos los anchos y en movil era la peor seccion de la
        pagina para leer. Dos cosas distintas, las dos por centrar:

          EL TITULAR. 44px centrados en 335px de ancho util partian la frase en
          cinco lineas de longitudes muy dispares ("Tu mayor / activo ya / esta
          construido. / Solo falta / activarlo."). Centrado, cada linea arranca en
          un punto distinto, asi que el ojo no tiene borde al que volver y la
          frase se lee a trompicones. Ademas 44px es la medida del hero: dos
          titulares del mismo tamano compiten, y este no es el principal.

          EL PARRAFO. Siete lineas de texto corrido centradas. En un bloque de
          prosa el centrado destroza el borde izquierdo, que es exactamente el
          punto al que el ojo salta al terminar cada linea. Vale para un remate de
          dos lineas; no vale para un parrafo.

        Desde `sm` vuelve centrada y a su tamano: ahi el titular entra en dos
        lineas y el parrafo en tres, que es cuando centrar suma en vez de restar.

        El filete del rotulo (`rule-grow-center-sm`) sigue el mismo camino: centrado
        bajo un rotulo alineado a la izquierda quedaria suelto en mitad de la nada.
      */}
      <div className="shell relative py-14 sm:py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[760px] sm:text-center">
          <Reveal as="p" className="rule-grow label-caps mb-6 rule-grow-center-sm sm:mb-8">
            {t.eyebrow}
          </Reveal>

          <h2
            id="thesis-title"
            className="display-hero mb-6 text-[32px] text-foreground sm:mb-10 sm:text-display-lg md:text-[68px] lg:text-[80px]"
          >
            {/*
              Las dos lineas del titular se revelan por separado, con su propio
              retraso: es el momento de reencuadre de la pagina, y que la segunda
              linea llegue justo despues de la primera (en vez de las dos a la vez)
              le da al giro de sentido ("no es esto, es aquello") un instante propio.
            */}
            {/* El espacio separa las dos lineas en el texto plano; ver HeroSection. */}
            <Reveal as="span" delay={80} className="block text-rise">
              {t.titleA}
            </Reveal>{" "}
            <Reveal as="span" delay={200} className="block text-rise text-text-tertiary">
              {t.titleB}
            </Reveal>
          </h2>

          <Reveal as="p" delay={280} className="mb-8 max-w-xl text-body-lg text-text-secondary sm:mx-auto sm:mb-10">
            {t.body}
          </Reveal>

          <Reveal delay={340}>
            <ButtonLink
              href="#contact"
              size="lg"
              onClick={() => track("cta_click", { location: "mid", label: "Agendar una llamada" })}
            >
              {t.cta}
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </Reveal>
        </div>

        {/*
          EL RESPALDO, 05/09/2026. Va dentro de la seccion y despues del boton, no
          antes: el titular pregunta y el boton contesta, y meter cuatro estudios
          entre los dos rompia ese par, que es lo unico que esta seccion tiene.
          Asi que la evidencia cierra el bloque en vez de partirlo, y quien ya
          estaba convencido pulsa sin leerla.

          Sale del `max-w-[760px]` del titular a proposito: la columna de lectura
          vale para un parrafo, no para una lista de referencias que en escritorio
          se abre a tres columnas.
        */}
        <ThesisEvidence />
      </div>
    </section>
  );
}
