import { ShieldCheck } from "lucide-react";
import { Reveal } from "./ui/Reveal";

/**
 * Marco regulatorio.
 *
 * El original de Lovable mostraba dos fichas: la LMVSI y un régimen piloto europeo
 * de infraestructuras de mercado (el DLT Pilot Regime), y afirmaba sin más detalle
 * que cada emisión cumple "con la normativa europea". Esa segunda ficha se retiró
 * en su momento porque el régimen piloto no gobernaba la operación de entonces
 * (SPV + LMVSI + entidades reguladas) y su nombre choca con una de las siglas que
 * el §0 prohíbe en todo el sitio.
 *
 * Jaime decidió el 11-ago-2026 reincorporarla a propósito, como la base regulatoria
 * que habilitará mercado secundario para los accionistas más adelante: es una
 * afirmación consciente sobre hacia dónde va la operación, no un descuido que se
 * cuela otra vez. La sigla "DLT" se sacó de la lista de prohibidas en
 * `scripts/check-copy.mjs` para esta ficha. La frase exacta que motivó la excepción
 * de vocabulario prohibido en ese mismo fichero vive ahora en el eyebrow del hero
 * (`HeroSection.tsx`), no aquí: el `strip` de esa regla es global, así que cubre la
 * frase la use el fichero que la use. El resto del sitio sigue vigilado sin cambios.
 *
 * FORMA (11-ago-2026). Hasta ahora esto eran tres tarjetas iguales en una columna,
 * con el mismo tratamiento que las de "El desajuste" y las de "Casos de uso": era
 * la cuarta sección seguida en formato "tres cosas en fila", y encima la más fría
 * de todas. El contenido no cambia, cambia cómo se presenta.
 *
 * Ahora es un diagrama, y el diagrama dice algo que las tarjetas no decían: quién
 * hace qué, en qué orden, y dentro de qué. Los tres actores van encadenados por un
 * raíl (tu marca decide, Ownex estructura, las entidades autorizadas validan) y los
 * tres viven DENTRO de un marco que es la ley: la LMVSI no es un actor más de la
 * fila, es lo que contiene a los otros tres. El régimen piloto queda fuera de ese
 * marco, colgando de un enlace punteado, porque es lo que viene después y no lo que
 * gobierna la operación de hoy. Esa distinción se perdía cuando los tres bloques
 * eran tarjetas idénticas.
 */

/** Los tres actores de la cadena, dentro del marco de la LMVSI. */
const actors = [
  {
    role: "Decide",
    name: "Tu marca",
    desc: "Fija la emisión y sus condiciones: cuánto capital levanta, en qué términos y a qué parte de su comunidad se dirige.",
  },
  {
    role: "Estructura y opera",
    name: "Ownex",
    desc: "Monta la estructura legal y financiera, prepara la documentación y opera la tecnología: flujo KYC/AML, registro y hub de accionistas.",
  },
  {
    role: "Valida y supervisa",
    name: "ESI y ERIR",
    desc: "Coordinan cada emisión y asumen la supervisión regulatoria. Tu marca no necesita licencia propia.",
  },
];

export function RegulationSection() {
  return (
    <section
      id="regulation"
      aria-labelledby="regulation-title"
      className="section-padding border-t border-border bg-background"
    >
      <div className="shell">
        <div className="mb-14 max-w-[800px]">
          <Reveal as="p" className="label-caps mb-5">
            Marco regulatorio
          </Reveal>
          <Reveal
            as="h2"
            id="regulation-title"
            delay={60}
            className="display-section mb-8 text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            Cada emisión cumple con la normativa española de valores.
          </Reveal>
          <Reveal as="p" delay={120} className="mb-5 max-w-reading text-body-lg text-text-secondary">
            Estructuramos cada emisión bajo la LMVSI, la ley española que transpone MiFID II y regula
            la emisión de valores. No operamos en vacíos legales ni en zonas grises.
          </Reveal>
          <Reveal as="p" delay={180} className="max-w-reading text-body-lg text-text-secondary">
            Coordinamos cada emisión con entidades de inversión autorizadas (ESI/ERIR) y preparamos
            documentación legal completa: folleto informativo o exención, estructura SPV, pacto de
            socios, y flujo KYC/AML.
          </Reveal>
        </div>

        <Reveal delay={100}>
          {/*
            El marco: una caja que contiene a los tres actores. Es la LMVSI dibujada
            como lo que es, un perímetro, en vez de como una ficha al lado de las
            otras dos.
          */}
          <div className="rounded-lg border border-border bg-card/40 p-5 md:p-8 lg:p-10">
            <div className="mb-10 flex items-center gap-4">
              <span className="icon-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
                <ShieldCheck aria-hidden="true" size={18} className="text-emerald-400" />
              </span>
              <div className="min-w-0">
                <p className="text-body font-medium leading-tight tracking-tight text-foreground">
                  Todo esto ocurre dentro de la LMVSI
                </p>
                <p className="mt-1 text-micro uppercase text-text-tertiary">
                  Ley de Mercados de Valores y Servicios de Inversión
                </p>
              </div>
            </div>

            {/*
              La cadena. En móvil el raíl es vertical y va del punto de cada actor al
              del siguiente; desde `lg` los tres actores pasan a columnas y el mismo
              raíl se tumba en horizontal.

              Cada tramo de raíl lo dibuja el actor del que sale, nunca la lista: así
              su longitud se mide contra el bloque que ya lo contiene (`100%` de ese
              actor más el hueco hasta el siguiente punto) y no hace falta adivinar
              dónde cae el último punto, que es lo que obligaba a difuminar el final
              de la línea. Por eso el último actor no lleva raíl: la cadena termina
              exactamente en su punto.
            */}
            <ol className="grid gap-8 lg:grid-cols-3 lg:gap-0">
              {actors.map((actor, index) => (
                <li key={actor.name} className="relative pl-7 lg:pl-0 lg:pr-8 lg:pt-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[3px] flex h-[13px] w-[13px] items-center justify-center rounded-full border border-emerald-400/60 bg-background lg:top-0"
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" />
                  </span>

                  {index < actors.length - 1 ? (
                    <>
                      {/*
                        El raíl se aclara hacia el punto del actor siguiente en vez
                        de ser un gris plano: a `bg-border` a secas la línea casi no
                        se ve sobre la caja, y con el degradado la cadena además se
                        lee en su sentido, que es de lo que va el diagrama.
                      */}
                      <span
                        aria-hidden="true"
                        className="absolute left-[6px] top-5 h-[calc(100%+1rem)] w-px bg-gradient-to-b from-border to-emerald-400/45 lg:hidden"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute left-[6px] top-[6px] hidden h-px w-[calc(100%+6px)] bg-gradient-to-r from-border to-emerald-400/45 lg:block"
                      />
                    </>
                  ) : null}

                  <p className="text-micro uppercase text-emerald-400">{actor.role}</p>
                  <p className="mt-3 text-title leading-tight text-foreground">{actor.name}</p>
                  <p className="mt-2 text-body text-text-secondary">{actor.desc}</p>
                </li>
              ))}
            </ol>
          </div>

          {/*
            El régimen piloto cuelga del marco por un enlace punteado y con borde
            punteado propio: está fuera de la caja a propósito, porque no gobierna la
            operación de hoy. Lo punteado es lo que dice "esto todavía no", sin
            necesidad de escribirlo dos veces.
          */}
          <div aria-hidden="true" className="mx-auto h-10 w-px border-l border-dashed border-border" />

          <div className="rounded-lg border border-dashed border-border p-5 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-10">
              <div className="md:w-[240px] md:shrink-0">
                <p className="label-caps mb-4">Más adelante</p>
                <p className="text-title leading-tight text-foreground">Mercado secundario</p>
                <p className="mt-1 text-micro uppercase text-text-tertiary">DLT Pilot Regime</p>
              </div>
              <p className="max-w-reading text-body text-text-secondary">
                Régimen piloto europeo (Reglamento (UE) 2022/858) que habilita infraestructuras de
                mercado sobre tecnología de registro distribuido, incluido un mercado secundario para
                valores digitales.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
