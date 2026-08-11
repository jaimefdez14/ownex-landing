import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

/**
 * Campo de formulario sobre fondo oscuro.
 *
 * La etiqueta es siempre visible. El original de Lovable ya lo hacia bien: rotulo en
 * versales encima del campo, no un placeholder haciendo de etiqueta.
 */

const shell =
  "w-full rounded-md border border-border bg-background/50 px-4 py-3 text-body text-foreground " +
  "placeholder:text-text-tertiary transition-all " +
  "focus:border-emerald-400 focus:outline-none focus:ring-[3px] focus:ring-emerald-400/20";

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-micro uppercase text-text-secondary">
      {children}
      {optional ? <span className="ml-1 normal-case text-text-tertiary">(opcional)</span> : null}
    </label>
  );
}

function ErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2 text-caption text-[#FCA5A5]">
      {message}
    </p>
  );
}

export function Field({
  id,
  label,
  error,
  optional,
  ...rest
}: { id: string; label: string; error?: string; optional?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const errorId = `${id}-error`;
  return (
    <div>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>
      <input
        {...rest}
        id={id}
        name={rest.name ?? id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(shell, "min-h-touch", error && "border-[#FCA5A5] focus:border-[#FCA5A5]")}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}

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
        className={cn(shell, "resize-none", error && "border-[#FCA5A5] focus:border-[#FCA5A5]")}
      />
      {error ? <ErrorText id={errorId} message={error} /> : null}
    </div>
  );
}
