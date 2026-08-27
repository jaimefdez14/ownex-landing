import { ArrowRight } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { Reveal } from "./ui/Reveal";
import { track } from "../lib/analytics";

/**
 * La tesis. Es el momento de reencuadre de la pagina, y por eso lleva su propia
 * reticula de fondo y un halo esmeralda muy tenue, como en el original.
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
 * El remate de la segunda linea es de Jaime, entre cuatro opciones: "Solo falta
 * activarlo" en vez de "Y todavia no te ha financiado nada". Mira adelante en
 * lugar de reprochar lo que no se ha hecho, y engancha con "Activación", que ya
 * es una de las tres piezas de "Qué es Ownex" en la seccion siguiente.
 *
 * El parrafo conserva el argumento de alineacion de incentivos ("cuando crece,
 * ganan los dos"), que sigue sin estar en ningun otro sitio de la pagina y es el
 * unico "por que funciona" que se da. Y el boton se queda donde esta: en
 * escritorio es la unica llamada a la accion entre el hero y el formulario.
 */
export function PrincipleSection() {
  return (
    <section
      id="thesis"
      aria-labelledby="thesis-title"
      className="section-sink relative overflow-hidden bg-background spotlight theme-dark no-accent"
    >
      {/*
        Aurora de fondo (bloque 15 de `index.css`): tres manchas muy grandes, muy
        desenfocadas y casi transparentes que se mueven despacio. Lo que se nota no
        son las manchas, es que el negro deja de ser plano.

        Va antes que la retícula en el DOM a proposito: las dos son `absolute` sin
        `z-index`, asi que pinta primero la aurora y la retícula queda por encima.
        Al reves, el desenfoque se comeria las lineas.
      */}
      <div aria-hidden="true" className="aurora">
        <span />
        <span />
        <span />
      </div>

      {/*
        La retícula de fondo va a distinta velocidad que el texto: se desplaza
        unos pocos píxeles según entra la sección (`.figure-drift`, en
        `index.css`). Es `-inset-8` y no `inset-0` justamente por eso: al
        desplazarse dejaría descubierta una franja del borde, y el sobreancho la
        cubre. El `overflow-hidden` de la sección recorta lo que sobra.
      */}
      <div
        className="figure-drift grid-overlay pointer-events-none absolute -inset-8 opacity-40"
        aria-hidden="true"
      />

      <div className="shell relative py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal as="p" className="rule-grow rule-grow-center label-caps mb-8">
            La tesis Ownex
          </Reveal>

          <h2
            id="thesis-title"
            className="display-hero mb-10 text-[44px] text-foreground sm:text-display-lg md:text-[68px] lg:text-[80px]"
          >
            {/*
              Las dos lineas del titular se revelan por separado, con su propio
              retraso: es el momento de reencuadre de la pagina, y que la segunda
              linea llegue justo despues de la primera (en vez de las dos a la vez)
              le da al giro de sentido ("no es esto, es aquello") un instante propio.
            */}
            <Reveal as="span" delay={80} className="block text-rise">
              Tu mayor activo ya está construido.
            </Reveal>
            <Reveal as="span" delay={200} className="block text-rise text-text-tertiary">
              Solo falta activarlo.
            </Reveal>
          </h2>

          <Reveal as="p" delay={280} className="mx-auto mb-10 max-w-xl text-body-lg text-text-secondary">
            Has tardado años en construir una base de clientes que vuelve, recomienda y defiende
            tu marca. Hoy solo te da ingresos. Con la estructura adecuada te da también capital,
            y alinea lo que quieren tus clientes con lo que necesita tu marca: cuando crece,
            ganan los dos.
          </Reveal>

          <Reveal delay={340}>
            <ButtonLink
              href="#contact"
              size="lg"
              onClick={() => track("cta_click", { location: "mid", label: "Agendar una llamada" })}
            >
              Agendar una llamada
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
