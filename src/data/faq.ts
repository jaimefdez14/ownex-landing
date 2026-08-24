import type { AccordionItem } from "../components/ui/Accordion";

/**
 * Preguntas frecuentes, tomadas literalmente del proyecto de Lovable salvo en tres
 * puntos:
 *
 *  - La pregunta 7 nombraba dos veces una categoria de activos que el §0 prohibe
 *    mencionar, una en el enunciado y otra para negarla en la respuesta. Se
 *    reformula sin nombrarla: introducir el concepto para desmentirlo es justo lo
 *    que el §0 quiere evitar, porque deja la palabra en la cabeza del lector. Todo
 *    lo demas de esa respuesta queda igual.
 *  - "whitelabel" pasa a "en marca blanca", que es la forma en espanol que fija el
 *    brief. Es el unico anglicismo que se traduce.
 *  - Los importes y porcentajes llevan espacio duro antes del simbolo.
 */

const NB = " ";

export const faqItems: AccordionItem[] = [
  {
    id: "faq-1",
    question: "¿Esto es crowdfunding?",
    answer:
      "No. El crowdfunding tradicional opera a través de plataformas genéricas donde el proyecto compite por atención con miles de otros. La emisión es masiva, la relación con el inversor termina después de la campaña, y la experiencia está desconectada de la marca. Ownex estructura rondas de equity dirigidas exclusivamente a la comunidad de la propia marca. La emisión se realiza vía SPV, coordinada con entidades reguladas, y el accionista accede a un Hub del Propietario integrado en la web de la marca. No hay plataforma intermediaria. El capital viene de personas que ya conocen y usan el producto.",
  },
  {
    id: "faq-2",
    question: "¿Qué tipo de equity reciben los clientes?",
    answer:
      "Participaciones en un SPV (sociedad vehículo) que posee una participación minoritaria en la empresa operadora. Es equity real, con derechos económicos y, según la estructura, derechos de voto limitados. El SPV agrega a todos los accionistas en una sola línea del cap table. Esto mantiene la tabla de capitalización limpia y compatible con futuras rondas de VC o procesos de exit. En esta web se usa «accionista» como término divulgativo; jurídicamente la posición es la de socio o partícipe del vehículo, según su forma societaria.",
  },
  {
    id: "faq-dilucion",
    question: "¿Qué dilución supone?",
    answer:
      "Depende del tamaño de la ronda y de la valoración acordada en cada caso. Lo que no cambia es la forma: todos los accionistas entran agrupados en una sola línea del cap table a través del SPV, así que la estructura no se complica por el número de inversores. La cifra concreta se calcula sobre los números de tu marca.",
  },
  {
    id: "faq-3",
    question: "¿Para qué tipo de marcas está diseñado?",
    answer:
      "Para marcas de consumo con clientes recurrentes y una comunidad activa. Funciona especialmente bien en moda, streetwear, restauración, gimnasios, deporte, lifestyle y retail. Sectores donde la relación cliente marca ya es fuerte y el capital de expansión puede venir de la propia base.",
  },
  {
    id: "faq-4",
    question: "¿Cuánto capital puede levantar una marca?",
    answer: `Las emisiones típicas oscilan entre 100.000${NB}€ y 1.000.000${NB}€, dependiendo del tamaño de la comunidad, el ticket medio por inversor, y la valoración de la empresa. Para marcas con comunidades más grandes, emisiones superiores son posibles dentro del mismo marco regulatorio.`,
  },
  {
    id: "faq-5",
    question: "¿La marca necesita su propia licencia financiera?",
    answer:
      "No. Ownex coordina cada emisión con entidades de servicios de inversión autorizadas (ESI) o entidades registradas (ERIR). La marca no necesita licencia propia. La supervisión regulatoria recae en las entidades coordinadoras.",
  },
  {
    id: "faq-6",
    question: "¿Qué pasa después de emitir el equity?",
    answer:
      "Aquí es donde la mayoría de plataformas de emisión fallan: emiten y desaparecen. Ownex opera el Hub del Propietario: los accionistas gestionan su participación, reciben actualizaciones de la marca, activan beneficios exclusivos y participan en decisiones. La emisión es el principio de la relación, no el final.",
  },
  {
    id: "faq-7",
    question: "¿Tiene relación con activos especulativos?",
    answer:
      "No. Las participaciones representan equity real en un SPV regulado, y hoy no hay mercado secundario abierto ni cotización: nadie compra y vende posiciones a diario. La infraestructura digital se usa para registro (cap table digital, trazabilidad, automatización de cumplimiento normativo), no para especulación. El régimen piloto europeo (Reglamento (UE) 2022/858) sí habilita infraestructuras de mercado secundario para valores digitales, y es hacia donde apunta la liquidez del accionista a medio plazo, siempre dentro de ese marco supervisado.",
  },
  {
    id: "faq-8",
    question: "¿Cómo mejora la retención y el LTV?",
    answer: `Un cliente que posee equity en tu marca no se va al competidor por un 10${NB}% de descuento. La propiedad crea un vínculo financiero: si la marca crece, el accionista se beneficia. Esto convierte la retención en un efecto estructural del modelo, no en un coste de marketing. Los accionistas refieren de forma natural. No porque les pagues una comisión, sino porque el crecimiento de la marca les beneficia directamente.`,
  },
  {
    id: "faq-9",
    question: "¿Qué hace Ownex y qué hacen los partners?",
    answer:
      "Ownex diseña la estructura de equity, construye el Hub del Propietario, y gestiona la activación de accionistas. Los partners regulados (ESI/ERIR) supervisan la emisión y el cumplimiento normativo. La infraestructura de registro y emisión la proporciona un proveedor en marca blanca integrado en el sistema. Ownex es el arquitecto y operador. Los partners regulados son los supervisores. La tecnología es la infraestructura invisible.",
  },
  {
    id: "faq-10",
    question: "¿Cuánto cuesta y cuánto tiempo lleva?",
    answer:
      "El proceso completo, desde estructuración legal hasta emisión activa, tarda entre 8 y 12 semanas. El coste tiene dos partes: unos costes fijos que se pagan a terceros (abogados, constitución del vehículo y notaría, validación regulatoria y alta en el registro digital) y que se incurren antes de captar nada, y una comisión de éxito de Ownex que solo se cobra al cerrar la ronda. El simulador de esta página te da una estimación con tus propios números, y el desglose completo te lo enviamos por correo o lo repasamos en la llamada.",
  },
];
