import type { AccordionItem } from "../components/ui/Accordion";

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
 * `JsonLd.tsx` genera el `FAQPage` a partir de esta lista, asi que los datos
 * estructurados se recortan solos.
 */

const NB = " ";

export const faqItems: AccordionItem[] = [
  {
    id: "faq-crowdfunding",
    question: "¿Esto es crowdfunding?",
    answer: [
      "No. El crowdfunding tradicional opera a través de plataformas genéricas donde el proyecto compite por atención con miles de otros: la emisión es masiva, la experiencia está desconectada de la marca y la relación con el inversor termina cuando acaba la campaña. Ownex estructura rondas de equity dirigidas exclusivamente a la comunidad de la propia marca. La emisión se realiza vía SPV, coordinada con entidades reguladas, y no hay plataforma intermediaria: el capital viene de personas que ya conocen y usan el producto.",
      "Y ahí es donde falla la mayoría de plataformas de emisión: emiten y desaparecen. Ownex opera el Hub del Propietario, integrado en la web de la marca, donde los accionistas gestionan su participación, reciben actualizaciones, activan beneficios exclusivos y participan en decisiones. La emisión es el principio de la relación, no el final.",
    ],
  },
  {
    id: "faq-equity",
    question: "¿Qué reciben exactamente los clientes y qué dilución supone?",
    answer: [
      "Participaciones en un SPV (sociedad vehículo) que posee una participación minoritaria en la empresa operadora. Es equity real, con derechos económicos y, según la estructura, derechos de voto limitados. En esta web se usa «accionista» como término divulgativo; jurídicamente la posición es la de socio o partícipe del vehículo, según su forma societaria.",
      "La dilución depende del tamaño de la ronda y de la valoración acordada en cada caso, y la cifra concreta se calcula sobre los números de tu marca. Lo que no cambia es la forma: el SPV agrega a todos los accionistas en una sola línea del cap table, así que la estructura no se complica por el número de inversores y la tabla de capitalización se mantiene limpia y compatible con futuras rondas de VC o procesos de exit.",
    ],
  },
  {
    id: "faq-marcas",
    question: "¿Para qué tipo de marcas está diseñado?",
    answer:
      "Para marcas de consumo con clientes recurrentes y una comunidad activa. Funciona especialmente bien en moda, streetwear, restauración, gimnasios, deporte, lifestyle y retail. Sectores donde la relación cliente marca ya es fuerte y el capital de expansión puede venir de la propia base.",
  },
  {
    id: "faq-capital",
    question: "¿Cuánto capital puede levantar una marca?",
    answer: `Las emisiones típicas oscilan entre 100.000${NB}€ y 1.000.000${NB}€, dependiendo del tamaño de la comunidad, el ticket medio por inversor, y la valoración de la empresa. Para marcas con comunidades más grandes, emisiones superiores son posibles dentro del mismo marco regulatorio.`,
  },
  {
    id: "faq-quien-responde",
    question: "¿Necesita la marca licencia financiera? ¿Quién responde de qué?",
    answer: [
      "La marca no necesita licencia propia. Ownex coordina cada emisión con entidades de servicios de inversión autorizadas (ESI) o entidades registradas (ERIR), y la supervisión regulatoria recae en ellas.",
      "El reparto es este: Ownex diseña la estructura de equity, construye el Hub del Propietario y gestiona la activación de accionistas; los partners regulados (ESI/ERIR) supervisan la emisión y el cumplimiento normativo; la infraestructura de registro y emisión la proporciona un proveedor en marca blanca integrado en el sistema. Ownex es el arquitecto y operador, los partners regulados son los supervisores, y la tecnología es la infraestructura invisible.",
    ],
  },
  {
    id: "faq-especulacion",
    question: "¿Tiene relación con activos especulativos?",
    answer:
      "No. Las participaciones representan equity real en un SPV regulado, y hoy no hay mercado secundario abierto ni cotización: nadie compra y vende posiciones a diario. La infraestructura digital se usa para registro (cap table digital, trazabilidad, automatización de cumplimiento normativo), no para especulación. El régimen piloto europeo (Reglamento (UE) 2022/858) sí habilita infraestructuras de mercado secundario para valores digitales, y es hacia donde apunta la liquidez del accionista a medio plazo, siempre dentro de ese marco supervisado.",
  },
  {
    id: "faq-coste-plazo",
    question: "¿Cuánto cuesta y cuánto tiempo lleva?",
    answer:
      "El proceso completo, desde estructuración legal hasta emisión activa, tarda entre 8 y 12 semanas. El coste tiene dos partes: unos costes fijos que se pagan a terceros (abogados, constitución del vehículo y notaría, validación regulatoria y alta en el registro digital) y que se incurren antes de captar nada, y una comisión de éxito de Ownex que solo se cobra al cerrar la ronda. El simulador de esta página te da una estimación con tus propios números, y el desglose completo te lo enviamos por correo o lo repasamos en la llamada.",
  },
];
