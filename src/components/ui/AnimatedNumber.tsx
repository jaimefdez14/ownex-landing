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
}: {
  value: number;
  format: (value: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useCountUp(ref, value, format);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
