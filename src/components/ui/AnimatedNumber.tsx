import { useRef } from "react";
import { useCountUp } from "../../lib/useCountUp";

/**
 * Cifra con conteo ascendente. Renderiza `format(value)` como hijo de React: es el
 * mismo texto en el servidor, en la hidratacion y sin JavaScript. La animacion es
 * una capa imperativa que se añade despues, nunca una condicion que haya que
 * cumplir para leer la cifra real.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  /*
    `false` para cifras que ya son correctas al cargar y solo deben moverse
    cuando el visitante las cambia (el cebo del hero). Ver `useCountUp`.
  */
  animateOnMount = true,
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
  animateOnMount?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value, format, undefined, animateOnMount);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
