import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Sustituto de los `motion.div` del proyecto de Lovable.
 *
 * Reproduce el mismo gesto (desvanecido con 32px de desplazamiento, easing suave,
 * escalonado por indice) sin framer-motion y sin romper la lectura sin JavaScript.
 *
 * El original usaba `initial={{ opacity: 0, y: 32 }}`, que framer-motion escribe
 * como estilo en linea desde el primer render: sin JavaScript la pagina entera se
 * servia invisible. Aqui el estado base es visible y el oculto solo existe bajo
 * `html.js`, asi que el fallo no puede darse.
 *
 * `delay` va en milisegundos y equivale al `delay: i * 0.1` del original.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const style = delay > 0 ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  return (
    <Tag className={cn("reveal", className)} style={style} {...rest}>
      {children}
    </Tag>
  );
}
