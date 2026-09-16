import { FORMATS, type Formatters } from "../lib/formatNumber";
import { useLocale } from "./locale";

/** El juego de formateadores de cifras del idioma activo. Ver `lib/formatNumber.ts`. */
export function useFormat(): Formatters {
  return FORMATS[useLocale()];
}
