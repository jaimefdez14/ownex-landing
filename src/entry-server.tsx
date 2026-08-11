import { renderToString } from "react-dom/server";
import { App } from "./App";

/**
 * Entrada de prerenderizado.
 *
 * El criterio de aceptacion del §5 exige que la pagina completa se vea y se lea
 * con JavaScript desactivado. Una aplicacion de React renderizada solo en el
 * cliente serviria un contenedor vacio, asi que el HTML se genera en el momento
 * de compilar y el cliente se limita a hidratarlo.
 */
export function render() {
  return renderToString(<App />);
}
