import { ArrowDown, ArrowRight, Landmark, Repeat, Share2, ShieldCheck } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { HeroPanelMockup } from "./ProductMockups";
import { track } from "../lib/analytics";

/**
 * Hero (v2).
 *
 * Titular a dos tonos, panel de producto al lado desde `lg`, y tres tarjetas de
 * propuesta de valor debajo.
 *
 * DOCBLOCK CORREGIDO EL 27/08/2026. Describia "retícula de puntos reactiva al
 * cursor sobre fondo casi negro, viñeta radial" y decia que el hero "no lleva
 * animacion de entrada". Las tres cosas dejaron de ser verdad hace tiempo: el
 * lienzo pasa a claro el 25/08 (`brand/BRAND.md` §9.1), la retícula de puntos se
 * fue con el (su componente, `DotField.tsx`, se ha borrado el 27/08 porque
 * llevaba semanas sin que lo importara nadie) y la entrada escalonada
 * (`.hero-in`, bloque 8 de `index.css`) llego el 26/08.
 *
 * Lo que SI sigue valiendo de aquella nota, porque es criterio y no descripcion:
 *
 *  - La entrada es una animacion CSS de carga, no un `initial={{ opacity: 0 }}`
 *    de framer-motion. Una animacion CSS siempre termina, asi que el estado
 *    final es inevitable; el estilo en linea del original dejaba el hero en
 *    blanco si el JavaScript no llegaba a ejecutarse, que es el fallo mas caro
 *    posible en una landing. Y toda ella vive dentro de un
 *    `prefers-reduced-motion: no-preference`, asi que con movimiento reducido la
 *    regla no existe y el hero se pinta visible desde el primer fotograma.
 *  - El icono de "Financiación" no es una moneda. El §0 descarta la iconografia
 *    de monedas por el tono que se busca.
 */

/*
  Las tres pruebas que si se pueden documentar. Ni una promesa de resultado, ni
  una cifra de cliente: hechos del marco en el que opera la emision.
*/
const trustMarks = [
  "Ley 6/2023 de Mercados de Valores",
  "Entidades supervisadas por la CNMV",
  "Tu cap table, en una sola línea",
];

const valueProps = [
  {
    icon: Landmark,
    label: "Financiación",
    title: "Financia tu crecimiento con tu comunidad",
    desc: "Tus clientes invierten como accionistas minoritarios. Una sola línea en tu cap table. Compatible con rondas de VC e IPO.",
  },
  {
    icon: Repeat,
    label: "Fidelización",
    title: "Aumenta la retención de clientes",
    desc: "Los propietarios gastan más, se quedan más y atraen a otros. La co-propiedad fideliza clientes y aumenta el LTV.",
  },
  {
    icon: Share2,
    label: "Crecimiento",
    title: "Expande tu marca orgánicamente",
    desc: "Tus clientes co-propietarios se convierten en embajadores de tu marca, reduciendo el CAC. El accionista refiere porque su beneficio depende del crecimiento de la marca.",
  },
];

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="theme-light relative flex min-h-screen flex-col justify-center overflow-hidden bg-background"
    >
      {/*
        El contenido deja pasar el raton para que la retícula reaccione debajo, y
        solo los controles vuelven a capturarlo.
      */}
      {/*
        EL AIRE DE ARRIBA, EN MOVIL - 29/08/2026, a peticion de Jaime ("demasiado
        espacio entre la navbar y el texto, juntalo, subelo").

        Era `pt-24` (96px) en todos los anchos. La barra mide 64px, asi que el
        rotulo arrancaba a 96px: 32px de holgura bajo la barra MAS el interlineado
        del propio rotulo. En una pantalla de 812px eso es media pulgada de nada
        antes de la primera palabra, y encima empuja el titular fuera del primer
        golpe de vista.

        Ahora 68px en telefono: 4px por debajo del borde de la barra, que es lo que
        hace que el bloque se lea PEGADO a ella y no flotando. Desde `sm` se queda
        en los 128px de siempre, asi que tablet y escritorio no cambian.
      */}
      <div className="pointer-events-none relative z-10 w-full pt-[68px] pb-12 sm:pt-32 sm:pb-20">
        <div className="shell [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          {/*
            Retícula del hero. Hasta `lg` es una sola columna y el orden del DOM
            es el que se ve: titular, entradilla, botones, panel de producto y
            tarjetas. Desde `lg` el panel se va a una segunda columna al lado del
            titular, y las tarjetas recuperan el ancho completo debajo.

            El titular baja de 88px a 56px en `lg` y sube a 64px en `xl`: con una
            columna de 380px al lado, a 88px no cabía ni una línea del titular
            en el hueco restante. Es el coste de meter el producto en el hero, y
            es una decisión consciente de Jaime del 11-ago-2026 frente a las dos
            alternativas que no tocaban el titular.
          */}
          {/*
            `lg:items-center`, no `items-start` a secas: el panel de producto mide
            unos 120px mas que la columna de texto y, al ser el elemento mas alto,
            es quien fija la altura de la fila. Anclados arriba, todo ese sobrante
            se acumulaba DEBAJO de los botones (unos 185px de vacio) mientras el
            panel quedaba pegado a las tarjetas. Centrados, el sobrante se reparte
            arriba y abajo del texto y el titular queda a la altura del panel.
          */}
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:gap-16">
          <div className="max-w-[920px]">
            {/*
              Excepción puntual de vocabulario, aprobada por Jaime el 11-ago-2026:
              esta frase exacta está descartada del `strip` de la regla "Vocabulario
              prohibido (§0)" en `scripts/check-copy.mjs`. Es la única frase del sitio
              con esa palabra permitida, y solo con esta redacción literal. No
              reutilizar la palabra suelta en ningún otro sitio.
            */}
            <p className="hero-in label-caps mb-4 sm:mb-6">Financiación alternativa tokenizada</p>

            {/*
              Las dos lineas eran texto suelto separado por un `<br>`; ahora cada
              una es su propio bloque para poder entrar por separado, escalonadas.
              El `<br>` se va con ellas: el salto lo hace ya el `block`, y dejarlo
              habria metido una linea vacia de mas.
            */}
            <h1
              id="hero-title"
              className="display-hero mb-6 text-[42px] text-foreground sm:mb-8 sm:text-[60px] md:text-display-xl lg:text-display-lg xl:text-[64px]"
            >
              {/*
                El espacio entre las dos lineas es literal y va aqui a proposito.
                Cada linea es su propio `<span class="block">`, asi que visualmente
                el salto ya existe; pero el TEXTO del titular se lee sin el, y todo
                lo que consume texto plano (el nombre accesible que anuncia un
                lector de pantalla, el fragmento que extrae un buscador, un copiar
                y pegar) recibia "clientesen accionistas" pegado. Un espacio suelto
                entre bloques no pinta nada y arregla las tres cosas.
              */}
              <span className="hero-in block" style={{ "--seq": "90ms" } as React.CSSProperties}>
                Convierte a tus clientes
              </span>{" "}
              <span className="hero-in block" style={{ "--seq": "170ms" } as React.CSSProperties}>
                en <span className="text-emerald-400">accionistas.</span>
              </span>
            </h1>

            {/*
              Esta linea estaba en registro neutro ("los mejores clientes de una marca")
              mientras el titular justo encima va en tuteo ("Convierte a tus clientes").
              Eran las dos lineas mas leidas del sitio, una debajo de la otra y en
              registros distintos. Se unifica en tuteo, que es el registro elegido.
            */}
            <p
              className="hero-in mb-8 max-w-2xl text-body-lg text-text-secondary sm:mb-10"
              style={{ "--seq": "260ms" } as React.CSSProperties}
            >
              Tus mejores clientes ya hacen crecer tu marca. Permíteles participar en su capital,
              con marco legal y sin complicar tu cap table.
            </p>

            <div
              className="hero-in flex flex-col gap-3 sm:flex-row"
              style={{ "--seq": "340ms" } as React.CSSProperties}
            >
              <ButtonLink
                href="#contact"
                size="lg"
                onClick={() => track("cta_click", { location: "hero", label: "Agendar una llamada" })}
              >
                Agendar una llamada
                <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>

              <ButtonLink
                href="#calculator"
                variant="cta-outline"
                size="lg"
                onClick={() => track("cta_click", { location: "hero", label: "Calcular mi ronda" })}
              >
                Calcular mi ronda
                <ArrowDown aria-hidden="true" size={16} />
              </ButtonLink>
            </div>

            {/*
              FILA DE CONFIANZA - 26/08/2026.

              El hero pedia una llamada de 30 minutos sobre dinero sin dar una
              sola prueba de nada. La objecion numero uno de un fundador ante
              esto no es "cuanto cuesta", es "¿esto es legal?", y la respuesta la
              teniamos enterrada en la septima seccion. Aqui arriba responde
              antes de que la pregunta se formule.

              No es prueba social (no la hay todavia, y no se inventa): es prueba
              REGULATORIA, que es la que si se puede sostener con documentos.
            */}
            <ul
              className="hero-in mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 sm:mt-8 sm:gap-y-3"
              style={{ "--seq": "420ms" } as React.CSSProperties}
            >
              {trustMarks.map((mark) => (
                <li key={mark} className="flex items-center gap-2">
                  <ShieldCheck aria-hidden="true" size={15} className="shrink-0 text-emerald-400" />
                  <span className="text-caption text-text-secondary">{mark}</span>
                </li>
              ))}
            </ul>
          </div>

          {/*
            El panel de producto. Va con `defer-paint-hero` (ver index.css): por
            debajo de `lg` cae fuera de la primera pantalla, y ahí el navegador
            se ahorra su diseño y su pintado hasta que hace falta. Mismo
            mecanismo que ya usan las cuatro ilustraciones de "Cómo funciona",
            con la altura reservada ajustada a la de este panel, que es más bajo.

            Es decorativo a efectos de accesibilidad (`aria-hidden` va dentro,
            en el propio marco): las cifras que enseña no dicen nada que el copy
            del hero no diga ya, y leerlas en voz alta como una lista de datos
            sueltos solo estorbaría.
          */}
          <div
            className="hero-in-panel lg:self-center"
            style={{ "--seq": "200ms" } as React.CSSProperties}
          >
            {/*
              Dos divs y no uno: `.figure-drift` ya usa la propiedad `animation`
              de este elemento para el paralaje, y la entrada necesita la suya.
              El envoltorio de fuera entra; el de dentro deriva con el scroll.
            */}
            <div className="figure-drift draw-on defer-paint-hero">
              <HeroPanelMockup />
            </div>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
            {valueProps.map(({ icon: Icon, label, title, desc }) => (
              <li key={label} className="glass-card p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft">
                    <Icon aria-hidden="true" size={14} className="text-emerald-400" />
                  </span>
                  <span className="text-micro uppercase text-text-tertiary">{label}</span>
                </div>
                <p className="mb-2 text-label leading-snug text-foreground">{title}</p>
                <p className="text-caption-lg text-text-secondary sm:text-caption">{desc}</p>
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
