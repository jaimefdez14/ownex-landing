import { BadgeCheck, BookOpenCheck, Landmark, ShieldCheck, type LucideIcon } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { SwipeRow, SWIPE_ITEM } from "./ui/SwipeRow";
import { useCopy, type Localized } from "../i18n/locale";

/**
 * Marco regulatorio: cuatro garantias, cada una con su como.
 *
 * TERCER ENFOQUE DEL 14/11/2026, y el que queda (decidido con Jaime).
 *
 *   Normas      el original. Tres fichas de leyes: decia bajo que norma se opera, pero
 *               no que gana el fundador con ello.
 *   Diagrama    cinco actores en fila. Exacto, pero contaba el proceso desde dentro y
 *               repetia las fases de "Que es Ownex". A un fundador le transmitia
 *               tramite, no tranquilidad.
 *   Garantias   este. Quien lee es el fundador, el CEO, el director financiero o el
 *               de marketing, y lo que quiere saber es si puede hacerlo sin riesgo
 *               para su negocio y para sus clientes. Cada ficha AFIRMA una garantia
 *               y debajo cuenta COMO se cumple: quien lo hace y bajo que norma. Las
 *               normas y los actores son la prueba, no el titular.
 *
 * DE DONDE SALE CADA "COMO". Del proceso canonico del producto (`src/lib/process.ts`
 * en el repo de la plataforma, verificado contra el BOE el 10/07/2026):
 *
 *   Sin licencia     el emisor emite al amparo de la Ley 6/2023 y designa a la ERIR.
 *                    Las funciones reguladas las prestan entidades autorizadas.
 *   Informacion      la entidad autorizada (ESI o EAF) valida la informacion a
 *                    entregar a los inversores y supervisa la comercializacion
 *                    (art. 36, apartado 1, Ley 6/2023).
 *   Registro         la ERIR, cuya designacion consta en la CNMV, lleva el registro,
 *                    inscribe a cada titular y expide los certificados de
 *                    legitimacion (arts. 8 y 14 Ley 6/2023; RD 814/2023).
 *   Dinero           el inversor se identifica (Ley 10/2010) y paga a la cuenta del
 *                    emisor. Ownex no custodia fondos (DECISIONES, 13/09 y 09/10/2026).
 *
 * Los articulos van sin apartado ("art. 36" y no el apartado primero) porque el
 * guardian de copy trata el punto como un decimal.
 *
 * No se habla de mercado secundario ni de liquidez: sigue abierto con el despacho.
 *
 * En telefono las fichas son una fila deslizable (`SwipeRow`).
 */

const ICONS: LucideIcon[] = [ShieldCheck, BadgeCheck, BookOpenCheck, Landmark];

type Guarantee = { title: string; how: string; ref: string };

const guaranteesCopy: Localized<Guarantee[]> = {
  es: [
    {
      title: "Emites sin licencia propia",
      how: "Tu sociedad emite sus valores al amparo de la ley española. Las funciones reguladas las prestan entidades autorizadas, y Ownex las coordina.",
      ref: "Ley 6/2023 (LMVSI)",
    },
    {
      title: "Tus clientes invierten con información validada",
      how: "Una entidad autorizada, ESI o EAF, valida el Documento de Oferta antes de abrir la ronda y supervisa cómo se comercializa.",
      ref: "Ley 6/2023, art. 36",
    },
    {
      title: "La propiedad de cada inversor consta en un registro",
      how: "Una entidad del registro (ERIR), cuya designación consta en la CNMV, inscribe a cada titular y expide su certificado de legitimación.",
      ref: "Ley 6/2023, arts. 8 y 14",
    },
    {
      title: "El dinero llega directo a tu cuenta",
      how: "Cada inversor verifica su identidad y paga a la cuenta de tu emisión. Ownex no custodia fondos en ningún momento.",
      ref: "Ley 10/2010",
    },
  ],
  en: [
    {
      title: "You issue with no licence of your own",
      how: "Your company issues its securities under Spanish law. The regulated functions are carried out by authorised entities, and Ownex coordinates them.",
      ref: "Law 6/2023 (LMVSI)",
    },
    {
      title: "Your customers invest with validated information",
      how: "An authorised firm, an ESI or an EAF, validates the Offering Document before the round opens and supervises how it is marketed.",
      ref: "Law 6/2023, art. 36",
    },
    {
      title: "Each investor's ownership is on a register",
      how: "A registry entity (ERIR), whose appointment is on record at the CNMV, records each holder and issues their legitimation certificate.",
      ref: "Law 6/2023, arts. 8 and 14",
    },
    {
      title: "The money goes straight to your account",
      how: "Each investor verifies their identity and pays into your issuance account. Ownex never holds funds.",
      ref: "Law 10/2010",
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "Marco regulatorio",
    title: "Cada emisión cumple con la normativa española de valores.",
    body: "Emites bajo la ley española de valores, con una entidad autorizada en cada función regulada. Ownex aporta la plataforma y las coordina.",
    listLabel: "Garantías de una emisión con Ownex",
    normsLabel: "Normas aplicables",
    norms: ["Ley 6/2023 (LMVSI)", "Real Decreto 814/2023", "Ley 10/2010"],
  },
  en: {
    eyebrow: "Regulatory framework",
    title: "Every issuance complies with Spanish securities regulation.",
    body: "You issue under Spanish securities law, with an authorised entity in every regulated function. Ownex provides the platform and coordinates them.",
    listLabel: "Guarantees of an issuance with Ownex",
    normsLabel: "Applicable rules",
    norms: ["Law 6/2023 (LMVSI)", "Royal Decree 814/2023", "Law 10/2010"],
  },
};

export function RegulationSection() {
  const t = useCopy(COPY);
  const guarantees = useCopy(guaranteesCopy);

  return (
    <section
      id="regulation"
      aria-labelledby="regulation-title"
      className="section-padding spotlight bg-background theme-light-alt"
    >
      <div className="shell">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <Reveal as="p" className="rule-grow label-caps mb-4 sm:mb-5">
              {t.eyebrow}
            </Reveal>
            <Reveal
              as="h2"
              id="regulation-title"
              delay={60}
              className="text-rise display-section mb-4 text-[32px] sm:mb-8 sm:text-display text-foreground lg:text-[52px]"
            >
              {t.title}
            </Reveal>
            <Reveal as="p" delay={120} className="text-body text-text-secondary sm:text-body-lg">
              {t.body}
            </Reveal>
            <Reveal delay={180}>
              <ul aria-label={t.normsLabel} className="mt-6 flex flex-wrap gap-2">
                {t.norms.map((norm) => (
                  <li
                    key={norm}
                    className="inline-flex rounded-full bg-card px-3 py-1 text-micro uppercase text-text-secondary"
                  >
                    {norm}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={100} className="min-w-0">
            <SwipeRow
              label={t.listLabel}
              count={guarantees.length}
              className="stagger-children md:grid md:grid-cols-2 md:gap-4"
            >
              {guarantees.map(({ title, how, ref }, index) => {
                const Icon = ICONS[index];
                return (
                  <li key={title} className={`glass-card glass-card-ambient flex flex-col p-5 sm:p-6 ${SWIPE_ITEM}`}>
                    <span className="icon-badge mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft">
                      <Icon aria-hidden="true" size={18} className="text-accent-ink" />
                    </span>
                    <h3 className="mb-2 text-title leading-tight text-foreground">{title}</h3>
                    <p className="text-body text-text-secondary">{how}</p>
                    <p className="mt-auto pt-4 text-micro uppercase text-text-tertiary">{ref}</p>
                  </li>
                );
              })}
            </SwipeRow>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
