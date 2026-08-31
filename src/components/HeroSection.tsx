import { ArrowDown, ArrowRight, Landmark, Repeat, Share2 } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { DotField } from "./DotField";
import { HeroLiveStrip, HeroPanelMockup } from "./ProductMockups";
import { track } from "../lib/analytics";

/**
 * Hero (v2).
 *
 * Titular a dos tonos, panel de producto al lado desde `lg`, y tres tarjetas de
 * propuesta de valor debajo.
 *
 * LA RETICULA HA VUELTO - 31/08/2026. Este docblock se corrigio el 27/08 para
 * decir que la retícula de puntos reactiva al cursor se habia ido con el fondo
 * negro y que su componente estaba borrado. Vuelve a ser falso, y esta vez en la
 * otra direccion: `DotField.tsx` esta de vuelta, recalibrado para el lienzo claro
 * (ver su propio docblock). Es la textura de fondo del hero y lo unico de esta
 * pantalla que responde al raton.
 *
 * Lo que si sigue siendo verdad de aquella correccion: el lienzo es claro desde el
 * 25/08 (`brand/BRAND.md` §9.1) y la entrada escalonada (`.hero-in`, bloque 8 de
 * `index.css`) llego el 26/08.
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
  LAS TRES TARJETAS, A LA MITAD - 29/08/2026.

  Sumaban unas 90 palabras de cuerpo compitiendo con el titular DENTRO de la
  primera pantalla. Tres párrafos de tres líneas, en gris, del mismo tamaño entre
  sí y sin jerarquía entre ellos: en un sitio donde se decide en cinco segundos,
  90 palabras no se leen, se saltan, y de paso empujan hacia abajo lo único que
  sí se lee (el titular, la promesa y los botones).

  Ahora cada una dice UNA cosa en una línea. No se ha perdido ningún hecho: los
  dos que solo vivían aquí (el LTV y el CAC) siguen dichos, y "una sola línea en
  el cap table" lo repiten la banda de cifras de debajo y la fila de confianza de
  arriba. Lo que se ha ido es el relleno que los envolvía.
*/
const valueProps = [
  {
    icon: Landmark,
    label: "Financiación",
    title: "Financia tu crecimiento con tu comunidad",
    /*
      REDACCION DE JAIME - 31/08/2026. Decia "Tus clientes entran como accionistas
      minoritarios, en una sola linea." La version nueva dice ademas COMO: a traves
      de Ownex, que entra en el cap table como un solo inversor. Ese "como" es la
      objecion que un fundador pone antes que ninguna otra al oir "mis clientes de
      accionistas", asi que contestarla aqui vale mas que la brevedad.

      "unico inversor", con tilde y sin la doble c del mensaje original.
    */
    desc: "Tus clientes entran como accionistas minoritarios a través de Ownex, como un único inversor en tu cap table y sin ceder control.",
  },
  {
    icon: Repeat,
    label: "Fidelización",
    title: "Aumenta la retención de clientes",
    /*
      REDACCION DE JAIME - 31/08/2026. Decia "El propietario gasta mas, se queda mas
      y sube tu LTV." La version nueva nombra la CAUSA antes que los efectos: el
      sentimiento de pertenencia es el mecanismo, y gastar mas, fidelizarse y subir
      el LTV son sus tres consecuencias. Dicho asi la ficha explica por que pasa, no
      solo que pasa.

      Minuscula despues de los dos puntos ("gasta"), que es lo que manda la
      ortografia espanola cuando lo que sigue no es cita ni enunciado independiente.
      Es ademas como ya estaba escrita la ficha de al lado ("Cada accionista refiere:
      tu comunidad crece...").
    */
    desc: "El propietario aumenta su sentimiento de pertenencia con el negocio: gasta más, se fideliza más y aumenta su LTV.",
  },
  {
    icon: Share2,
    label: "Crecimiento",
    title: "Expande tu marca orgánicamente",
    /*
      REDACCION DE JAIME - 31/08/2026. Decia "Cada accionista refiere: tu comunidad
      crece y tu CAC baja." La version nueva nombra el PAPEL antes que el efecto
      (embajador de la marca), igual que la ficha de fidelizacion nombra el
      mecanismo antes que sus consecuencias. Las tres fichas quedan asi con la misma
      forma: causa, dos puntos, efecto.

      "CAC" en versales, no "CaC": es como ya estaba escrito aqui y como lo escribe
      el resto del repositorio.
    */
    desc: "Cada accionista actúa como embajador de la marca: refiere a sus contactos y el CAC se reduce.",
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
        LA RETICULA VA LA PRIMERA Y SIN `z`, o sea en el fondo de la pila: el
        contenido de debajo lleva `z-10` y queda por encima sin necesidad de que
        esta capa declare nada.

        Y el bloque de contenido lleva `pointer-events-none` con los enlaces y
        botones devueltos a `auto` uno por uno. Ese apaño ya estaba escrito antes
        de que la retícula volviera -- se quedo huerfano cuando se fue-- y es
        exactamente lo que hace falta: el `mousemove` que mueve los puntos esta en
        el contenedor del canvas, asi que el raton tiene que poder ATRAVESAR el
        titular para llegar hasta el. Sin eso, la retícula se congelaria justo
        encima del texto, que es la mitad de la pantalla.
      */}
      <DotField />

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
      {/*
        EL FALSO FONDO DE ESCRITORIO - 29/08/2026.

        En 1440x900, el hero terminaba justo en el pliegue: las tarjetas
        arrancaban 16px POR DEBAJO del borde inferior y lo ultimo que se veia eran
        48px de blanco. Una pantalla que acaba en blanco se lee como el final de la
        pagina, y da igual que haya nueve secciones detras: si nada asoma, nada
        invita a bajar.

        Se recuperan 56px entre este relleno superior (128 a 96 desde `lg`) y el
        hueco vertical de la retícula (abajo), que es lo que hace que la primera
        fila de tarjetas cruce el pliegue y se vea cortada. Un borde cortado es la
        senal de scroll mas barata que existe.

        En telefono no cambia nada: alli el que asoma es la franja de la ronda.
      */}
      <div className="pointer-events-none relative z-10 w-full pt-[68px] pb-12 sm:pt-32 sm:pb-20 lg:pt-24">
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
          {/*
            El hueco entre filas se separa del hueco entre columnas desde `lg`
            (`gap-y` aparte): entre el texto y el panel hacen falta los 48 o 64px
            de siempre, porque son dos bloques que compiten por el mismo renglon,
            pero entre la fila de arriba y las tarjetas de abajo sobra ese aire, y
            son los 24px que le faltaban a las tarjetas para cruzar el pliegue.
          */}
          <div className="grid items-start gap-6 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-center lg:gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:gap-x-16 xl:gap-y-10">
          <div className="max-w-[920px]">
            {/*
              EL ROTULO CUALIFICA, NO CATEGORIZA - 29/08/2026.

              Decia "Financiación alternativa" seguida de la palabra que el §0
              prohíbe en todo el sitio (la que empieza por T, y que no se escribe
              aquí porque `check:copy` mira también los comentarios). Era la primera
              línea que se leía en toda la página y gastaba ese sitio en dos cosas
              malas a la vez: una CATEGORÍA, que no retiene a nadie porque nadie se
              queda por saber en qué cajón estás, y dentro de ella la única palabra
              del vocabulario que el §0 considera radiactiva. Un fundador de marca de
              consumo la leía antes que el titular y ya estaba decidiendo si esto
              pertenecía al sector del que la marca lleva un año separándose.

              Ahora dice a QUIÉN va dirigido. Es la pregunta que un visitante se hace
              antes que ninguna otra ("¿esto es para mí?") y la única que, contestada
              en la primera línea, hace que siga leyendo la segunda.

              La variante larga que Jaime dejó abierta ("Para PYMES y startups con
              comunidad") cabe igual en una línea a 375px si algún día se prefiere
              nombrar el tamaño de empresa en vez de dejarlo abierto.

              Con esto desaparece del sitio la excepción de vocabulario que Jaime
              aprobó el 11-ago-2026 para esta frase exacta, y con ella su `strip` en
              `scripts/check-copy.mjs`.
            */}
            <p className="hero-in label-caps mb-2 sm:mb-6">Financiación alternativa tokenizada</p>

            {/*
              Las dos lineas eran texto suelto separado por un `<br>`; ahora cada
              una es su propio bloque para poder entrar por separado, escalonadas.
              El `<br>` se va con ellas: el salto lo hace ya el `block`, y dejarlo
              habria metido una linea vacia de mas.
            */}
            <h1
              id="hero-title"
              className="display-hero mb-4 text-[42px] text-foreground sm:mb-8 sm:text-[60px] md:text-display-xl lg:text-display-lg xl:text-[64px]"
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
              <span className="hero-in block" style={{ "--seq": "40ms" } as React.CSSProperties}>
                Convierte a tus clientes
              </span>{" "}
              <span className="hero-in block" style={{ "--seq": "80ms" } as React.CSSProperties}>
                en{" "}
                {/*
                  VUELVE AL VERDE DE RELLENO - 31/08/2026, a peticion de Jaime
                  ("sigo sin ver accionistas en verde como antes").

                  El 29/08 (`e83c74b`) esta palabra paso de `text-emerald-400`
                  (#047857) a `text-accent-ink` (#065F46) dentro del barrido "todo
                  texto de acento pasa a la tinta verde". El barrido era correcto y
                  su motivo tambien: #047857 como TEXTO sobre el lienzo verde da
                  4,7:1 y sobre el chip menta 4,0:1, o sea que suspende AA en los
                  dos sitios donde vive el resto del texto de acento.

                  Pero esta palabra no esta en ninguno de esos dos sitios: esta en
                  el titular del hero, sobre BLANCO, donde #047857 rinde 5,5:1 y
                  cumple de sobra. Y a 64px la diferencia importa: el #065F46 es tan
                  oscuro que se lee como tinta y la palabra deja de destacar, que es
                  justo lo unico que tiene que hacer.

                  Es una excepcion de UN elemento, no una vuelta atras del barrido:
                  el resto del texto de acento se queda en `accent-ink`. Si alguna
                  vez el hero cambia de lienzo, esta palabra tiene que volver a
                  `accent-ink` el mismo dia.
                */}
                <span className="text-emerald-400">accionistas.</span>
              </span>
            </h1>

            {/*
              Esta linea estaba en registro neutro ("los mejores clientes de una marca")
              mientras el titular justo encima va en tuteo ("Convierte a tus clientes").
              Eran las dos lineas mas leidas del sitio, una debajo de la otra y en
              registros distintos. Se unifica en tuteo, que es el registro elegido.
            */}
            {/*
              ESTA REDACCION SE TOCO Y SE DEVOLVIO EL MISMO DIA (29/08/2026). Queda
              escrito para que nadie vuelva a "arreglarla" sin saber que ya se
              intento.

              Se probo esta otra: "Tus mejores clientes ya hacen crecer tu marca y no
              participan de lo que crean. Permíteles entrar en su capital." La idea
              era dejar una tension abierta (el desajuste) antes de resolverla, y de
              paso bajar de cuatro lineas a tres en telefono.

              Jaime la devolvio a la de siempre. Y la de siempre tiene algo que la
              otra no: dice "con marco legal" y "sin complicar tu cap table", que son
              las dos objeciones que un fundador pone ANTES que ninguna otra. Ahi
              arriba contestadas valen mas que una frase mejor construida, porque la
              fila de confianza de debajo las prueba pero no las enuncia.

              Coste, para que este medido: son cuatro lineas en 375px en vez de tres,
              o sea 27px mas de pliegue. Se recuperan en el aire de alrededor (ver el
              margen de este bloque y el del rotulo) para que la franja de la ronda
              siga asomando por el borde inferior.
            */}
            <p
              className="hero-in mb-6 max-w-2xl text-body-lg text-text-secondary sm:mb-10"
              style={{ "--seq": "120ms" } as React.CSSProperties}
            >
              Tus mejores clientes ya hacen crecer tu marca. Permíteles participar en su capital,
              con marco legal y sin complicar tu cap table.
            </p>

            <div
              className="hero-in flex flex-col gap-3 sm:flex-row"
              style={{ "--seq": "160ms" } as React.CSSProperties}
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
              EL CEBO DE LA CALCULADORA SE RETIRA - 31/08/2026, decision de Jaime.

              Vivio dos dias. Entro el 29/08 con un argumento bueno -- el unico
              elemento de la pagina con el que se puede HACER algo estaba a catorce
              pantallas, y entre "leer un argumento" y "ver mi propio numero" no hay
              comparacion -- y sale porque el precio en la primera pantalla no
              compensaba: 230px de los 644 que medía la columna, un 36 % del hero
              para el cebo, y una segunda cifra grande compitiendo con la del panel
              de producto. Se probo antes a compactarlo (de 190 a 143px, con la
              cifra al lado de las pastillas); ayudo, y aun asi Jaime prefirio
              quitarlo.

              Lo que se recupera al quitarlo: la columna vuelve a caber dentro del
              `min-h-screen`, asi que el `justify-center` de la seccion vuelve a
              funcionar y el bloque deja de apretarse contra la barra -- que era la
              otra queja del mismo dia. El aire de arriba se arregla solo.

              El componente `HeroTeaser.tsx` se borra con el: no lo usaba nadie mas.
              Vuelve con `git checkout 96b4a9b -- src/components/HeroTeaser.tsx` y
              recuperando este bloque. `lib/useScenario.ts` NO se toca aunque nacio
              para esto: la calculadora lo sigue usando como su propio estado.
            */}

            {/*
              LA FILA DE CONFIANZA SE RETIRA - 31/08/2026, decision de Jaime.

              Eran tres sellos con escudo: "Ley 6/2023 de Mercados de Valores",
              "Entidades supervisadas por la CNMV" y "Tu cap table, en una sola
              linea". Entraron el 26/08 con un argumento razonable -- el hero pedia
              una llamada de 30 minutos sobre dinero sin dar una sola prueba, y la
              objecion numero uno de un fundador no es "cuanto cuesta" sino "¿esto
              es legal?".

              Lo que no funcionaba era la ejecucion, y estaba medido: los tres
              rotulos suman 627px de texto para los 588px que mide la columna, asi
              que partian SIEMPRE 2 + 1, con el tercero descolgado en un segundo
              renglon. Una prueba de tres patas con una pata suelta resta credito en
              vez de darlo, que es lo contrario de su motivo de existir. Ademas
              repetian tres veces el mismo icono, que por §8.6 de `brand/BRAND.md`
              es senal de que el icono sobra: si no distingue, no informa.

              La prueba regulatoria no se pierde del sitio: "Marco regulatorio" es
              una seccion entera, con las normas citadas por articulo.

              Si vuelve, tiene que hacerlo a ancho completo de la retícula
              (`lg:col-span-2`), que es donde los 627px si caben en una linea.
            */}
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

            NO SE PINTA EN TELEFONO (`hidden lg:block`) - 29/08/2026. Ocupaba unos
            560px, la mitad del hero en móvil, para repetir en dibujo lo que el
            titular ya dice en palabras. La prueba de "esto es un producto real"
            la lleva "Cómo funciona" con sus tres pantallas de verdad; aquí, en la
            primera pantalla, lo que importa es el titular, la promesa y los dos
            botones, y eso es justo lo que se recupera al quitarlo.
          */}
          <div
            className="hidden hero-in-panel lg:block lg:self-center"
            style={{ "--seq": "140ms" } as React.CSSProperties}
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

          {/*
            LA FRANJA VIVA, SOLO HASTA `lg` - 29/08/2026. El porqué está en
            `HeroLiveStrip` (`ProductMockups.tsx`): devuelve al móvil la prueba de
            producto que se fue con el panel, en 120px en vez de 560.

            Va la última del bloque de texto y justo antes de las tarjetas para que
            caiga AL FILO del pliegue en un teléfono de 812px: asomando por el borde
            es la invitación a bajar, y entera no lo sería.

            `hero-in` con el retardo más largo de la escalera: es lo último que
            entra porque es lo último que hay que mirar.
          */}
          <div
            className="hero-in lg:hidden"
            style={{ "--seq": "240ms" } as React.CSSProperties}
          >
            <HeroLiveStrip />
          </div>

          <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
            {valueProps.map(({ icon: Icon, label, title, desc }) => (
              <li key={label} className="glass-card glass-card-ambient p-4">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent-soft">
                    <Icon aria-hidden="true" size={14} className="text-accent-ink" />
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
