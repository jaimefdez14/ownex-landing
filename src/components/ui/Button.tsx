import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

/**
 * Botones de la v2, equivalentes a las variantes `cta`, `cta-outline` y `secondary`
 * del proyecto de Lovable (cuyo `button.tsx` no llego, asi que estan reconstruidas
 * a partir de su uso).
 *
 * `cta` es esmeralda solido con texto casi negro: sobre #34D399 el texto oscuro da
 * 10:1, mientras que el blanco se quedaria en 1,8:1, que es ilegible. El original no
 * definia el color de texto en el codigo que me pasaste, asi que se elige el unico
 * que cumple contraste.
 */

type Variant = "cta" | "cta-outline" | "secondary" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 " +
  "active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 " +
  "motion-reduce:transform-none motion-reduce:transition-none";

const sizes: Record<Size, string> = {
  sm: "min-h-touch px-4 text-label",
  md: "min-h-touch px-5 text-label",
  lg: "min-h-[52px] px-6 text-body",
};

/*
  `cta` lleva un resplandor esmeralda permanente que se intensifica y la tarjeta se
  eleva un poco al pasar el cursor: es el unico boton solido de la paleta, asi que
  es tambien el unico que se permite este acento. Los otros dos (`cta-outline`,
  `secondary`) se quedan con el cambio de borde de siempre, para no competir con el.
*/
const variants: Record<Variant, string> = {
  cta:
    "bg-emerald-400 text-on-accent shadow-[0_6px_24px_-10px_rgba(52,211,153,0.45)] " +
    "hover:-translate-y-[2px] hover:bg-emerald-300 hover:shadow-[0_10px_32px_-8px_rgba(52,211,153,0.6)]",
  "cta-outline": "border border-border text-foreground hover:border-emerald-400/40 hover:bg-card",
  secondary: "border border-border bg-card/60 text-foreground hover:border-emerald-400/40",
  /*
    `quiet`: el mismo boton sin marco ni fondo, o sea con aspecto de enlace.

    NUEVA EL 29/08/2026 para la barra de navegacion sobre el hero (ver `Navbar`).
    Es una VARIANTE y no un puñado de clases sueltas encima de `secondary` porque
    dos utilidades de Tailwind para la misma propiedad (`border-border` y
    `border-transparent`) no se resuelven por el orden en que se escriben en el
    atributo, sino por el orden en que Tailwind las emite en la hoja: anular una
    variante desde fuera funciona hasta que deja de funcionar, y sin avisar. Con
    una variante propia solo se aplica una cadena y no hay conflicto que resolver.

    El marco sigue existiendo, transparente: asi el boton no cambia de tamano al
    pasar de un estado al otro y la transicion es solo de color.
  */
  quiet: "border border-transparent text-text-secondary hover:text-foreground",
};

type Common = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function Button({
  variant = "cta",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingLabel = "Enviando...",
  className,
  children,
  disabled,
  ...rest
}: Common & { loading?: boolean; loadingLabel?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function ButtonLink({
  variant = "cta",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      {...rest}
      className={cn(base, sizes[size], variants[variant], fullWidth && "w-full", className)}
    >
      {children}
    </a>
  );
}
