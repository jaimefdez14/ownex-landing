import type { AccordionItem } from "../components/ui/Accordion";
import type { Localized } from "../i18n/locale";

/**
 * Preguntas frecuentes, tomadas literalmente del proyecto de Lovable salvo en tres
 * puntos:
 *
 *  - La pregunta sobre activos especulativos nombraba dos veces una categoria que el
 *    §0 prohibe mencionar, una en el enunciado y otra para negarla en la respuesta.
 *    Se reformula sin nombrarla: introducir el concepto para desmentirlo es justo lo
 *    que el §0 quiere evitar, porque deja la palabra en la cabeza del lector. Todo
 *    lo demas de esa respuesta queda igual.
 *  - "whitelabel" pasa a "en marca blanca", que es la forma en espanol que fija el
 *    brief. Es el unico anglicismo que se traduce.
 *  - Los importes y porcentajes llevan espacio duro antes del simbolo.
 *
 * DE ONCE A SIETE - 31/08/2026, a peticion de Jaime ("hay muchas FAQ, elimina las
 * menos relevantes tanto para movil como ordenador, o junta varias en una").
 *
 * Once preguntas son 825px de puro renglon antes de abrir ninguna (la cuenta esta
 * en `ui/Accordion.tsx`), y una lista tan larga se deja de leer: quien busca su duda
 * la busca escaneando, y a partir de cierto punto deja de escanear. El recorte no
 * quita informacion, la reagrupa. Tres fusiones y UNA sola baja:
 *
 *   fusion  "¿Que tipo de equity reciben?" + "¿Que dilucion supone?" -> `faq-equity`.
 *           Las dos contestaban lo mismo desde dos lados, y las dos terminaban en la
 *           misma frase ("una sola linea del cap table"): eso repetido dos veces en
 *           una lista de once es lo que hace que parezca que sobran preguntas.
 *
 *   fusion  "¿Que pasa despues de emitir?" -> dentro de `faq-crowdfunding`. La
 *           diferencia con el crowdfunding que esa respuesta ya enunciaba ("la
 *           relacion termina despues de la campana") es EXACTAMENTE lo que la otra
 *           desarrollaba. Estaban contando la misma tesis en dos sitios.
 *
 *   fusion  "¿Necesita la marca licencia?" + "¿Que hace Ownex y que los partners?"
 *           -> `faq-quien-responde`. Las dos son la misma pregunta del fundador:
 *           quien asume la parte regulada y quien responde de que.
 *
 *   baja    "¿Como mejora la retencion y el LTV?" Es la unica que se va entera, y se
 *           va porque no era una duda: era un argumento de venta en una seccion que
 *           se titula "¿Aun tienes dudas?". Ademas ya lo dicen, antes y mejor, la
 *           ficha de Fidelizacion del hero y la seccion de Solucion. Sus dos hechos
 *           propios (el vinculo financiero y la referencia sin comision) viven ahi.
 *
 * Los `id` pasan de correlativos (`faq-1`...`faq-10`) a nombres: con fusiones de por
 * medio, un numero deja de decir nada y ademas miente sobre el orden. No hay enlaces
 * externos a estos identificadores -- solo los usa el propio acordeon para atar
 * boton y panel-- asi que renombrarlos no rompe ninguna URL.
 *
 * RECORTE Y PUESTA AL DIA - 14/11/2026 (revision de la landing aprobada por Jaime).
 * Las respuestas bajan a dos o tres frases y se corrigen contra CONTEXTO-VIVO:
 * emision tipica de 2,5 a 7,5 M EUR, portal del inversor en un subdominio de Ownex
 * con la marca del emisor (ya no "integrado en la web del negocio"), sin "proveedor
 * en marca blanca" y sin prometer liquidez: el mercado secundario sigue abierto con
 * el despacho. Sin dos puntos explicativos.
 *
 * `JsonLd.tsx` genera el `FAQPage` a partir de esta lista, asi que los datos
 * estructurados se recortan solos.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LOS `id` SON LOS MISMOS EN LOS DOS IDIOMAS - 16/09/2026
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Son el identificador que ata boton y panel Y el que viaja en el evento `faq_open`,
 * asi que traducirlos partiria en dos cada embudo de preguntas. El acordeon manda el
 * `id`, no el enunciado (ver `ui/Accordion.tsx`).
 *
 * En la version inglesa se conserva la ADVERTENCIA de vocabulario del §0: la pregunta
 * de los activos especulativos tampoco nombra alli la categoria prohibida, ni para
 * negarla.
 */

const NB = " ";

export const faqItems: Localized<AccordionItem[]> = {
  es: [
    {
      id: "faq-crowdfunding",
      question: "¿Esto es crowdfunding?",
      answer: [
        "No. En una plataforma de crowdfunding tu proyecto compite con miles de otros ante inversores que no te conocen, y la relación termina cuando acaba la campaña.",
        "Con Ownex la ronda se dirige solo a tu comunidad y bajo tu marca. Después del cierre, tus inversores siguen su posición, activan beneficios y participan en las decisiones desde su portal.",
      ],
    },
    {
      id: "faq-equity",
      question: "¿Qué reciben exactamente los clientes? ¿Equity o deuda?",
      answer: [
        "En equity, participan en el capital a través de un vehículo que agrupa a todos en una sola línea de tu cap table. La dilución depende del tamaño de la ronda y de la valoración.",
        "En deuda, prestan a tu negocio a cambio de un cupón y de la devolución del principal al vencimiento. No hay dilución y es una forma de empezar cuando la caja lo permite.",
        "En esta web «accionista» se usa como término divulgativo. La posición jurídica exacta depende de la forma societaria del vehículo.",
      ],
    },
    {
      id: "faq-marcas",
      question: "¿Para qué tipo de negocios está diseñado?",
      answer:
        "Para negocios de consumo con clientes recurrentes, ingresos estables y un plan de crecimiento que requiere capital. Encaja especialmente en centros deportivos y de bienestar, restauración, enseñas de franquicia, hoteles y retail de marca.",
    },
    {
      id: "faq-capital",
      question: "¿Cuánto capital puede levantar un negocio?",
      answer: `Una emisión típica está entre 2,5 y 7,5${NB}M€. El importe lo deciden sobre todo las finanzas de tu negocio, más que el tamaño de tu comunidad. El simulador de esta página te da una primera estimación.`,
    },
    {
      id: "faq-quien-responde",
      question: "¿Necesita el negocio licencia financiera? ¿Quién responde de qué?",
      answer: [
        "No necesitas licencia propia. Tu sociedad emite y responde de la información que da a sus inversores.",
        "Una entidad autorizada (ESI o EAF) valida esa información y supervisa la comercialización, y la entidad del registro (ERIR) inscribe a cada titular. Ownex aporta la plataforma y coordina a todas las partes. No custodia el dinero ni lleva el registro.",
      ],
    },
    {
      id: "faq-especulacion",
      question: "¿Tiene relación con activos especulativos?",
      answer:
        "No. Tus inversores reciben valores de una sociedad real, emitidos con entidades reguladas bajo la ley española. La tecnología se usa para llevar el registro y automatizar el cumplimiento. Hoy no hay cotización ni compraventa diaria de posiciones.",
    },
    {
      id: "faq-coste-plazo",
      question: "¿Cuánto cuesta y cuánto tiempo lleva?",
      answer:
        "De la estructuración a la emisión activa pasan entre 8 y 12 semanas. El coste tiene dos partes. Una son los costes de terceros (abogados, notaría, validación regulatoria y registro), que se pagan antes de captar. La otra es la comisión de Ownex, que solo se cobra al cerrar la ronda. El simulador te da una estimación con tus números.",
    },
  ],
  en: [
    {
      id: "faq-crowdfunding",
      question: "Is this crowdfunding?",
      answer: [
        "No. On a crowdfunding platform your project competes with thousands of others for investors who don't know you, and the relationship ends when the campaign does.",
        "With Ownex the round is aimed only at your community and runs under your brand. After closing, your investors follow their position, activate benefits and take part in decisions from their portal.",
      ],
    },
    {
      id: "faq-equity",
      question: "What exactly do customers receive? Equity or debt?",
      answer: [
        "With equity, they hold a stake through a vehicle that groups everyone into a single line of your cap table. Dilution depends on the size of the round and on the valuation.",
        "With debt, they lend to your business in exchange for a coupon and repayment of the principal at maturity. There is no dilution, and it is a way to start when your cash flow allows it.",
        "This website uses “shareholder” as a plain-language term. The exact legal position depends on the corporate form of the vehicle.",
      ],
    },
    {
      id: "faq-marcas",
      question: "What kind of businesses is it designed for?",
      answer:
        "For consumer businesses with recurring customers, stable revenue and a growth plan that calls for capital. It fits particularly well in sports and wellness centres, restaurants, franchise brands, hotels and branded retail.",
    },
    {
      id: "faq-capital",
      question: "How much capital can a business raise?",
      answer:
        "A typical issuance is between €2.5M and €7.5M. The amount is decided mostly by your business's finances, more than by the size of your community. The simulator on this page gives you a first estimate.",
    },
    {
      id: "faq-quien-responde",
      question: "Does the business need a financial licence? Who is responsible for what?",
      answer: [
        "You need no licence of your own. Your company issues and is responsible for the information it gives its investors.",
        "An authorised firm (ESI or EAF) validates that information and supervises the marketing, and the registry entity (ERIR) records each holder. Ownex provides the platform and coordinates every party. It does not hold the money and does not keep the register.",
      ],
    },
    {
      id: "faq-especulacion",
      question: "Is this related to speculative assets?",
      answer:
        "No. Your investors receive securities in a real company, issued with regulated entities under Spanish law. The technology is used to keep the register and automate compliance. Today there is no listing and no day-to-day trading of positions.",
    },
    {
      id: "faq-coste-plazo",
      question: "How much does it cost and how long does it take?",
      answer:
        "It takes 8 to 12 weeks from structuring to a live issuance. The cost has two parts. One is third-party costs (lawyers, notary, regulatory validation and the register), paid before anything is raised. The other is Ownex's fee, charged only when the round closes. The simulator gives you an estimate with your own numbers.",
    },
  ],
};
