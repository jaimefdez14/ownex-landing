import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal } from "./ui/Reveal";
import { cn } from "../lib/cn";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * EL RESPALDO DE LA TESIS - 05/09/2026, a peticion de Jaime.
 *
 * La seccion de la tesis afirmaba, y nada mas. Decia que convertir clientes en
 * accionistas es la principal forma de fidelizarlos y esperaba que el lector se
 * lo creyera porque suena bien. Es la unica afirmacion de la pagina que no
 * descansa en un dato: la calculadora tiene su modelo, el marco regulatorio tiene
 * sus articulos del BOE, y la tesis no tenia nada.
 *
 * Ahora la sostienen cuatro estudios revisados por pares. Van DENTRO de la
 * seccion de la tesis y no en una seccion propia a proposito: no son un tema
 * aparte, son el pie de pagina de la frase que hay justo encima.
 *
 * COMO SE PRESENTAN, Y POR QUE ASI:
 *
 *  - Cada estudio se reduce a UNA linea en castellano, que es lo que el lector se
 *    lleva. La cita completa (autores, ano, revista y titulo original) va debajo,
 *    pequena, para quien quiera comprobarla. El orden importa: primero lo que
 *    dice, despues quien lo dice. Al reves seria una bibliografia, y una
 *    bibliografia no se lee en una landing.
 *
 *  - NINGUNA CIFRA. No hay porcentajes ni tamanos de muestra porque no se han
 *    verificado contra los papers: cada linea dice lo que el propio titulo del
 *    estudio sostiene y ni un paso mas. Un dato inventado en el unico bloque de
 *    la pagina que existe para dar credibilidad la destruiria entera. Si algun
 *    dia se leen los cuatro y se sacan cifras reales, este es su sitio.
 *
 *  - LOS GLIFOS. Cuatro dibujos de linea, uno por estudio, con las reglas de
 *    `PhaseGlyphs.tsx`: reticula de 48, coordenadas enteras (el `check:copy`
 *    marca los decimales con punto en el texto visible, y las rutas de un SVG
 *    salen del mismo extractor), trazo de 3 y exactamente UN punto macizo por
 *    glifo. El punto macizo es el mismo motivo en los cuatro y significa siempre
 *    lo mismo: la persona que posee una parte. Esta en la porcion del negocio, en
 *    el cruce de los dos circulos, en el vertice del grupo de afinidad y en el
 *    centro de la comunidad.
 *
 *  - NO SON ENLACES, y por eso no responden al cursor. No se publica un DOI que no
 *    se ha comprobado, asi que no hay destino al que llevar; y un bloque que se
 *    levanta o se subraya al pasar por encima sin llevar a ningun sitio es
 *    exactamente el engano que encontro el audit del 26/08 (ver el bloque de
 *    tarjetas de `index.css`). El dia que se anadan los enlaces, el titulo de cada
 *    estudio pasa a ser un `<a>` y ahi si tiene sentido el gesto.
 *
 * SIN TARJETAS, Y ES LA SEGUNDA VERSION. La primera eran cuatro fichas de cristal
 * en fila, que en telefono se deslizaban en horizontal como los recursos y los
 * sectores. Funcionaba, y aun asi se cambia por dos motivos de la rubrica de craft
 * (`docs/quality/CRAFT-FLOOR.md`):
 *
 *   1. "Tarjetas identicas en rejilla uniforme sin variante destacada" es uno de
 *      los doce puntos de la pasada anti-IA. Cuatro cajas iguales en fila es la
 *      respuesta por defecto a "pon aqui cuatro cosas", y esta seccion es el
 *      momento de reencuadre de la pagina, no una rejilla de caracteristicas.
 *   2. La tira escondia tres de los cuatro estudios detras de un gesto. Y el
 *      argumento ES el numero: "cuatro estudios distintos dicen lo mismo" no se
 *      sostiene si solo se ve uno. Lo que en los recursos es correcto (ahi cada
 *      tarjeta lleva a un sitio y se elige una) aqui juega en contra.
 *
 * Asi que son cuatro FILAS de una lista de referencias: glifo, hallazgo y cita, y
 * nada de cajas. Se leen las cuatro de un vistazo en cualquier ancho y el bloque
 * conserva el silencio de la tesis, que es texto sobre el campo de olas y ningun
 * recuadro.
 *
 * LO QUE CUESTA, MEDIDO: a 375px la seccion pasa de 1130px con la tira a 1625 con
 * la lista, porque las cuatro citas dejan de estar escondidas. No es un descuido:
 * a ese ancho la pagina tiene ya cuatro secciones en esa horquilla (marco 1568,
 * simulador 1613, casos 1539), asi que la tesis deja de ser la mas corta con
 * diferencia y se pone en la media, no por encima.
 *
 * APRETADO EL 07/09/2026, a peticion de Jaime ("es demasiado grande"): fuera la
 * entradilla entera (solo queda el rotulo), filas mas juntas (padre `py-4` en vez
 * de `py-6`, `gap-y-2` en vez de `gap-y-3`), separacion superior del bloque y del
 * rotulo recortadas, y el nombre de la REVISTA oculto por debajo de `sm` -- ahi
 * cuelga bajo el hallazgo, en la misma columna, y solo alarga la fila. Los cuatro
 * estudios siguen los cuatro: el argumento es el numero. La cita que importa --
 * autores, ano y titulo original -- se conserva en todos los anchos.
 *
 * DE LISTA A CARRUSEL EL 08/09/2026, a peticion de Jaime ("se le da demasiado
 * peso aun a los informes; que salgan de uno en uno en un slideshow mas fino").
 * Las cuatro filas siguen en el marcado -sin JavaScript se ven las cuatro
 * apiladas, que es el fallback honesto, y un lector de pantalla recorre igual la
 * lista de cuatro- pero con JavaScript el contenedor las pone en fila horizontal
 * y recorta la vista a una: se desliza en tactil y saltan los puntos de abajo en
 * raton y teclado. El bloque pasa de cuatro filas de alto a una. La mecanica del
 * `html.js` vive en `.thesis-carousel-track` / `.thesis-carousel-dots` de
 * `index.css`, con el porque de que no haya auto-avance (el criterio de "pausar,
 * detener, ocultar" de la WCAG, que un carrusel que arranca solo incumpliria sin
 * un control de pausa).
 *
 * QUE EL NUMERO NO SE PIERDA. Con una referencia a la vista, "cuatro estudios
 * dicen lo mismo" deja de leerse de un vistazo. La primera respuesta (08/09) fue
 * devolver la entradilla en una linea; Jaime la quito acto seguido, junto con el
 * rotulo, y el bloque se queda solo con el carrusel. El "cuatro" queda a cargo de
 * los cuatro puntos de navegacion, que son cuatro tambien en reposo, y del nombre
 * de la lista para lectores de pantalla. El `<h3>` sobrevive como `sr-only`.
 *
 * LO QUE PROTEGE EL TEXTO. Al no haber tarjeta no hay fondo propio, asi que la
 * legibilidad la sostiene entera el velo de `.thesis-scrim`, medido contra el peor
 * fotograma del oleaje (la cuenta, en `index.css`).
 */

type GlyphProps = { size?: number; className?: string };

function Glyph({ size = 28, className, children }: GlyphProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Propiedad: el negocio, y una porcion separada del resto con su dueno dentro.
 *
 * La primera version era la tarta entera con dos radios marcando el trozo, y a
 * 28px se leia como UN RELOJ: dos rayas saliendo del centro son las agujas, no
 * una porcion. Separar el trozo del resto quita la lectura de esfera de golpe.
 */
function OwnershipGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      {/* Tres cuartos: del centro arriba, la vuelta larga por la izquierda, y cierra. */}
      <path d="M21 27 L21 14 A13 13 0 1 0 34 27 Z" />
      {/* El cuarto que falta, desplazado en diagonal, con su dueno dentro. */}
      <path d="M28 21 L28 8 A13 13 0 0 1 41 21 Z" />
      <circle cx="33" cy="16" r="2" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Cliente e inversor: dos circulos que se cruzan y una sola persona en el cruce. */
function OverlapGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="18" cy="24" r="12" />
      <circle cx="30" cy="24" r="12" />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Comunidad: la marca en el centro y los propietarios alrededor. */
function CommunityGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <circle cx="24" cy="9" r="4" />
      <circle cx="39" cy="24" r="4" />
      <circle cx="24" cy="39" r="4" />
      <circle cx="9" cy="24" r="4" />
      <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Afinidad: los inversores no se reparten al azar, se agrupan. */
function AffinityGlyph(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M13 35 L24 12 L38 30 Z" />
      <circle cx="13" cy="35" r="3" />
      <circle cx="38" cy="30" r="3" />
      <circle cx="24" cy="12" r="3" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

type Estudio = {
  hallazgo: string;
  autores: string;
  revista: string;
  titulo: string;
};

/* Los glifos van por posicion: no son copy y no cambian con el idioma. */
const glifos = [OwnershipGlyph, OverlapGlyph, AffinityGlyph, CommunityGlyph];

/*
  LO QUE NO SE TRADUCE, Y ES DELIBERADO: el titulo original del estudio y el nombre de
  la revista. Son la cita con la que alguien comprueba la fuente, asi que traducirlos
  la haria inservible (nadie encuentra un paper por su titulo en castellano). Se
  traduce el HALLAZGO, que es la frase que el lector se lleva, y la "y" de los autores,
  que si es sintaxis del idioma.
*/
const estudiosCopy: Localized<Estudio[]> = {
  es: [
  {
    hallazgo: "Ser accionista motiva a comportarse como cliente leal y a defender la marca.",
    autores: "Aspara, J. (2009)",
    revista: "Journal of Consumer Marketing",
    titulo: "Stock ownership as a motivation of brand-loyal and brand-supportive behaviors",
  },
  {
    hallazgo: "Abrir capital a la comunidad no solo levanta dinero: es una vía para captar clientes leales.",
    autores: "Hoffmann, C., Moritz, A. y Kenning, P. (2022)",
    revista: "International Journal of Entrepreneurship and Small Business",
    titulo:
      "More than a financial alternative: discovering equity crowdfunding as a tool for entrepreneurial ventures to acquire loyal customers",
  },
  {
    hallazgo:
      "Entender y consumir el producto de una marca empuja a invertir en ella: cliente e inversor tienden a ser la misma persona.",
    autores: "Righi, R., Pedrazzoli, A., Righi, S. y Venturelli, V. (2024)",
    revista: "Journal of Behavioral and Experimental Finance",
    titulo: "The clientele effects in equity crowdfunding: A complex network analysis",
  },
  {
    hallazgo: "El caso BrewDog: la ronda abierta a sus clientes construyó una comunidad de marca, no solo un accionariado.",
    autores: "Sabia, L., Bell, R. y Bozward, D. (2022)",
    revista: "International Journal of Entrepreneurship and Innovation",
    titulo: "Using equity crowdfunding to build a loyal brand community: The case of BrewDog",
  },
  ],
  en: [
    {
      hallazgo: "Holding shares motivates people to behave as loyal customers and to stand up for the brand.",
      autores: "Aspara, J. (2009)",
      revista: "Journal of Consumer Marketing",
      titulo: "Stock ownership as a motivation of brand-loyal and brand-supportive behaviors",
    },
    {
      hallazgo: "Opening equity to the community does more than raise money: it is a way to acquire loyal customers.",
      autores: "Hoffmann, C., Moritz, A. and Kenning, P. (2022)",
      revista: "International Journal of Entrepreneurship and Small Business",
      titulo:
        "More than a financial alternative: discovering equity crowdfunding as a tool for entrepreneurial ventures to acquire loyal customers",
    },
    {
      hallazgo:
        "Understanding and using a brand's product pushes people to invest in it: customer and investor tend to be the same person.",
      autores: "Righi, R., Pedrazzoli, A., Righi, S. and Venturelli, V. (2024)",
      revista: "Journal of Behavioral and Experimental Finance",
      titulo: "The clientele effects in equity crowdfunding: A complex network analysis",
    },
    {
      hallazgo: "The BrewDog case: the round opened to its customers built a brand community, not just a shareholder base.",
      autores: "Sabia, L., Bell, R. and Bozward, D. (2022)",
      revista: "International Journal of Entrepreneurship and Innovation",
      titulo: "Using equity crowdfunding to build a loyal brand community: The case of BrewDog",
    },
  ],
};

const COPY = {
  es: {
    title: "Estudios revisados por pares que respaldan la tesis",
    carousel: "carrusel",
    slide: "diapositiva",
    list: "Cuatro estudios revisados por pares",
    of: (i: number, n: number) => `${i} de ${n}`,
    dot: (i: number, n: number, autores: string) => `Ver el estudio ${i} de ${n}: ${autores}`,
    live: (i: number, n: number, autores: string) => `Estudio ${i} de ${n}: ${autores}`,
  },
  en: {
    title: "Peer-reviewed studies that back the thesis",
    carousel: "carousel",
    slide: "slide",
    list: "Four peer-reviewed studies",
    of: (i: number, n: number) => `${i} of ${n}`,
    dot: (i: number, n: number, autores: string) => `View study ${i} of ${n}: ${autores}`,
    live: (i: number, n: number, autores: string) => `Study ${i} of ${n}: ${autores}`,
  },
};

export function ThesisEvidence() {
  const t = useCopy(COPY);
  const estudios = useCopy(estudiosCopy);
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = estudios.length;

  /*
    El indice activo lo dicta la posicion de scroll, no al reves: asi el deslizado
    en tactil y el clic en un punto son la MISMA fuente de verdad. `scrollLeft`
    entre ancho de contenedor, redondeado, es la fila que esta encuadrada.
  */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setActive(Math.max(0, Math.min(count - 1, i)));
      });
    };
    el.addEventListener("scroll", sync, { passive: true });
    return () => {
      el.removeEventListener("scroll", sync);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    setActive(i); // el punto responde ya; el listener de scroll lo confirma
    el.scrollTo({ left: i * el.clientWidth });
  };

  return (
    <div className="thesis-evidence relative mt-8 sm:mt-12 md:mt-16">
      {/*
        NI ROTULO NI ENTRADILLA VISIBLES - 08/09/2026, a peticion de Jaime
        ("borraria esto"). El bloque queda reducido al carrusel. El `<h3>` se
        conserva SOLO para lectores de pantalla (`sr-only`): sin el, el carrusel
        colgaria del `h2` de la tesis sin nombre en el esquema del documento, y
        el `aria-labelledby` de abajo se quedaria sin destino. El "cuatro" que la
        entradilla decia lo siguen diciendo los cuatro puntos de navegacion y,
        para quien use lector de pantalla, el nombre de la lista.
      */}
      <h3 id="thesis-evidence-title" className="sr-only">
        {t.title}
      </h3>

      {/*
        `role="group"` + `aria-roledescription`: para un lector de pantalla esto es
        un carrusel, no una lista suelta. Debajo, la `<ul>` sigue siendo una lista
        de cuatro `<li>` de verdad -sin JavaScript se ven las cuatro apiladas- y es
        el `.thesis-carousel-track` de `index.css` el que, bajo `html.js`, las pone
        en fila y recorta la vista a una.
      */}
      <Reveal
        as="div"
        delay={140}
        role="group"
        aria-roledescription={t.carousel}
        aria-labelledby="thesis-evidence-title"
        className="mx-auto max-w-[1000px]"
      >
        {/*
          `role="list"` explicito: el preflight de Tailwind pone `list-style: none`
          en toda `ul`, y con eso VoiceOver en Safari deja de anunciarla como lista.
          Aqui importa mas que en otras listas de la pagina, porque el argumento del
          bloque ES el numero: "cuatro estudios dicen lo mismo" se pierde si el
          lector de pantalla lee cuatro parrafos sueltos en vez de una lista.
        */}
        <ul
          ref={trackRef}
          role="list"
          aria-label={t.list}
          className="thesis-carousel-track"
        >
          {estudios.map(({ hallazgo, autores, revista, titulo }, i) => {
            const Glifo = glifos[i];
            return (
            <li
              key={titulo}
              aria-roledescription={t.slide}
              aria-label={t.of(i + 1, count)}
              className="grid grid-cols-[28px_minmax(0,1fr)] gap-x-4 gap-y-2 py-2 sm:grid-cols-[36px_minmax(0,1fr)] sm:gap-x-5 lg:grid-cols-[36px_minmax(0,1fr)_minmax(0,340px)] lg:gap-x-8 lg:py-3"
            >
              {/*
                El glifo se alinea con la ALTURA DE X de la primera linea del
                hallazgo, no con su caja: `mt-1` es lo que baja el dibujo hasta el
                eje optico del texto que tiene al lado (CRAFT-FLOOR, regla I).
              */}
              <Glifo className="icon-badge mt-1 text-text-secondary" />

              <p className="text-body leading-snug text-foreground sm:text-body-lg">{hallazgo}</p>

              <div className="col-start-2 lg:col-start-3 lg:row-start-1 lg:pt-1">
                <p className="text-caption font-medium text-text-secondary">{autores}</p>
                {/*
                  La revista se oculta por debajo de `sm`: ahi la cita cuelga bajo
                  el hallazgo, en la misma columna estrecha, y es la linea que menos
                  aporta de las tres (autores y titulo bastan para comprobar el
                  estudio). Desde `sm` vuelve, que es cuando la fila tiene sitio.
                */}
                <p className="mt-1 hidden text-caption text-text-secondary sm:block">{revista}</p>
                {/*
                  El titulo original va en un `<cite>` y no en un `<p>`: es el
                  nombre de una obra citada, que es exactamente para lo que existe
                  la etiqueta. Se le quita la cursiva del navegador porque cuatro
                  titulos largos en cursiva sobre fondo oscuro se leen peor, no
                  mejor, y se le baja el peso a 300.
                */}
                <cite className="mt-2 block text-micro font-light not-italic leading-normal tracking-normal text-text-secondary">
                  {titulo}
                </cite>
              </div>
            </li>
            );
          })}
        </ul>

        {/*
          Los puntos. `.thesis-carousel-dots` los oculta sin JavaScript (sin el
          listener de scroll no navegan a nada). El area de pulsacion es de 44px de
          alto aunque el punto sea una raya de 4px: A11Y-CHECKLIST no negocia el
          tamano de diana. El punto activo se alarga en vez de solo cambiar de
          color -no fiar la unica senal al color-.
        */}
        <div className="thesis-carousel-dots mt-6 items-center justify-start gap-2 sm:mt-8 sm:justify-center">
          {estudios.map(({ autores }, i) => (
            <button
              key={autores}
              type="button"
              onClick={() => goTo(i)}
              aria-label={t.dot(i + 1, count, autores)}
              aria-current={active === i ? "true" : undefined}
              className="flex h-11 items-center px-2"
            >
              <span
                className={cn(
                  "block h-1 rounded-full transition-all duration-300",
                  active === i ? "w-7 bg-foreground" : "w-3 bg-text-tertiary",
                )}
              />
            </button>
          ))}
        </div>

        {/*
          El anuncio para lectores de pantalla al cambiar de diapositiva: sin el,
          pulsar un punto mueve el carrusel en silencio. Dice el ordinal y el
          autor, no "1 de 4" a secas.
        */}
        <p className="sr-only" aria-live="polite">
          {t.live(active + 1, count, estudios[active].autores)}
        </p>
      </Reveal>
    </div>
  );
}
