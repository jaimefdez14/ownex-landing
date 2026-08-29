import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { track } from "../../lib/analytics";

export type AccordionItem = {
  id: string;
  question: string;
  answer: string;
};

/**
 * Acordeon accesible.
 *
 * El original usaba el de shadcn/ui, que desmonta el contenido al cerrarlo. Aqui la
 * respuesta permanece siempre en el DOM y solo se pliega con CSS bajo `html.js`, por
 * dos motivos: es contenido indexable, y sin JavaScript no habria forma de abrir
 * ninguna pregunta, asi que las diez se sirven abiertas y legibles.
 */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [interacted, setInteracted] = useState(false);

  const toggle = (item: AccordionItem) => {
    setInteracted(true);
    setOpenId((current) => {
      const next = current === item.id ? null : item.id;
      if (next === item.id) track("faq_open", { question: item.question });
      return next;
    });
  };

  return (
    <div className="border-y border-border">
      {items.map((item, index) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className={cn(index > 0 && "border-t border-border")}>
            <h3>
              <button
                type="button"
                id={`${item.id}-trigger`}
                aria-expanded={open}
                aria-controls={`${item.id}-panel`}
                onClick={() => toggle(item)}
                /*
                  `py-5` en telefono y `py-6` desde `sm`. Con `py-6` fijos, una
                  pregunta de una linea ocupaba 75px y once preguntas se iban a
                  825px de puro renglon; a `py-5` bajan a 67px sin acercarse
                  siquiera al minimo pulsable (`min-h-touch` son 44px y lo garantiza
                  la propia clase, no el relleno).
                */
                className="flex w-full min-h-touch items-center justify-between gap-4 py-5 text-left text-body-lg font-medium text-foreground transition-colors hover:text-emerald-400 sm:gap-6 sm:py-6"
              >
                <span>{item.question}</span>
                <ChevronDown
                  aria-hidden="true"
                  size={18}
                  className={cn(
                    "shrink-0 text-text-tertiary transition-transform duration-200 motion-reduce:transition-none",
                    open && "rotate-180",
                  )}
                />
              </button>
            </h3>

            <div
              id={`${item.id}-panel`}
              role="region"
              aria-labelledby={`${item.id}-trigger`}
              data-open={open ? "true" : "false"}
              data-animate={interacted ? "true" : "false"}
              className="acc-panel"
            >
              <div>
                <p className="pb-5 pr-2 text-body leading-[1.7] text-text-secondary sm:pb-6 sm:pr-8">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
