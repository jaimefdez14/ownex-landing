import { Accordion } from "./ui/Accordion";
import { Reveal } from "./ui/Reveal";
import { faqItems } from "../data/faq";

export function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="section-padding bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="mx-auto max-w-3xl">
          {/*
            CABECERA A LA IZQUIERDA EN TELEFONO - 29/08/2026, misma correccion
            que "La tesis" y por el mismo motivo: a 32px en 335px de ancho el
            titular entra en tres lineas de longitudes muy distintas ("Lo que
            necesitas / saber antes de / hablar con nosotros.") y, centradas, cada
            una arranca en un punto diferente. Un titular de tres lineas necesita
            un borde izquierdo comun; con dos, centrar todavia funciona, y por eso
            desde `sm` se queda como estaba.

            El hueco hasta la primera pregunta baja de 56 a 32px: eran `mb-14`
            fijos, pensados para el escritorio, y en movil abrian un vacio en
            mitad de la seccion que hacia dudar de si el acordeon pertenecia a
            esta cabecera o era otra cosa.
          */}
          <div className="mb-8 sm:mb-14 sm:text-center">
            <Reveal as="p" className="label-caps mb-4 sm:mb-5">
              Preguntas frecuentes
            </Reveal>
            <Reveal
              as="h2"
              id="faq-title"
              delay={60}
              className="display-section mb-4 text-[32px] sm:mb-6 sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
            >
              ¿Aún tienes dudas?
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
