import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { track } from "../lib/analytics";

/**
 * Articulos de captacion por buscador.
 *
 * ANADIDA EL 27/08/2026 a peticion de Jaime, que pidio articulos de posicionamiento
 * que den autoridad sobre financiacion alternativa, startups y rondas.
 *
 * DOS DECISIONES DE ARQUITECTURA:
 *
 * 1. Los articulos NO son parte de esta aplicacion de React. Son HTML estatico en
 *    `public/articulos/`, exactamente igual que los tres documentos legales, y
 *    comparten su hoja `legal.css`. La landing prerenderiza UNA sola pagina
 *    (`scripts/prerender.mjs` inyecta el HTML dentro de `dist/index.html`), asi
 *    que meter articulos aqui dentro obligaria a montar enrutado y prerenderizado
 *    por ruta para conseguir exactamente lo que un fichero HTML ya da gratis:
 *    una URL propia, indexable y servida entera al primer byte.
 *
 * 2. Esta seccion enlaza SOLO articulos que existen. Un listado con entradas
 *    "proximamente" no da autoridad, da enlaces muertos: cada uno es una pagina
 *    que el buscador visita y descarta.
 *
 * Los legales van con `noindex`; estos con `index, follow` y su `canonical`. Son
 * lo contrario: existen para ser encontrados.
 */
const articles = [
  {
    href: "/articulos/ronda-de-financiacion-con-tus-clientes.html",
    kicker: "Rondas y estructura",
    title: "Cómo abrir una ronda de financiación a tus clientes en España",
    summary:
      "Qué estructura necesitas, qué exige la Ley 6/2023 y por qué el límite de 90.000 € que todo el mundo cita no es un límite legal.",
    minutes: "7 min",
  },
  {
    href: "/articulos/spv-cap-table-limpio.html",
    kicker: "Estructura",
    title: "Qué es un SPV y por qué tu próxima ronda depende de él",
    summary:
      "Cómo un vehículo agrupa a cientos de inversores en una sola línea, qué conserva el inversor y los tres errores que se repiten.",
    minutes: "6 min",
  },
];

export function ResourcesSection() {
  return (
    <section
      id="recursos"
      aria-labelledby="recursos-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px] md:mb-14">
          <Reveal as="p" className="rule-grow label-caps mb-5">
            Recursos
          </Reveal>
          <h2
            id="recursos-title"
            className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            Lo que hemos aprendido montando emisiones.
          </h2>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Sin humo y con las referencias legales delante. Si vas a abrir tu capital a tus
            clientes, esto es lo que conviene saber antes de la primera llamada.
          </Reveal>
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {articles.map(({ href, kicker, title, summary, minutes }, index) => (
            <Reveal
              as="li"
              key={href}
              delay={index * 100}
              className="glass-card glass-card-hover relative flex flex-col p-6 md:p-8"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-accent-soft px-3 py-1 text-micro font-medium uppercase text-on-accent-soft">
                  {kicker}
                </span>
                <span className="text-micro tabular text-text-tertiary">{minutes}</span>
              </div>

              <h3 className="mb-3 text-title leading-tight text-foreground">
                {/*
                  El enlace cubre la tarjeta entera con `after:absolute`, asi que se
                  puede pulsar en cualquier punto y el texto sigue seleccionable. Es
                  el mismo patron que las fichas de sector: una tarjeta que se
                  levanta al pasar el raton esta diciendo "pulsame", y tiene que
                  cumplirlo en toda su superficie.
                */}
                <a
                  href={href}
                  onClick={() => track("cta_click", { location: "recursos", label: title })}
                  className="cursor-pointer after:absolute after:inset-0 after:content-['']"
                >
                  {title}
                </a>
              </h3>

              <p className="mb-6 flex-1 text-body text-text-secondary">{summary}</p>

              <span className="flex items-center gap-2 text-caption font-medium text-emerald-400">
                Leer el artículo
                <ArrowUpRight aria-hidden="true" size={15} />
              </span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
