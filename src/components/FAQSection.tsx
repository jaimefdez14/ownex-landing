import { Accordion } from "./ui/Accordion";
import { Reveal } from "./ui/Reveal";
import { faqItems } from "../data/faq";

export function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="section-padding border-t border-border bg-background"
    >
      <div className="shell">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <Reveal as="p" className="label-caps mb-5">
              Preguntas frecuentes
            </Reveal>
            <Reveal
              as="h2"
              id="faq-title"
              delay={60}
              className="display-section mb-6 text-display text-foreground md:text-display-lg lg:text-[64px]"
            >
              Lo que necesitas saber antes de hablar con nosotros.
            </Reveal>
            <Reveal as="p" delay={120} className="text-body-lg text-text-secondary">
              Estas son las respuestas a las preguntas que más escuchamos.
            </Reveal>
          </div>

          <Reveal delay={150}>
            <Accordion items={faqItems} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
