import { useRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Control segmentado con pastilla deslizante: elige UNA opcion entre varias y la
 * marca moviendo un relleno de acento por debajo de los rotulos.
 *
 * NUEVO EL 04/09/2026, para el conmutador equity / deuda del simulador (§2.4).
 *
 * POR QUE NO ES UN `<select>` NI DOS BOTONES SUELTOS. Lo que se elige aqui cambia
 * la mitad de la pantalla: que se pregunta, que se responde y que dibuja el
 * grafico. Un desplegable esconde la segunda opcion detras de un toque, y con dos
 * opciones esconder una es esconder la comparacion, que es justo lo que esta
 * seccion quiere ensenar. Con la pastilla, las dos alternativas estan siempre a la
 * vista y el gesto de pasar de una a otra ES la comparacion.
 *
 * SEMANTICA: `radiogroup` con `radio` dentro, no `tablist`. Lo que hay debajo no
 * son dos paneles de contenido distinto, es un solo formulario cuyos supuestos
 * cambian: esto elige un valor, y eso es un grupo de opciones excluyentes. Trae lo
 * que ese patron exige y que un `aria-pressed` no da: `tabindex` movil (solo la
 * opcion activa entra en el orden de tabulacion, asi que el grupo entero es UNA
 * parada) y flechas para cambiar de opcion sin salir del grupo.
 *
 * LA PASTILLA ES UN ELEMENTO APARTE, no el fondo del boton activo. Un fondo que
 * aparece y desaparece no se puede animar entre dos posiciones; un solo elemento
 * que se desplaza, si. Va detras de los rotulos (`absolute` primero en el DOM, los
 * botones con `relative`) y `aria-hidden`, porque lo que dice ya lo dice el
 * `aria-checked` de la opcion.
 *
 * Con movimiento reducido la pastilla deja de deslizarse y salta: se llega igual
 * de informado a las dos opciones, sin recorrido.
 */

export type ModeOption<T extends string> = {
  value: T;
  label: string;
};

export function ModeSwitch<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: ModeOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.findIndex((option) => option.value === value));

  /*
    Flechas: mueven la seleccion Y el foco, que es lo que pide el patron. Vertical
    y horizontal hacen lo mismo a proposito, porque el control es una fila en
    escritorio pero se lee como una eleccion de dos, no como una barra.
  */
  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const paso =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (paso === 0) return;

    event.preventDefault();
    const siguiente = (index + paso + options.length) % options.length;
    onChange(options[siguiente].value);
    refs.current[siguiente]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "relative grid w-full rounded-full border border-border bg-card-hover p-1 sm:w-auto",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-accent-soft transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />

      {options.map((option, i) => {
        const activa = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            tabIndex={activa ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={onKeyDown}
            className={cn(
              "relative z-10 min-h-touch rounded-full px-6 text-label transition-colors",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-emerald-400/40",
              activa ? "text-on-accent-soft" : "text-text-secondary hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
