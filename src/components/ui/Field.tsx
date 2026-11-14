import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useCopy } from "../../i18n/locale";

const OPTIONAL = { es: "(opcional)", en: "(optional)" };

/**
 * Campo de formulario sobre fondo oscuro.
 *
 * La etiqueta es siempre visible. El original de Lovable ya lo hacia bien: rotulo en
 * versales encima del campo, no un placeholder haciendo de etiqueta.
 */

/*
  `text-[16px] sm:text-body`, no `text-body` a secas: Safari en iOS hace zoom
  automatico al enfocar cualquier campo con font-size por debajo de 16px, y el
  cuerpo de texto del sitio son 15px. Ese zoom (que ademas no siempre se deshace
  solo al desenfocar) es la senal mas reconocible de que un formulario "no es"
  nativo. Desde `sm` (640px, fuera del rango de telefono) se recupera la
  densidad de 15px del sistema tipografico.
*/
const shell =
  "w-full rounded-md border border-border bg-background/50 px-4 py-3 text-[16px] sm:text-body text-foreground " +
  "placeholder:text-text-tertiary transition-all " +
  "focus:border-emerald-400 focus:outline-none focus:ring-[3px] focus:ring-emerald-400/20";

function Label({
  htmlFor,
  children,
  optional,
  className,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
  className?: string;
}) {
  const optionalText = useCopy(OPTIONAL);
  return (
    <label htmlFor={htmlFor} className={cn("mb-2 block text-micro uppercase text-text-secondary", className)}>
      {children}
      {optional ? <span className="ml-1 normal-case text-text-tertiary">{optionalText}</span> : null}
    </label>
  );
}

function ErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 text-caption text-danger">
      {message}
    </p>
  );
}

/*
  Reenvia la `ref` al `<input>`. Lo necesita `NumericField`, que reescribe el
  valor del campo en cada pulsacion (para meter los puntos de millar y el simbolo)
  y tiene que volver a colocar el cursor donde estaba. Sin acceso al elemento, el
  cursor salta al final en cuanto alguien edita por el medio.
*/
export const Field = forwardRef<
  HTMLInputElement,
  {
    id: string;
    label: string;
    error?: string;
    optional?: boolean;
    /*
      Rotulo y campo en la MISMA linea en telefono (14/11/2026, para compactar el
      simulador): el rotulo a la izquierda y un campo corto a la derecha. Desde `sm`
      vuelve el apilado de siempre.
    */
    inlineOnMobile?: boolean;
  } & InputHTMLAttributes<HTMLInputElement>
>(function Field({ id, label, error, optional, inlineOnMobile, ...rest }, ref) {
  const errorId = `${id}-error`;
  return (
    <div className={inlineOnMobile ? "flex items-center justify-between gap-3 sm:block" : undefined}>
      <Label htmlFor={id} optional={optional} className={inlineOnMobile ? "mb-0 sm:mb-2" : undefined}>
        {label}
      </Label>
      <input
        {...rest}
        ref={ref}
        id={id}
        name={rest.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          shell,
          "min-h-touch",
          inlineOnMobile && "w-[156px] shrink-0 px-3 py-2 text-right sm:w-full sm:px-4 sm:py-3 sm:text-left",
          error && "border-danger focus:border-danger",
        )}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
});

export function TextareaField({
  id,
  label,
  error,
  optional,
  ...rest
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <textarea
        {...rest}
        id={id}
        name={rest.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(shell, "resize-none", error && "border-danger focus:border-danger")}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}
