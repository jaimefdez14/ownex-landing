import { ArrowRight } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { formatEuros, formatInt } from "../lib/formatNumber";
import { TICKET_POR_DEFECTO, TRAMOS_INVERSORES, useInvestors } from "../lib/useScenario";
import { track } from "../lib/analytics";

/**
 * El cebo de la calculadora, en la primera pantalla.
 *
 * NUEVO EL 29/08/2026.
 *
 * QUE PROBLEMA RESUELVE. El hero pedia leer cinco bloques de texto y decidir si
 * agendar una llamada de treinta minutos. El unico elemento de la pagina con el
 * que se puede HACER algo (la calculadora) estaba a catorce pantallas. Entre
 * "leer un argumento" y "ver mi propio numero" no hay comparacion posible:
 * teclear o tocar una cifra propia convierte a un lector pasivo en participante
 * en tres segundos, y es lo que decide que siga bajando.
 *
 * POR QUE NO ES SUBIR LA CALCULADORA. Jaime descarto el 26/08 mover la seccion
 * arriba, y esto no lo revive: la seccion sigue donde estaba, detras de "Como
 * funciona". Aqui hay UNA pregunta de las tres, con la respuesta de una sola
 * cifra y un enlace a la seccion completa. El cebo abre el apetito; el desglose
 * (coste, dilucion, grafico, captura de correo) sigue siendo suyo.
 *
 * POR QUE PASTILLAS Y NO UN CAMPO. En movil, un campo numerico levanta el
 * teclado, tapa media pantalla y obliga a inventarse una cifra y teclearla. Un
 * toque en una pastilla no levanta nada y responde antes de soltar el dedo. El
 * que quiera su cifra exacta la teclea abajo, en la calculadora, que para eso
 * hereda el numero elegido aqui (`useScenario`).
 *
 * DE DONDE SALE LA CIFRA. `inversores x ticket medio`, con el mismo ticket de
 * partida que la calculadora (1.500 €) y DICIENDOLO en la linea de abajo. Sin
 * esa linea seria una promesa sin supuesto, que es justo lo que la pagina no
 * hace en ningun otro sitio.
 */

export function HeroTeaser() {
  const [inversores, fijarInversores] = useInvestors();

  /*
    El evento se manda en CADA pulsacion, no solo en la primera como hace
    `calculator_interaction`. Lo que interesa saber de este control no es que
    alguien lo tocara: es en que tramo se reconoce una marca, y eso solo lo dice
    el ultimo valor elegido. Son cuatro pastillas, asi que el techo de eventos
    por visita es ridiculo.
  */
  const elegir = (valor: number) => {
    fijarInversores(valor);
    track("hero_estimate", { investors: valor });
  };

  /*
    El enlace al desglose no necesita fijar nada: la pastilla ya dejo el numero
    en el estado compartido, asi que la calculadora esta puesta en este escenario
    desde antes de que el ancla llegue a ella.
  */
  const capital = inversores * TICKET_POR_DEFECTO;

  const tituloId = "hero-teaser-title";

  return (
    <div className="glass-card p-3 sm:p-5">
      <p id={tituloId} className="text-label text-foreground">
        ¿Cuántos de tus clientes invertirían?
      </p>

      <div
        role="group"
        aria-labelledby={tituloId}
        className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3"
      >
        {TRAMOS_INVERSORES.map((valor) => (
          <button
            key={valor}
            type="button"
            aria-pressed={inversores === valor}
            onClick={() => elegir(valor)}
            className={
              inversores === valor
                ? "min-h-touch rounded-full bg-accent-soft px-4 text-caption font-medium tabular text-on-accent-soft transition-colors"
                : "min-h-touch rounded-full border border-border bg-card-hover px-4 text-caption tabular text-text-secondary transition-colors hover:border-emerald-400/25 hover:text-foreground"
            }
          >
            {formatInt(valor)}
          </button>
        ))}
      </div>

      {/*
        `flex-wrap` con el enlace al final: a 375px la cifra y "Ver el desglose"
        no caben en la misma linea, y partidos por el `wrap` cada uno se queda
        entero en la suya. Sin el, la cifra se comprime y el enlace se trunca.
      */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:mt-4">
        <p className="text-caption text-text-secondary">Podrías captar</p>
        {/*
          `AnimatedNumber` y no la cifra a secas: el numero SUBE al cambiar de
          tramo. Es la unica pieza de la primera pantalla que se mueve porque el
          visitante la ha movido, y ese es todo el argumento de que esto es un
          calculo y no un cartel.

          `animateOnMount={false}`: al cargar, la cifra ya es la correcta para la
          pastilla pulsada, no un dato que llega. Contarla desde cero solo la
          hacia parecer un cartel a medio pintar, y ademas la animacion de
          entrada se quedaba congelada por el `content-visibility` del hero. Solo
          se anima el delta cuando el visitante cambia de tramo.
        */}
        <AnimatedNumber
          value={capital}
          format={formatEuros}
          animateOnMount={false}
          className="text-headline tabular text-foreground"
        />
      </div>

      <p className="mt-2 text-caption text-text-tertiary">
        Con un ticket medio de {formatEuros(TICKET_POR_DEFECTO)}.{" "}
        <a
          href="#calculator"
          onClick={() => track("cta_click", { location: "hero_teaser", label: "Ver el desglose" })}
          className="inline-flex items-center gap-1 text-emerald-400 underline-offset-4 hover:underline"
        >
          Ver el desglose
          <ArrowRight aria-hidden="true" size={13} />
        </a>
      </p>
    </div>
  );
}
