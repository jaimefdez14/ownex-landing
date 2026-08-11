/** Une clases descartando los valores vacios. Sin dependencias. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
