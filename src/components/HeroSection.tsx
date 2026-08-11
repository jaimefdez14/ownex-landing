import { ArrowDown, ArrowRight, Landmark, Repeat, Share2 } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { DotField } from "./DotField";
import { track } from "../lib/analytics";

/**
 * Hero (v2).
 *
 * Reproduce el del proyecto de Lovable: retícula de puntos reactiva al cursor sobre
 * fondo casi negro, viñeta radial, titular a dos tonos y tres tarjetas de propuesta
 * de valor.
 *
 * Dos diferencias respecto al original, ambas deliberadas:
 *
 *  - No lleva animacion de entrada. El original desvanecia cada bloque con
 *    `initial={{ opacity: 0 }}`, lo que dejaba el hero en blanco si el JavaScript no
 *    llegaba a ejecutarse. Es el fallo mas caro posible en una landing, porque anula
 *    la conversion sin dar ninguna senal de error. El fondo animado ya aporta el
 *    movimiento; el contenido se pinta y ya esta visible.
 *  - El icono de "Financiación" no es una moneda. El §0 descarta la iconografia de
 *    monedas por el tono que se busca.
 */

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
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-background"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="absolute inset-0" aria-hidden="true">
        <DotField />
        {/* Viñeta radial y desvanecido inferior, para que la retícula no corte en seco. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0A0B0C_85%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      </div>

      {/*
        El contenido deja pasar el raton para que la retícula reaccione debajo, y
        solo los controles vuelven a capturarlo.
      */}
      <div className="pointer-events-none relative z-10 w-full pt-32 pb-20">
        <div className="shell [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
          <div className="max-w-[920px]">
            {/*
              Excepción puntual de vocabulario, aprobada por Jaime el 11-ago-2026:
              esta frase exacta está descartada del `strip` de la regla "Vocabulario
              prohibido (§0)" en `scripts/check-copy.mjs`. Es la única frase del sitio
              con esa palabra permitida, y solo con esta redacción literal. No
              reutilizar la palabra suelta en ningún otro sitio.
            */}
            <p className="label-caps mb-6">Financiación alternativa tokenizada</p>

            <h1
              id="hero-title"
              className="display-hero mb-8 text-[44px] text-foreground sm:text-[60px] md:text-display-xl lg:text-display-2xl"
            >
              Convierte a tus clientes
              <br />
              en <span className="text-shimmer">accionistas.</span>
            </h1>

            {/*
              Esta linea estaba en registro neutro ("los mejores clientes de una marca")
              mientras el titular justo encima va en tuteo ("Convierte a tus clientes").
              Eran las dos lineas mas leidas del sitio, una debajo de la otra y en
              registros distintos. Se unifica en tuteo, que es el registro elegido.
            */}
            <p className="mb-10 max-w-2xl text-body-lg text-text-secondary">
              Tus mejores clientes ya hacen crecer tu marca. Permíteles participar en su capital,
              con marco legal y sin complicar tu cap table.
            </p>

            <div className="mb-16 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="#contact"
                size="lg"
                onClick={() => track("cta_click", { location: "hero", label: "Agendar una llamada" })}
              >
                Agendar una llamada
                <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>

              <ButtonLink
                href="#framework"
                variant="cta-outline"
                size="lg"
                onClick={() => track("cta_click", { location: "hero", label: "Ver cómo funciona" })}
              >
                Ver cómo funciona
                <ArrowDown aria-hidden="true" size={16} />
              </ButtonLink>
            </div>

            <ul className="grid gap-3 sm:grid-cols-3">
              {valueProps.map(({ icon: Icon, label, title, desc }) => (
                <li key={label} className="glass-card glass-card-hover p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
                      <Icon aria-hidden="true" size={14} className="text-emerald-400" />
                    </span>
                    <span className="text-micro uppercase text-emerald-400">{label}</span>
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
