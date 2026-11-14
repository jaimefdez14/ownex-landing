import { Reveal } from "./ui/Reveal";
import { SwipeRow, SWIPE_ITEM } from "./ui/SwipeRow";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * "Que es Ownex": la definicion y el servicio, fase a fase.
 *
 * VUELVE EL 14/11/2026, el mismo dia que se habia fundido con "Como funciona". Jaime
 * lo paro: sin esta seccion la pagina no decia en ningun sitio que es Ownex, y la
 * linea de tiempo de tres pasos que la sustituia dejaba un hueco entre la primera
 * semana y la apertura y contaba poco de lo que se hace.
 *
 * Se recupera el reparto acordado el 27/08/2026:
 *
 *   Esta          el SERVICIO. Lo que Ownex hace, en orden temporal real.
 *   Como funciona el PRODUCTO. Las tres pantallas, ordenadas por audiencia.
 *
 * Las cinco fases salen del plan de la emision de la plataforma
 * (`docs/PLAN-DE-EMISION.md` en el repo del producto): encaje, estructura legal,
 * validacion y registro, captacion y operacion. Cada una dice que se hace y que
 * queda hecho al terminar.
 *
 * SIN SEMANAS POR FASE, a proposito. La primera version les ponia fechas ("Semana 1",
 * "Semanas 8 a 12") que no salian de ninguna fuente. El reparto real depende del
 * despacho y del expediente de la entidad del registro, asi que aqui las fases van
 * numeradas y el plazo total se queda donde ya estaba, en la banda de cifras.
 *
 * La linea se rellena con el scroll (`.timeline` en `index.css`) y solo existe desde
 * `lg`. Por debajo las fases son tarjetas: en telefono, una fila deslizable
 * (`SwipeRow`), porque apiladas eran 1.470px, y en tableta una reticula de dos.
 */

type Phase = { title: string; desc: string; result: string };

const phasesCopy: Localized<Phase[]> = {
  es: [
    {
      title: "Encaje y diseño de la ronda",
      desc: "Analizamos las finanzas de tu negocio y el tamaño de tu comunidad. Contigo definimos el instrumento, el importe y las condiciones para el inversor.",
      result: "Condiciones de la ronda acordadas",
    },
    {
      title: "Estructura legal",
      desc: "Coordinamos al despacho, a la entidad autorizada y a la entidad del registro. Se preparan el acuerdo de emisión, el vehículo si es equity y el Documento de Oferta.",
      result: "Documentación de la emisión lista",
    },
    {
      title: "Validación y registro",
      desc: "La entidad autorizada valida la información al inversor. La emisión se eleva a escritura ante notario, se inscribe en el registro y se tokeniza.",
      result: "Emisión validada, escriturada e inscrita",
    },
    {
      title: "Captación",
      desc: "Lanzamos tu portal con tu marca, tus niveles y tus beneficios. Tu comunidad verifica su identidad, firma y paga desde su banco, y tú sigues la ronda al día.",
      result: "Ronda cerrada y fondos en tu cuenta",
    },
    {
      title: "Relación con tus inversores",
      desc: "Cada inversor queda inscrito como titular. Desde ahí operamos la relación con beneficios, comunicaciones, juntas, pagos de dividendos o cupones e informes.",
      result: "Una comunidad de propietarios activa",
    },
  ],
  en: [
    {
      title: "Fit and round design",
      desc: "We analyse your business's finances and the size of your community. With you we define the instrument, the amount and the terms for the investor.",
      result: "Round terms agreed",
    },
    {
      title: "Legal structure",
      desc: "We coordinate the law firm, the authorised firm and the registry entity. The issuance resolution, the vehicle if it is equity and the Offering Document are prepared.",
      result: "Issuance documentation ready",
    },
    {
      title: "Validation and registration",
      desc: "The authorised firm validates the investor information. The issuance is executed as a public deed before a notary, recorded in the register and tokenised.",
      result: "Issuance validated, notarised and recorded",
    },
    {
      title: "Offering",
      desc: "We launch your portal with your brand, your tiers and your benefits. Your community verifies its identity, signs and pays from its bank, and you follow the round day by day.",
      result: "Round closed and funds in your account",
    },
    {
      title: "Investor relationship",
      desc: "Each investor is recorded as a holder. From there we run the relationship with benefits, communications, meetings, dividend or coupon payments and reports.",
      result: "An active community of owners",
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "Qué es Ownex",
    title: "Todo lo que necesitas para que tu comunidad invierta en tu negocio.",
    body: "Ownex es la plataforma con la que un negocio de consumo abre su capital a sus clientes. Nos encargamos de la emisión de principio a fin y de la relación con tus inversores después del cierre.",
    listLabel: "Las cinco fases de una emisión con Ownex",
    resultLabel: "Al terminar",
  },
  en: {
    eyebrow: "What Ownex is",
    title: "Everything you need for your community to invest in your business.",
    body: "Ownex is the platform a consumer business uses to open its capital to its customers. We take care of the issuance from start to finish and of the relationship with your investors after closing.",
    listLabel: "The five phases of an issuance with Ownex",
    resultLabel: "When it ends",
  },
};

export function SolutionSection() {
  const t = useCopy(COPY);
  const phases = useCopy(phasesCopy);

  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-10 max-w-[800px] sm:mb-14">
          <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="solution-title"
            delay={60}
            className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground md:text-display-lg lg:text-[56px]"
          >
            {t.title}
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body text-text-secondary sm:text-body-lg">
            {t.body}
          </Reveal>
        </div>

        <Reveal>
          <SwipeRow
            label={t.listLabel}
            count={phases.length}
            className="timeline md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-5 lg:gap-7"
          >
            {phases.map(({ title, desc, result }, index) => (
              <li
                key={title}
                className={`timeline-step flex flex-col max-lg:glass-card max-lg:p-5 ${SWIPE_ITEM}`}
              >
                <span aria-hidden="true" className="timeline-dot" />
                <p aria-hidden="true" className="label-caps mb-2 tabular">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mb-2 text-title leading-tight text-foreground">{title}</h3>
                <p className="text-caption-lg leading-relaxed text-text-secondary">{desc}</p>
                <p className="mt-auto pt-4 text-caption text-text-secondary">
                  <span className="block text-micro uppercase text-text-tertiary">{t.resultLabel}</span>
                  <span className="font-medium text-foreground">{result}</span>
                </p>
              </li>
            ))}
          </SwipeRow>
        </Reveal>
      </div>
    </section>
  );
}
