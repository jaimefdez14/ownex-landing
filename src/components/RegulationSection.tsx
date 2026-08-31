import { BadgeCheck, Network, Scale } from "lucide-react";
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
 * REVERTIDO EL 11-ago-2026: hubo una versión intermedia que sustituía estas tres
 * fichas por un diagrama de flujo (Tu marca → Ownex → ESI/ERIR, los tres dentro de
 * un marco de la LMVSI), pensado para romper el patrón "tres tarjetas en fila" que
 * se repite en otras secciones. Jaime prefirió esta versión: la sección habla de
 * normativas y entidades reguladas, no de un reparto de responsabilidades por
 * pasos, y meter ese reparto en forma de flujo mezclaba dos conceptos que no hacía
 * falta mezclar. Si se quiere retomar el diagrama, el commit
 * `27d6ed3` lo tiene completo.
 */

/*
 * Un icono distinto por ficha, y la referencia legal exacta como pie.
 *
 * Hasta el 15-ago-2026 las tres fichas llevaban el mismo escudo de
 * `lucide-react`. Tres iconos idénticos en una columna no distinguen nada: el
 * ojo los lee como una viñeta repetida y el espacio que ocupan no aporta. Ahora
 * cada uno dice de qué habla su ficha (la ley, la entidad que la aplica, la
 * infraestructura de mercado), y debajo va la referencia citable, que es lo que
 * de verdad separa esta sección de una promesa vaga de cumplimiento.
 */
const norms = [
  {
    icon: Scale,
    name: "LMVSI",
    full: "Ley de Mercados de Valores y Servicios de Inversión",
    desc: "Regulación española que transpone MiFID II y regula la emisión de valores.",
    ref: "Ley 6/2023, de 17 de marzo",
  },
  {
    icon: BadgeCheck,
    name: "ESI y ERIR",
    full: "Entidades reguladas",
    desc: "Coordinan cada emisión y asumen la supervisión regulatoria. Tu marca no necesita licencia propia.",
    ref: "Supervisión bajo la CNMV",
  },
  {
    icon: Network,
    name: "DLT Pilot Regime",
    full: "Mercado secundario",
    desc: "Régimen piloto europeo que habilita infraestructuras de mercado sobre tecnología de registro distribuido, incluido un mercado secundario para valores digitales.",
    ref: "Reglamento (UE) 2022/858",
  },
];

export function RegulationSection() {
  return (
    <section
      id="regulation"
      aria-labelledby="regulation-title"
      className="section-padding spotlight bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal as="p" className="rule-grow label-caps mb-5">
              Marco regulatorio
            </Reveal>
            <Reveal
              as="h2"
              id="regulation-title"
              delay={60}
              className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
            >
              Cada emisión cumple con la normativa española de valores.
            </Reveal>
            <Reveal as="p" delay={120} className="mb-5 text-body-lg text-text-secondary">
              Estructuramos cada emisión bajo la LMVSI, la ley española que transpone MiFID II y regula
              la emisión de valores. No operamos en vacíos legales ni en zonas grises.
            </Reveal>
            <Reveal as="p" delay={180} className="text-body-lg text-text-secondary">
              Coordinamos cada emisión con entidades de inversión autorizadas (ESI/ERIR) y preparamos
              documentación legal completa: folleto informativo o exención, estructura SPV, pacto de
              socios, y flujo KYC/AML.
            </Reveal>
          </div>

          <Reveal delay={100} className="stagger-children space-y-3">
            {norms.map(({ icon: Icon, name, full, desc, ref }) => (
              /*
                EL TEXTO DEJA DE IR SANGRADO EN TELEFONO - 29/08/2026.

                Era un `flex`: el icono a la izquierda y TODO el texto en la
                columna de al lado, descripcion incluida. En escritorio esta bien;
                en 375px la tarjeta da 303px, el relleno se lleva 48 y el icono
                con su hueco otros 56, asi que a la descripcion le quedaban 199px
                de los 375 de pantalla. La norma mas larga (DLT Pilot Regime) se
                partia en seis lineas cortas y la tarjeta parecia una columna de
                periodico.

                Ahora es una reticula de dos columnas. En telefono el icono
                comparte fila SOLO con el nombre de la norma, y la descripcion
                baja a una fila propia a ancho completo (`col-span-2`): recupera
                los 56px del sangrado y pasa de seis lineas a cuatro. Desde `sm`
                el icono abarca las dos filas (`sm:row-span-2`) y la descripcion
                vuelve a su columna, o sea exactamente la maqueta de antes.
              */
              <div key={name} className="glass-card glass-card-ambient p-6">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4">
                  <span className="icon-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft sm:row-span-2">
                    <Icon aria-hidden="true" size={18} className="text-accent-ink" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-body font-medium leading-tight tracking-tight text-foreground">
                      {name}
                    </p>
                    <p className="mt-1 text-micro uppercase text-text-tertiary">{full}</p>
                  </div>
                  <div className="col-span-2 mt-3 min-w-0 sm:col-span-1 sm:col-start-2">
                    <p className="text-body text-text-secondary">{desc}</p>
                    <p className="mt-3 inline-flex rounded-full bg-card-hover px-3 py-1 text-micro uppercase text-text-tertiary">
                      {ref}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
