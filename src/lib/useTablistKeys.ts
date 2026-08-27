import { useRef, type KeyboardEvent } from "react";

/**
 * Navegacion por teclado del patron de pestañas (WAI-ARIA APG).
 *
 * Vive aparte porque lo usan dos secciones: las fichas de sector de "En la
 * practica" y los tres accesos de "Como funciona". Tenerlo dos veces era
 * garantizar que un dia se arregle un fallo en una y no en la otra.
 *
 * Acepta los dos ejes a proposito y no solo el que declara `aria-orientation`:
 * las dos listas son una fila en escritorio y una columna en movil, asi que la
 * flecha que espera quien mira la pantalla depende del ancho. `Home` y `End`
 * saltan a los extremos, y las flechas dan la vuelta al llegar al final.
 *
 * `register` monta el `tabIndex` rotatorio: solo la pestaña activa es tabulable,
 * que es lo que evita que una lista de siete obligue a dar siete tabuladores
 * para cruzarla. Mover el foco es parte del contrato del patron, no un extra:
 * sin `focus()` la seleccion avanzaria y el foco se quedaria atras.
 */
export function useTablistKeys(
  count: number,
  current: number,
  select: (index: number) => void,
) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const register = (index: number) => (node: HTMLButtonElement | null) => {
    refs.current[index] = node;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    let next = current;

    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (current + 1) % count;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (current - 1 + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    else return;

    event.preventDefault();
    select(next);
    refs.current[next]?.focus();
  };

  return { register, onKeyDown };
}
