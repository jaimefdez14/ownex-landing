import { Building2, Send, Users } from "lucide-react";
import { Reveal } from "./ui/Reveal";

const blocks = [
  {
    icon: Building2,
    title: "Estructuración",
    desc: "Montamos la estructura legal y financiera para que tu cap table se mantenga limpio y tu próxima ronda no se complique.",
  },
  {
    icon: Send,
    title: "Emisión",
    desc: "Ejecutamos la ronda dirigida a tu comunidad, con KYC/AML integrado y sin que necesites licencia propia.",
  },
  {
    icon: Users,
    title: "Activación",
    desc: "Operamos la relación después del cierre: registro al día, beneficios, juntas y reporting periódico a tus accionistas.",
  },
];

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
 * RETIRADO EL MISMO DIA: `CapTableDiagram` llego a estar aqui unas horas, como
 * prueba del primer paso del servicio. Jaime lo quito: el diagrama de 412 puntos
 * contra tres lineas explicaba la MECANICA del vehiculo, y esta seccion tiene que
 * vender el servicio, no ensenar como esta montado por dentro. El componente
 * entero se borra; vive en el historial si alguna vez hace falta.
 */
export function SolutionSection() {
  return (
    <section
      id="solution"
      aria-labelledby="solution-title"
      className="section-padding bg-background theme-light"
    >
      <div className="shell">
        <div className="mb-14 max-w-[800px]">
          <Reveal as="p" className="rule-grow label-caps mb-5">
            Qué es Ownex
          </Reveal>
          <Reveal
            as="h2"
            id="solution-title"
            delay={60}
            className="text-rise display-section mb-8 text-[32px] sm:text-display text-foreground md:text-display-lg lg:text-[64px]"
          >
            Todo lo que necesitas para que tus clientes inviertan en tu marca.
          </Reveal>
          <Reveal as="p" delay={120} className="max-w-reading text-body-lg text-text-secondary">
            Plataforma B2B end to end para la co-propiedad: estructuración legal, emisión de acciones
            fraccionadas y gestión continua de accionistas. Tú te centras en la marca. Nosotros nos
            encargamos del resto.
          </Reveal>
        </div>

        <ul className="grid gap-3 md:grid-cols-3">
          {blocks.map(({ icon: Icon, title, desc }, index) => (
            <Reveal as="li" key={title} delay={index * 100} className="glass-card p-5 md:p-8">
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
          ))}
        </ul>
      </div>
    </section>
  );
}
