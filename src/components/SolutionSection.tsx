import { Building2, Send, Users } from "lucide-react";
import { Reveal } from "./ui/Reveal";
import { useCopy, type Localized } from "../i18n/locale";

/* Los iconos van por posicion, fuera del copy: no cambian con el idioma. */
const blockIcons = [Building2, Send, Users];

const blocksCopy: Localized<{ title: string; desc: string }[]> = {
  es: [
    {
      title: "Estructuración",
      desc: "Montamos la estructura legal y financiera para que tu ronda cumpla los estándares de los reguladores, y tu cap table se mantenga limpio sin complicar futuras rondas.",
    },
    {
      title: "Emisión",
      desc: "Ejecutamos la ronda dirigida a tu comunidad, integrando el proceso end-to-end de la emisión y coordinando con entidades financieras reguladas.",
    },
    {
      title: "Activación",
      desc: "Operamos la relación después del cierre: gestión de accionistas, activación de beneficios, gestión de dividendos y reporting periódico.",
    },
  ],
  en: [
    {
      title: "Structuring",
      desc: "We build the legal and financial structure so your round meets regulatory standards and your cap table stays clean, without complicating future rounds.",
    },
    {
      title: "Issuance",
      desc: "We run the round aimed at your community, covering the issuance process end to end and coordinating with regulated financial entities.",
    },
    {
      title: "Activation",
      desc: "We run the relationship after closing: shareholder management, benefit activation, dividend management and periodic reporting.",
    },
  ],
};

const COPY = {
  es: {
    eyebrow: "Qué es Ownex",
    title: "Todo lo que necesitas para que tus clientes inviertan en tu marca.",
    body: "Plataforma B2B end to end para la co-propiedad: estructuración legal, emisión de acciones fraccionadas y gestión continua de accionistas. Tú te centras en la marca. Nosotros nos encargamos del resto.",
  },
  en: {
    eyebrow: "What Ownex is",
    title: "Everything you need for your customers to invest in your brand.",
    body: "An end-to-end B2B platform for co-ownership: legal structuring, issuance of fractional shares and ongoing shareholder management. You focus on the brand. We take care of the rest.",
  },
};

/**
 * REVISADA EL 27/08/2026. ESTA SECCION ES EL SERVICIO, NO EL PRODUCTO.
 *
 * Se duplicaba con "Como funciona". La tarjeta "Estructuracion" repetia la
 * promesa y las dos pruebas de la fase 01 de aquella seccion (cap table limpio,
 * proxima ronda no se complica), y la tarjeta "Activacion" describia
 * literalmente el Hub del Propietario, que es una PANTALLA y vive alli.
 *
 * El reparto que se acordo con Jaime separa las dos secciones por eje:
 *
 *   Esta          el SERVICIO. Lo que Ownex hace por ti, en orden temporal real.
 *                 Aqui la secuencia si existe, asi que ordenarla es legitimo.
 *   Como funciona el PRODUCTO. Las tres superficies, ordenadas por audiencia.
 *
 * Por eso "Activacion" pasa de describir el hub del accionista a describir lo
 * que HACEMOS despues del cierre. El hub sigue existiendo; se ensena donde toca.
 *
 * PASADA DE COPY 30/08/2026 (redaccion de Jaime). Las dos primeras tarjetas
 * suben el registro hacia el cumplimiento, que es el eje que la seccion no
 * declaraba: "Estructuracion" antepone que la ronda cumpla los estandares de los
 * reguladores y deja el cap table como consecuencia, y "Emision" cambia el
 * "KYC/AML integrado y sin licencia propia" por el proceso completo de la emision
 * y la coordinacion con entidades financieras reguladas. "Activacion" pasa a
 * enumerar las cuatro operaciones del post-cierre (accionistas, beneficios,
 * dividendos, reporting) en vez de mezclar objetos y destinatario.
 *
 * OJO A LA DUPLICACION: "cap table limpio" y "futuras rondas" vuelven a esta
 * tarjeta, que es justo lo que el reparto del 27/08 habia sacado de aqui por
 * repetir la fase 01 de "Como funciona". Ahora no es literal --alli es la promesa,
 * aqui es la consecuencia de cumplir-- pero si vuelve a sonar a lo mismo al
 * leerlas seguidas, la que cede es esta.
 *
 * RETIRADO EL 27/08/2026: `CapTableDiagram` llego a estar aqui unas horas, como
 * prueba del primer paso del servicio. Jaime lo quito: el diagrama de 412 puntos
 * contra tres lineas explicaba la MECANICA del vehiculo, y esta seccion tiene que
 * vender el servicio, no ensenar como esta montado por dentro. El componente
 * entero se borra; vive en el historial si alguna vez hace falta.
 */
export function SolutionSection() {
  const t = useCopy(COPY);
  const blocks = useCopy(blocksCopy);

  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-14 max-w-[800px]">
          <Reveal as="p" className="rule-grow label-caps mb-5">
            {t.eyebrow}
          </Reveal>
          <Reveal
            as="h2"
            id="solution-title"
            delay={60}
            className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            {t.title}
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            {t.body}
          </Reveal>
        </div>

        <ul className="grid gap-3 md:grid-cols-3">
          {blocks.map(({ title, desc }, index) => {
            const Icon = blockIcons[index];
            return (
            <Reveal as="li" key={title} delay={index * 100} className="glass-card glass-card-ambient p-5 md:p-8">
              {/*
                En movil el icono va EN LINEA con el titulo; desde `md` vuelve a
                ir encima. Apilados, icono y titulo se comian unos 50px por
                tarjeta en relleno y hueco vertical sin decir nada mas: son tres
                tarjetas, y en una pantalla de movil eso es media pantalla de
                scroll regalada. En la columna estrecha de `md` no cabe la
                pareja en una linea, asi que ahi se apila como siempre.
              */}
              <div className="mb-3 flex items-center gap-3 md:mb-6 md:block">
                <span className="icon-badge flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-soft md:mb-6">
                  <Icon aria-hidden="true" size={18} className="text-accent-ink" />
                </span>
                <h3 className="text-title leading-tight text-foreground md:mb-3">{title}</h3>
              </div>
              <p className="text-body text-text-secondary">{desc}</p>
            </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
