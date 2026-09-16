import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { track } from "../lib/analytics";
import { HUB_RECURSOS, RECURSOS_DESTACADOS, TOTAL_RECURSOS } from "../data/articulos";
import { useCopy } from "../i18n/locale";

const COPY = {
  es: {
    eyebrow: "Recursos",
    title: "¿Quieres aprender cómo la tokenización está disrumpiendo la financiación de startups?",
    body: "Guías sobre lo que de verdad decide una ronda dirigida a tus propios clientes: la estructura societaria, lo que exige la ley española y cómo se opera todo cuando hay cientos de inversores.",
    read: "Leer el artículo",
    all: `Ver los ${TOTAL_RECURSOS.es} recursos publicados`,
  },
  en: {
    eyebrow: "Resources",
    title: "Want to learn how tokenisation is disrupting startup financing?",
    body: "Guides on what really decides a round aimed at your own customers: the corporate structure, what Spanish law requires and how it is all run once there are hundreds of investors.",
    read: "Read the article",
    /* El hub ingles publica menos articulos que el espanol; ver `data/articulos.ts`. */
    all: `See all ${TOTAL_RECURSOS.en} published resources`,
  },
};

/**
 * Escaparate de los recursos. Tres tarjetas y una puerta al hub.
 *
 * REHECHA EL 01/09/2026. Antes esta seccion ERA el listado completo: dos articulos
 * escritos a mano aqui dentro y ningun sitio al que ir despues de leerlos. Con dos
 * articulos eso se sostenia; con diez, no, y con diez es cuando empieza a competir
 * de verdad por busqueda. El listado completo vive ahora en `/articulos/`, con
 * portada, categorias y ficha por articulo, y esta seccion vuelve a ser lo que
 * tiene que ser: un escaparate con una salida clara.
 *
 * Lo que cambia respecto a la version anterior:
 *  - Las tarjetas llevan PORTADA. Es lo que separa una lista de enlaces de algo que
 *    parece una publicacion, y es lo que hacen las referencias que Jaime puso sobre
 *    la mesa (hokenfi.com/blog, reental.co/en/blog). Las portadas son SVG oscuros y
 *    diagramaticos, no fotografia de banco: dibujan el concepto del articulo.
 *  - Tres columnas en escritorio en vez de dos, porque ya hay material para llenarlas.
 *  - Un enlace al hub debajo, con el numero de recursos publicados. Sin el, esta
 *    seccion era un callejon: se leia un articulo y se acababa el sitio.
 *
 * Los datos de las tres tarjetas estan en `src/data/articulos.ts`, con la nota de
 * por que los articulos no son parte de esta aplicacion de React.
 */
export function ResourcesSection() {
  const t = useCopy(COPY);
  const recursos = useCopy(RECURSOS_DESTACADOS);
  const hub = useCopy(HUB_RECURSOS);

  return (
    <section
      id="recursos"
      aria-labelledby="recursos-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-6 max-w-[800px] sm:mb-10 md:mb-14">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <h2
            id="recursos-title"
            className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            {t.title}
          </h2>
          <Reveal as="p" delay={120} className="max-w-reading text-body text-text-secondary sm:text-body-lg">
            {t.body}
          </Reveal>
        </div>

        {/*
          CARRUSEL HORIZONTAL EN TELEFONO - 29/08/2026, a petición de Jaime
          ("los artículos no pueden estar apilados verticalmente").

          En teléfono se deslizan en horizontal, cada una a poco más de cuatro
          quintos del ancho para que la segunda asome por el borde y se vea que hay
          más. `snap-x` para que cada deslizamiento pare en una tarjeta entera. La
          tira bleedea a los bordes de la pantalla (`-mx-5 px-5`) y recupera el
          margen desde `md`, donde vuelve a ser una retícula.
        */}
        <ul className="-mx-5 flex snap-x gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {recursos.map(({ href, portada, categoria, titulo, resumen, minutos }, index) => (
            <Reveal
              as="li"
              key={href}
              delay={index * 100}
              className="glass-card glass-card-hover relative flex w-[82%] shrink-0 snap-start flex-col overflow-hidden sm:w-[65%] md:w-auto"
            >
              {/*
                `alt=""` a propósito: la portada es decorativa y el artículo ya está
                nombrado por su título, que es el enlace. Un texto alternativo aquí
                obligaría al lector de pantalla a oír dos veces lo mismo.
              */}
              <img
                src={portada}
                alt=""
                width={1200}
                height={600}
                loading="lazy"
                className="aspect-[2/1] w-full object-cover"
              />

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="mb-3 flex items-center gap-3 sm:mb-4">
                  <span className="truncate whitespace-nowrap rounded-full bg-accent-soft px-3 py-1 text-micro font-medium uppercase text-on-accent-soft">
                    {categoria}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-micro tabular text-text-tertiary">
                    {minutos}
                  </span>
                </div>

                <h3 className="mb-2 text-title leading-tight text-foreground sm:mb-3">
                  {/*
                    El enlace cubre la tarjeta entera con `after:absolute`, asi que se
                    puede pulsar en cualquier punto y el texto sigue seleccionable. Es
                    el mismo patron que las fichas de sector: una tarjeta que se
                    levanta al pasar el raton esta diciendo "pulsame", y tiene que
                    cumplirlo en toda su superficie.
                  */}
                  <a
                    href={href}
                    onClick={() => track("cta_click", { location: "recursos", label: titulo })}
                    className="cursor-pointer after:absolute after:inset-0 after:content-['']"
                  >
                    {titulo}
                  </a>
                </h3>

                <p className="mb-4 flex-1 text-caption-lg text-text-secondary sm:mb-6 sm:text-body">
                  {resumen}
                </p>

                <span className="flex items-center gap-2 text-caption font-medium text-accent-ink">
                  {t.read}
                  <ArrowUpRight aria-hidden="true" size={15} />
                </span>
              </div>
            </Reveal>
          ))}
        </ul>

        {/*
          La salida. Sin esto la seccion era un callejon sin fondo: tres enlaces y
          se acabo. El numero va escrito porque "ver todos" no dice si hay cuatro o
          cuarenta, y saber que hay diez es lo que convierte el clic.
        */}
        <Reveal as="div" delay={240} className="mt-8 sm:mt-10">
          <a
            href={hub}
            onClick={() => track("cta_click", { location: "recursos", label: "Ver todos los recursos" })}
            className="inline-flex min-h-touch items-center gap-2 rounded-sm text-label text-accent-ink transition-colors hover:text-foreground"
          >
            {t.all}
            <ArrowRight aria-hidden="true" size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
