import { ArrowRight } from "lucide-react";
import { ButtonLink } from "./ui/Button";
import { Reveal } from "./ui/Reveal";
import { track } from "../lib/analytics";

/**
 * La tesis. Es el momento de reencuadre de la pagina, y por eso lleva su propia
 * reticula de fondo y un halo esmeralda muy tenue, como en el original.
 */
export function PrincipleSection() {
  return (
    <section
      id="thesis"
      aria-labelledby="thesis-title"
      className="relative overflow-hidden border-y border-border bg-background"
    >
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="animate-breathe pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(52,211,153,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="shell relative py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-[760px] text-center">
          <Reveal as="p" className="label-caps mb-8">
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
            <Reveal as="span" delay={80} className="block">
              Tu comunidad no es un canal de marketing.
            </Reveal>
            <Reveal as="span" delay={200} className="block text-text-tertiary">
              Es una fuente de capital.
            </Reveal>
          </h2>

          <Reveal as="p" delay={280} className="mx-auto mb-10 max-w-xl text-body-lg text-text-secondary">
            La propiedad alinea lo que quieren tus clientes con lo que necesita tu marca: cuando
            crece, ganan los dos. Ownex es la infraestructura para ejecutarlo.
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
